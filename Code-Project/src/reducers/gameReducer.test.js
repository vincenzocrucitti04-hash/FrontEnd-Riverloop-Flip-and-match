import assert from "node:assert/strict";
import { test } from "vitest";

import * as gameState from "./gameReducer.js";

const cards = [
  {
    id: "1-1",
    pairId: 1,
    name: "Bulbasaur",
    image: "bulbasaur.png",
    flipped: false,
    matched: false,
  },
  {
    id: "1-2",
    pairId: 1,
    name: "Bulbasaur",
    image: "bulbasaur.png",
    flipped: false,
    matched: false,
  },
  {
    id: "2-1",
    pairId: 2,
    name: "Ivysaur",
    image: "ivysaur.png",
    flipped: false,
    matched: false,
  },
];

test("loading a deck transitions through preview to playing", () => {
  assert.equal(typeof gameState.gameReducer, "function");
  assert.equal(typeof gameState.createInitialGameState, "function");
  const initialState = gameState.createInitialGameState();

  const loadingState = gameState.gameReducer(initialState, {
    type: "LOAD_START",
  });
  const previewState = gameState.gameReducer(loadingState, {
    type: "LOAD_SUCCESS",
    cards,
  });
  const playingState = gameState.gameReducer(previewState, {
    type: "PREVIEW_END",
  });

  assert.equal(loadingState.phase, "loading");
  assert.equal(previewState.phase, "preview");
  assert.ok(previewState.cards.every((card) => card.flipped));
  assert.equal(playingState.phase, "playing");
  assert.ok(playingState.cards.every((card) => !card.flipped));
});

test("a third card is ignored while a pair is resolving", () => {
  const initialState = {
    ...gameState.createInitialGameState(),
    phase: "playing",
    cards,
  };
  const firstFlip = gameState.gameReducer(initialState, {
    type: "FLIP_CARD",
    cardId: "1-1",
  });
  const secondFlip = gameState.gameReducer(firstFlip, {
    type: "FLIP_CARD",
    cardId: "2-1",
  });
  const thirdFlip = gameState.gameReducer(secondFlip, {
    type: "FLIP_CARD",
    cardId: "1-2",
  });

  assert.equal(secondFlip.phase, "resolvingPair");
  assert.deepEqual(secondFlip.flippedCardIds, ["1-1", "2-1"]);
  assert.equal(thirdFlip, secondFlip);
});

test("resolving a match marks only its pair and resumes play", () => {
  const resolvingState = {
    ...gameState.createInitialGameState(),
    phase: "resolvingPair",
    cards: cards.map((card) =>
      card.id === "1-1" || card.id === "1-2"
        ? { ...card, flipped: true }
        : card,
    ),
    flippedCardIds: ["1-1", "1-2"],
  };

  const nextState = gameState.gameReducer(resolvingState, {
    type: "RESOLVE_MATCH",
    pairId: 1,
  });

  assert.equal(nextState.phase, "playing");
  assert.deepEqual(nextState.flippedCardIds, []);
  assert.equal(nextState.cards.filter((card) => card.matched).length, 2);
  assert.equal(nextState.combo, 1);
  assert.equal(nextState.maxCombo, 1);
  assert.equal(nextState.comboBonus, 0);
  assert.equal(nextState.feedback, "match");
  assert.deepEqual(nextState.feedbackCardIds, ["1-1", "1-2"]);
});

test("consecutive matches increase combo and its cumulative bonus", () => {
  const resolvingState = {
    ...gameState.createInitialGameState(),
    phase: "resolvingPair",
    cards,
    flippedCardIds: ["1-1", "1-2"],
    combo: 2,
    maxCombo: 2,
    comboBonus: 25,
  };

  const nextState = gameState.gameReducer(resolvingState, {
    type: "RESOLVE_MATCH",
    pairId: 1,
  });

  assert.equal(nextState.combo, 3);
  assert.equal(nextState.maxCombo, 3);
  assert.equal(nextState.comboBonus, 75);
});

test("load errors and a completed game have explicit phases", () => {
  const initialState = gameState.createInitialGameState();
  const errorState = gameState.gameReducer(initialState, {
    type: "LOAD_ERROR",
    error: "Unable to load Pokémon.",
  });
  const wonState = gameState.gameReducer(
    {
      ...initialState,
      phase: "playing",
      cards: cards.map((card) => ({ ...card, matched: true })),
    },
    { type: "WIN" },
  );

  assert.equal(errorState.phase, "error");
  assert.equal(errorState.error, "Unable to load Pokémon.");
  assert.equal(wonState.phase, "won");
});

