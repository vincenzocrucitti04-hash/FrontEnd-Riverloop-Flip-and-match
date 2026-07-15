import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { GAME_CONFIG } from "../config/gameConfig";
import {
  DECK_CATALOG,
  getDeckPokemon,
  isDeckCompatible,
} from "../config/deckCatalog";
import { createInitialGameState, gameReducer } from "../reducers/gameReducer";
import { fetchPokemon } from "../services/pokemonApi";
import { fetchPokemonFact } from "../services/pokemonFacts";
import {
  loadUserData,
  recordCompletedGame,
  saveBestRecord,
  updatePreferences,
} from "../services/storage";
import useGameTimer from "./useGameTimer";
import {
  createDeck,
  createLatestRequestManager,
  createTimeoutManager,
  getGridConfig,
  isMatch,
  selectUniquePokemonIds,
} from "../utils/gameLogic";
import { calculateScore } from "../utils/scoring";
import { classifyPokemonLoadError } from "../utils/networkError";

export default function useGameLogic(
  setMoves,
  moves = 0,
  initialOptions = null,
  onProfileUpdate = null,
) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => {
    const storedPreferences = loadUserData().preferences;
    const options = initialOptions ?? storedPreferences;
    return createInitialGameState(
      options.difficulty,
      options.previewMs,
      options.trainingMode ?? false,
      options.deck,
    );
  });
  const {
    announcement,
    cards,
    error,
    errorKind,
    flippedCardIds,
    gridSize,
    phase,
    previewMs,
    combo,
    maxCombo,
    comboBonus,
    matchedPairs,
    trainingMode,
    lastMatchedPokemon,
    deckId,
    feedback,
    feedbackCardIds,
  } = state;
  const elapsedMs = useGameTimer(phase);
  const scoreResult = calculateScore({
    difficulty: gridSize,
    matchedPairs,
    comboBonus,
    moves,
    elapsedMs,
  });
  const [bestRecord, setBestRecord] = useState(
    () => loadUserData().records[gridSize] ?? null,
  );
  const [trainingInfo, setTrainingInfo] = useState(null);
  const requestManagerRef = useRef(null);
  const timeoutManagerRef = useRef(null);
  const profileRecordedRef = useRef(false);

  if (requestManagerRef.current === null) {
    requestManagerRef.current = createLatestRequestManager();
  }
  if (timeoutManagerRef.current === null) {
    timeoutManagerRef.current = createTimeoutManager();
  }

  useEffect(() => {
    if (phase === "preview") {
      const reduceMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const previewDuration = reduceMotion ? 0 : previewMs;

      if (previewDuration === 0) {
        dispatch({ type: "PREVIEW_END" });
        return;
      }
      timeoutManagerRef.current.schedule(() => {
        dispatch({ type: "PREVIEW_END" });
      }, previewDuration);
    }
  }, [phase, previewMs]);

  useEffect(() => {
    if (phase !== "resolvingPair") {
      return;
    }

    const [firstCardId, secondCardId] = flippedCardIds;
    const firstCard = cards.find((card) => card.id === firstCardId);
    const secondCard = cards.find((card) => card.id === secondCardId);

    if (isMatch(firstCard, secondCard)) {
      dispatch({ type: "RESOLVE_MATCH", pairId: firstCard.pairId });
      return;
    }

    timeoutManagerRef.current.schedule(() => {
      dispatch({ type: "RESOLVE_MISMATCH" });
    }, GAME_CONFIG.timings.mismatchMs);
  }, [cards, flippedCardIds, phase]);

  useEffect(() => {
    if (
      phase === "playing" &&
      cards.length > 0 &&
      cards.every((card) => card.matched)
    ) {
      timeoutManagerRef.current.schedule(() => {
        dispatch({ type: "WIN" });
      }, GAME_CONFIG.timings.victoryMs);
    }
  }, [cards, phase]);

  useEffect(() => {
    setBestRecord(loadUserData().records[gridSize] ?? null);
  }, [gridSize]);

  useEffect(() => {
    if (phase === "won") {
      setBestRecord(saveBestRecord(gridSize, { timeMs: elapsedMs, moves }));
    }
  }, [elapsedMs, gridSize, moves, phase]);

  useEffect(() => {
    if (phase !== "won" || profileRecordedRef.current) {
      return;
    }

    profileRecordedRef.current = true;
    const discoveredPokemon = [
      ...new Map(
        cards.map(({ pairId, name }) => [pairId, { id: pairId, name }]),
      ).values(),
    ];
    const profile = recordCompletedGame({
      attempts: moves,
      correctPairs: matchedPairs,
      discoveredPokemon,
    });
    onProfileUpdate?.(profile);
  }, [cards, matchedPairs, moves, onProfileUpdate, phase]);

  useEffect(() => {
    if (!trainingMode || !lastMatchedPokemon) {
      setTrainingInfo(null);
      return;
    }

    const controller = new AbortController();
    setTrainingInfo({ ...lastMatchedPokemon, fact: null });

    fetchPokemonFact(lastMatchedPokemon.id, lastMatchedPokemon.name, {
      signal: controller.signal,
    })
      .then((fact) => {
        setTrainingInfo({ ...lastMatchedPokemon, fact });
      })
      .catch((error) => {
        if (error?.name !== "AbortError") {
          setTrainingInfo({ ...lastMatchedPokemon, fact: null });
        }
      });

    return () => controller.abort();
  }, [lastMatchedPokemon, trainingMode]);

  const generateCards = useCallback(async () => {
    const request = requestManagerRef.current.start();
    timeoutManagerRef.current.clearAll();
    profileRecordedRef.current = false;

    dispatch({ type: "LOAD_START" });

    const { pairs: numPairs } = getGridConfig(gridSize);
    const deck = DECK_CATALOG[deckId];

    try {
      const pokemonIds = selectUniquePokemonIds(
        numPairs,
        Math.random,
        deck.pokemonIds,
      );
      const responses = deck.offline
        ? pokemonIds.map((id) =>
            getDeckPokemon(deckId).find((pokemon) => pokemon.id === id),
          )
        : await Promise.all(
            pokemonIds.map((id) =>
              fetchPokemon(id, { signal: request.signal }),
            ),
          );

      if (!request.isCurrent()) {
        return;
      }

      const gameCards = createDeck(responses);

      dispatch({ type: "LOAD_SUCCESS", cards: gameCards });
    } catch (err) {
      if (err?.name === "AbortError" || !request.isCurrent()) {
        return;
      }

      const loadError = classifyPokemonLoadError(
        err,
        typeof navigator === "undefined" || navigator.onLine !== false,
      );
      dispatch({
        type: "LOAD_ERROR",
        error: loadError.message,
        errorKind: loadError.kind,
      });
    }
  }, [deckId, gridSize]);

  useEffect(() => {
    generateCards();

    return () => {
      requestManagerRef.current.cancel();
      timeoutManagerRef.current.clearAll();
    };
  }, [generateCards]);

  const handleRestart = () => {
    if (typeof setMoves === "function") {
      setMoves(0);
    }
    generateCards();
  };

  const handleFlip = (cardId) => {
    const clickedCard = cards.find((card) => card.id === cardId);

    if (
      phase !== "playing" ||
      !clickedCard ||
      clickedCard.flipped ||
      clickedCard.matched
    ) {
      return;
    }

    if (typeof setMoves === "function" && flippedCardIds.length === 1) {
      setMoves((prev) => prev + 1);
    }

    dispatch({ type: "FLIP_CARD", cardId });
  };

  const closeModal = () => {
    handleRestart();
  };

  return {
    cards,
    announcement,
    elapsedMs,
    bestRecord,
    minimumMoves: getGridConfig(gridSize).pairs,
    combo,
    maxCombo,
    scoreResult,
    discoveredPokemon: [
      ...new Map(
        cards.map(({ pairId, name, image }) => [
          pairId,
          { id: pairId, name, image },
        ]),
      ).values(),
    ],
    deckId,
    feedback,
    feedbackCardIds,
    trainingMode,
    trainingInfo,
    gridSize,
    previewMs,
    loading: phase === "loading",
    error,
    errorKind,
    isGameComplete: phase === "won",
    isInputLocked: phase !== "playing",
    setGridSize: (nextGridSize) => {
      setMoves?.(0);
      const nextDeckId = isDeckCompatible(deckId, nextGridSize)
        ? deckId
        : "kanto";
      updatePreferences({ difficulty: nextGridSize, deck: nextDeckId });
      dispatch({
        type: "SET_GRID_SIZE",
        gridSize: nextGridSize,
        deckId: nextDeckId,
      });
    },
    setPreviewMs: (nextPreviewMs) => {
      setMoves?.(0);
      updatePreferences({ previewMs: nextPreviewMs });
      dispatch({ type: "SET_PREVIEW_DURATION", previewMs: nextPreviewMs });
    },
    setTrainingMode: (enabled) => {
      dispatch({ type: "SET_TRAINING_MODE", enabled });
    },
    setDeckId: (nextDeckId) => {
      if (!isDeckCompatible(nextDeckId, gridSize)) {
        return;
      }
      setMoves?.(0);
      updatePreferences({ deck: nextDeckId });
      dispatch({ type: "SET_DECK", deckId: nextDeckId });
    },
    dismissTrainingInfo: () => setTrainingInfo(null),
    handleFlip,
    handleRestart,
    handleRetry: generateCards,
    handleUseOfflineDeck: () => {
      setMoves?.(0);
      updatePreferences({ deck: "offline" });
      dispatch({ type: "SET_DECK", deckId: "offline" });
    },
    closeModal,
  };
}
