import { GAME_CONFIG } from "../config/gameConfig";
import { markPairAsMatched } from "../utils/gameLogic";

export function createInitialGameState(
  gridSize = GAME_CONFIG.defaultDifficulty,
  previewMs = GAME_CONFIG.defaultPreviewMs,
  trainingMode = false,
  deckId = "kanto",
) {
  return {
    phase: "loading",
    gridSize,
    previewMs,
    cards: [],
    flippedCardIds: [],
    combo: 0,
    maxCombo: 0,
    comboBonus: 0,
    matchedPairs: 0,
    trainingMode,
    lastMatchedPokemon: null,
    deckId,
    feedback: null,
    feedbackCardIds: [],
    error: null,
    errorKind: null,
    announcement: "Caricamento Pokémon in corso.",
  };
}

export function gameReducer(state, action) {
  switch (action.type) {
    case "LOAD_START":
      return createInitialGameState(
        state.gridSize,
        state.previewMs,
        state.trainingMode,
        state.deckId,
      );

    case "LOAD_SUCCESS":
      if (state.phase !== "loading") {
        return state;
      }
      return {
        ...state,
        phase: "preview",
        cards: action.cards.map((card) => ({ ...card, flipped: true })),
        announcement: "Memorizza le carte.",
      };

    case "PREVIEW_END":
      if (state.phase !== "preview") {
        return state;
      }
      return {
        ...state,
        phase: "playing",
        cards: state.cards.map((card) => ({ ...card, flipped: false })),
        announcement: "Partita iniziata.",
      };

    case "SET_GRID_SIZE":
      if (action.gridSize === state.gridSize) {
        return state;
      }
      return createInitialGameState(
        action.gridSize,
        state.previewMs,
        state.trainingMode,
        action.deckId ?? state.deckId,
      );

    case "SET_PREVIEW_DURATION":
      if (action.previewMs === state.previewMs) {
        return state;
      }
      return createInitialGameState(
        state.gridSize,
        action.previewMs,
        state.trainingMode,
        state.deckId,
      );

    case "SET_DECK":
      if (action.deckId === state.deckId) {
        return state;
      }
      return createInitialGameState(
        state.gridSize,
        state.previewMs,
        state.trainingMode,
        action.deckId,
      );

    case "SET_TRAINING_MODE":
      return {
        ...state,
        trainingMode: Boolean(action.enabled),
        lastMatchedPokemon: action.enabled ? state.lastMatchedPokemon : null,
      };

    case "FLIP_CARD": {
      if (state.phase !== "playing") {
        return state;
      }

      const selectedCard = state.cards.find(
        (card) => card.id === action.cardId,
      );
      if (!selectedCard || selectedCard.flipped || selectedCard.matched) {
        return state;
      }

      const flippedCardIds = [...state.flippedCardIds, action.cardId];
      return {
        ...state,
        phase: flippedCardIds.length === 2 ? "resolvingPair" : state.phase,
        cards: state.cards.map((card) =>
          card.id === action.cardId ? { ...card, flipped: true } : card,
        ),
        flippedCardIds,
        feedback: null,
        feedbackCardIds: [],
        announcement: "",
      };
    }

    case "RESOLVE_MATCH": {
      if (state.phase !== "resolvingPair") {
        return state;
      }
      const matchedCard = state.cards.find(
        (card) => card.pairId === action.pairId,
      );
      const nextCombo = state.combo + 1;
      return {
        ...state,
        phase: "playing",
        cards: markPairAsMatched(state.cards, action.pairId),
        flippedCardIds: [],
        combo: nextCombo,
        maxCombo: Math.max(state.maxCombo, nextCombo),
        comboBonus:
          state.comboBonus +
          (nextCombo - 1) * GAME_CONFIG.scoring.comboStepBonus,
        matchedPairs: state.matchedPairs + 1,
        lastMatchedPokemon: {
          id: matchedCard.pairId,
          name: matchedCard.name,
        },
        feedback: "match",
        feedbackCardIds: state.flippedCardIds,
        announcement: `Coppia trovata: ${matchedCard.name}.`,
      };
    }

    case "RESOLVE_MISMATCH":
      if (state.phase !== "resolvingPair") {
        return state;
      }
      return {
        ...state,
        phase: "playing",
        cards: state.cards.map((card) =>
          state.flippedCardIds.includes(card.id)
            ? { ...card, flipped: false }
            : card,
        ),
        flippedCardIds: [],
        combo: 0,
        feedback: "mismatch",
        feedbackCardIds: state.flippedCardIds,
        announcement: "Le carte non formano una coppia.",
      };

    case "WIN":
      if (
        state.phase !== "playing" ||
        state.cards.length === 0 ||
        !state.cards.every((card) => card.matched)
      ) {
        return state;
      }
      return {
        ...state,
        phase: "won",
        announcement: "Partita completata!",
      };

    case "LOAD_ERROR":
      return {
        ...createInitialGameState(
          state.gridSize,
          state.previewMs,
          state.trainingMode,
          state.deckId,
        ),
        phase: "error",
        error: action.error,
        errorKind: action.errorKind,
        announcement: action.error,
      };

    default:
      return state;
  }
}