test("invalid transitions preserve the current state", () => {
  const initialState = gameState.createInitialGameState();

  assert.equal(
    gameState.gameReducer(initialState, { type: "PREVIEW_END" }),
    initialState,
  );
  assert.equal(
    gameState.gameReducer(initialState, {
      type: "FLIP_CARD",
      cardId: "1-1",
    }),
    initialState,
  );
  assert.equal(
    gameState.gameReducer(initialState, { type: "WIN" }),
    initialState,
  );
});

test("a mismatch closes only the resolving cards", () => {
  const resolvingState = {
    ...gameState.createInitialGameState(),
    phase: "resolvingPair",
    cards: cards.map((card) =>
      card.id === "1-1" || card.id === "2-1"
        ? { ...card, flipped: true }
        : card,
    ),
    flippedCardIds: ["1-1", "2-1"],
    combo: 3,
    maxCombo: 3,
    comboBonus: 75,
  };

  const nextState = gameState.gameReducer(resolvingState, {
    type: "RESOLVE_MISMATCH",
  });

  assert.equal(nextState.phase, "playing");
  assert.deepEqual(nextState.flippedCardIds, []);
  assert.ok(nextState.cards.every((card) => !card.flipped));
  assert.equal(nextState.combo, 0);
  assert.equal(nextState.maxCombo, 3);
  assert.equal(nextState.comboBonus, 75);
  assert.equal(nextState.feedback, "mismatch");
  assert.deepEqual(nextState.feedbackCardIds, ["1-1", "2-1"]);
});

test("new card input clears feedback from the previous attempt", () => {
  const playingState = {
    ...gameState.createInitialGameState(),
    phase: "playing",
    cards,
    feedback: "mismatch",
    feedbackCardIds: ["1-1", "2-1"],
  };

  const nextState = gameState.gameReducer(playingState, {
    type: "FLIP_CARD",
    cardId: "1-1",
  });

  assert.equal(nextState.feedback, null);
  assert.deepEqual(nextState.feedbackCardIds, []);
});

test("changing grid size resets the game on the new configuration", () => {
  const playingState = {
    ...gameState.createInitialGameState(),
    phase: "playing",
    cards,
  };

  const nextState = gameState.gameReducer(playingState, {
    type: "SET_GRID_SIZE",
    gridSize: "6x6",
  });

  assert.equal(nextState.gridSize, "6x6");
  assert.equal(nextState.phase, "loading");
  assert.deepEqual(nextState.cards, []);
});

test("changing preview duration resets the game and preserves the grid", () => {
  const playingState = {
    ...gameState.createInitialGameState(),
    phase: "playing",
    cards,
  };

  const nextState = gameState.gameReducer(playingState, {
    type: "SET_PREVIEW_DURATION",
    previewMs: 0,
  });

  assert.equal(nextState.previewMs, 0);
  assert.equal(nextState.gridSize, "4x4");
  assert.equal(nextState.phase, "loading");
});

test("training mode is explicit and survives a game reload", () => {
  const initialState = gameState.createInitialGameState();
  const trainingState = gameState.gameReducer(initialState, {
    type: "SET_TRAINING_MODE",
    enabled: true,
  });
  const loadingState = gameState.gameReducer(trainingState, {
    type: "LOAD_START",
  });

  assert.equal(trainingState.trainingMode, true);
  assert.equal(loadingState.trainingMode, true);
});

test("changing deck resets cards and preserves the selected deck on reload", () => {
  const initialState = {
    ...gameState.createInitialGameState(),
    phase: "playing",
    cards,
  };
  const deckState = gameState.gameReducer(initialState, {
    type: "SET_DECK",
    deckId: "water",
  });
  const loadingState = gameState.gameReducer(deckState, {
    type: "LOAD_START",
  });

  assert.equal(deckState.deckId, "water");
  assert.equal(deckState.phase, "loading");
  assert.deepEqual(deckState.cards, []);
  assert.equal(loadingState.deckId, "water");
});

test("game transitions expose concise announcements", () => {
  const initialState = gameState.createInitialGameState();
  assert.equal(initialState.announcement, "Caricamento Pokémon in corso.");

  const resolvingState = {
    ...initialState,
    phase: "resolvingPair",
    cards,
    flippedCardIds: ["1-1", "1-2"],
  };
  const matchedState = gameState.gameReducer(resolvingState, {
    type: "RESOLVE_MATCH",
    pairId: 1,
  });
  assert.equal(matchedState.announcement, "Coppia trovata: Bulbasaur.");

  const wonState = gameState.gameReducer(
    {
      ...matchedState,
      cards: cards.map((card) => ({ ...card, matched: true })),
    },
    { type: "WIN" },
  );
  assert.equal(wonState.announcement, "Partita completata!");

  const errorState = gameState.gameReducer(initialState, {
    type: "LOAD_ERROR",
    error: "Unable to load Pokémon.",
  });
  assert.equal(errorState.announcement, "Unable to load Pokémon.");
});
