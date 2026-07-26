import { beforeEach, expect, test } from "vitest";

import * as storageService from "./storage";

beforeEach(() => {
  localStorage.clear();
});

test("returns versioned default data when storage is empty", () => {
  expect(typeof storageService.loadUserData).toBe("function");
  expect(storageService.loadUserData()).toEqual({
    version: 2,
    preferences: {
      theme: "system",
      difficulty: "4x4",
      deck: "kanto",
      previewMs: 750,
    },
    records: {},
    profile: {
      gamesCompleted: 0,
      totalAttempts: 0,
      correctPairs: 0,
      currentWinStreak: 0,
      bestWinStreak: 0,
      discoveredPokemon: [],
    },
  });
});

test("updates preferences without discarding records", () => {
  expect(typeof storageService.updatePreferences).toBe("function");
  localStorage.setItem(
    "flip-and-match:user-data",
    JSON.stringify({
      version: 2,
      preferences: {
        theme: "light",
        difficulty: "4x4",
        deck: "kanto",
        previewMs: 750,
      },
      records: { "4x4": { timeMs: 12000, moves: 10 } },
      profile: {
        gamesCompleted: 0,
        totalAttempts: 0,
        correctPairs: 0,
        currentWinStreak: 0,
        bestWinStreak: 0,
        discoveredPokemon: [],
      },
    }),
  );

  const data = storageService.updatePreferences({
    theme: "dark",
    difficulty: "2x2",
    previewMs: 0,
    deck: "water",
  });

  expect(data.preferences).toEqual({
    theme: "dark",
    difficulty: "2x2",
    deck: "water",
    previewMs: 0,
  });
  expect(data.records["4x4"]).toEqual({ timeMs: 12000, moves: 10 });
});

test("corrupt, outdated, or invalid data falls back to safe defaults", () => {
  localStorage.setItem("flip-and-match:user-data", "not-json");
  expect(storageService.loadUserData().preferences.theme).toBe("system");

  localStorage.setItem(
    "flip-and-match:user-data",
    JSON.stringify({ version: 0, preferences: {}, records: {} }),
  );
  expect(storageService.loadUserData().version).toBe(2);

  localStorage.setItem(
    "flip-and-match:user-data",
    JSON.stringify({
      version: 2,
      preferences: {
        theme: "neon",
        difficulty: "99x99",
        deck: "",
        previewMs: -1,
      },
      records: {},
      profile: {},
    }),
  );
  expect(storageService.loadUserData().preferences).toEqual({
    theme: "system",
    difficulty: "4x4",
    deck: "kanto",
    previewMs: 750,
  });
});

test("migrates version 1 data without losing preferences or records", () => {
  localStorage.setItem(
    "flip-and-match:user-data",
    JSON.stringify({
      version: 1,
      preferences: {
        theme: "dark",
        difficulty: "2x2",
        deck: "offline",
        previewMs: 0,
      },
      records: { "2x2": { timeMs: 9000, moves: 2 } },
    }),
  );

  const data = storageService.loadUserData();
  expect(data.version).toBe(2);
  expect(data.preferences.theme).toBe("dark");
  expect(data.records["2x2"]).toEqual({ timeMs: 9000, moves: 2 });
  expect(data.profile.gamesCompleted).toBe(0);
});

test("records completed games, accuracy inputs, streak, and unique discoveries", () => {
  const firstProfile = storageService.recordCompletedGame({
    attempts: 5,
    correctPairs: 2,
    discoveredPokemon: [
      { id: 1, name: "Bulbasaur" },
      { id: 4, name: "Charmander" },
    ],
  });
  const secondProfile = storageService.recordCompletedGame({
    attempts: 3,
    correctPairs: 2,
    discoveredPokemon: [
      { id: 1, name: "Bulbasaur" },
      { id: 7, name: "Squirtle" },
    ],
  });

  expect(firstProfile.gamesCompleted).toBe(1);
  expect(secondProfile).toMatchObject({
    gamesCompleted: 2,
    totalAttempts: 8,
    correctPairs: 4,
    currentWinStreak: 2,
    bestWinStreak: 2,
  });
  expect(secondProfile.discoveredPokemon).toEqual([
    { id: 1, name: "Bulbasaur" },
    { id: 4, name: "Charmander" },
    { id: 7, name: "Squirtle" },
  ]);

  expect(storageService.resetProfile().gamesCompleted).toBe(0);
  expect(storageService.loadUserData().records).toEqual({});
});

test("updates a record only for a faster time or fewer moves at equal time", () => {
  expect(typeof storageService.saveBestRecord).toBe("function");

  expect(
    storageService.saveBestRecord("4x4", { timeMs: 12000, moves: 12 }),
  ).toEqual({ timeMs: 12000, moves: 12 });
  expect(
    storageService.saveBestRecord("4x4", { timeMs: 13000, moves: 8 }),
  ).toEqual({ timeMs: 12000, moves: 12 });
  expect(
    storageService.saveBestRecord("4x4", { timeMs: 12000, moves: 10 }),
  ).toEqual({ timeMs: 12000, moves: 10 });
  expect(storageService.loadUserData().records["4x4"]).toEqual({
    timeMs: 12000,
    moves: 10,
  });
});

test("write failures degrade gracefully without throwing into the UI", () => {
  const unavailableStorage = {
    getItem: () => null,
    setItem: () => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    },
  };

  expect(() =>
    storageService.updatePreferences({ theme: "dark" }, unavailableStorage),
  ).not.toThrow();
  expect(() =>
    storageService.saveBestRecord(
      "4x4",
      { timeMs: 12000, moves: 8 },
      unavailableStorage,
    ),
  ).not.toThrow();
  expect(() =>
    storageService.recordCompletedGame(
      {
        attempts: 8,
        correctPairs: 8,
        discoveredPokemon: [{ id: 1, name: "Bulbasaur" }],
      },
      unavailableStorage,
    ),
  ).not.toThrow();
  expect(() => storageService.resetProfile(unavailableStorage)).not.toThrow();
});

test("malformed records are rejected during storage validation", () => {
  localStorage.setItem(
    "flip-and-match:user-data",
    JSON.stringify({
      version: 2,
      preferences: {
        theme: "system",
        difficulty: "4x4",
        deck: "kanto",
        previewMs: 750,
      },
      records: { "4x4": { timeMs: "fast", moves: undefined } },
      profile: {
        gamesCompleted: 0,
        totalAttempts: 0,
        correctPairs: 0,
        currentWinStreak: 0,
        bestWinStreak: 0,
        discoveredPokemon: [],
      },
    }),
  );

  expect(storageService.loadUserData().records).toEqual({});
});
