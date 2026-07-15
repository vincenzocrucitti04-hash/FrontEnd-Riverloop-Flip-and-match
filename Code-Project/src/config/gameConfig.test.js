import assert from "node:assert/strict";
import { test } from "vitest";

import * as gameConfig from "./gameConfig.js";

test("GAME_CONFIG exposes valid grids, timings, and Pokemon API limits", () => {
  assert.equal(typeof gameConfig.validateGameConfig, "function");
  assert.equal(typeof gameConfig.GAME_CONFIG, "object");
  assert.equal(gameConfig.validateGameConfig(gameConfig.GAME_CONFIG), true);
  assert.equal(gameConfig.GAME_CONFIG.difficulties["2x2"].pairs, 2);
  assert.equal(gameConfig.GAME_CONFIG.difficulties["4x4"].pairs, 8);
  assert.equal(gameConfig.GAME_CONFIG.difficulties["6x6"].pairs, 18);
  assert.equal(gameConfig.GAME_CONFIG.pokemonApi.minId, 1);
  assert.equal(gameConfig.GAME_CONFIG.pokemonApi.maxId, 150);
  assert.deepEqual(
    gameConfig.GAME_CONFIG.previewOptions.map((option) => option.value),
    [0, 750, 1500],
  );
  assert.equal(gameConfig.GAME_CONFIG.scoring.version, 1);
  assert.deepEqual(gameConfig.GAME_CONFIG.scoring.starThresholds["4x4"], {
    two: 800,
    three: 1200,
  });
});

test("GAME_CONFIG is deeply immutable", () => {
  assert.equal(typeof gameConfig.GAME_CONFIG, "object");
  assert.equal(Object.isFrozen(gameConfig.GAME_CONFIG), true);
  assert.equal(Object.isFrozen(gameConfig.GAME_CONFIG.difficulties), true);
  assert.equal(
    Object.isFrozen(gameConfig.GAME_CONFIG.difficulties["4x4"]),
    true,
  );
  assert.throws(() => {
    gameConfig.GAME_CONFIG.timings.previewMs = 0;
  }, TypeError);
});

test("validateGameConfig rejects inconsistent grids and API limits", () => {
  assert.equal(typeof gameConfig.validateGameConfig, "function");
  const invalidConfig = {
    defaultDifficulty: "4x4",
    difficulties: {
      "4x4": {
        id: "4x4",
        label: "4x4",
        rows: 4,
        columns: 4,
        totalCards: 15,
        pairs: 8,
      },
    },
    timings: { previewMs: 750, mismatchMs: 1000, victoryMs: 500 },
    pokemonApi: {
      minId: 150,
      maxId: 1,
      timeoutMs: 5000,
      spriteKey: "front_default",
    },
  };

  assert.throws(
    () => gameConfig.validateGameConfig(invalidConfig),
    /Invalid game configuration/,
  );
});
