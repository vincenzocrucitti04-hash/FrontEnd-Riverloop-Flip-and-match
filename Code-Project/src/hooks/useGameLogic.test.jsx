import { act, renderHook } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, test, vi } from "vitest";

import useGameLogic from "./useGameLogic";
import { fetchPokemon } from "../services/pokemonApi";

vi.mock("../services/pokemonApi", () => ({
  fetchPokemon: vi.fn(async (id) => ({
    id,
    name: `pokemon-${id}`,
    image: `pokemon-${id}.png`,
  })),
}));

vi.mock("../services/pokemonFacts", () => ({
  fetchPokemonFact: vi.fn(async (id, name) =>
    Promise.resolve(`${name} è una curiosità locale.`),
  ),
}));

afterEach(() => {
  vi.useRealTimers();
  vi.mocked(fetchPokemon).mockReset();
  vi.mocked(fetchPokemon).mockImplementation(async (id) => ({
    id,
    name: `pokemon-${id}`,
    image: `pokemon-${id}.png`,
  }));
});

test("starts a complete local deck without network requests", async () => {
  localStorage.setItem(
    "flip-and-match:user-data",
    JSON.stringify({
      version: 1,
      preferences: {
        theme: "system",
        difficulty: "6x6",
        deck: "offline",
        previewMs: 750,
      },
      records: {},
    }),
  );
  vi.mocked(fetchPokemon).mockClear();

  const { result } = renderHook(() => useGameLogic(vi.fn(), 0));
  await act(async () => {
    await Promise.resolve();
  });

  expect(result.current.cards).toHaveLength(36);
  expect(
    result.current.cards.every(({ image }) =>
      image.startsWith("data:image/svg+xml"),
    ),
  ).toBe(true);
  expect(fetchPokemon).not.toHaveBeenCalled();
});

test("a thematic deck only requests Pokemon from its catalog", async () => {
  const waterIds = new Set([
    7, 8, 9, 54, 55, 60, 61, 62, 72, 73, 79, 80, 86, 87, 90, 91, 98, 99,
  ]);
  const { result } = renderHook(() => useGameLogic(vi.fn(), 0));
  await act(async () => {
    await Promise.resolve();
  });
  vi.mocked(fetchPokemon).mockClear();

  await act(async () => {
    result.current.setDeckId("water");
    await Promise.resolve();
  });

  const requestedIds = vi.mocked(fetchPokemon).mock.calls.map(([id]) => id);
  expect(requestedIds).toHaveLength(8);
  expect(requestedIds.every((id) => waterIds.has(id))).toBe(true);
});

test("recovers from a network error by switching explicitly to the local deck", async () => {
  vi.mocked(fetchPokemon).mockRejectedValue(new TypeError("offline"));
  const { result } = renderHook(() => useGameLogic(vi.fn(), 0));

  await act(async () => {
    await Promise.resolve();
  });
  expect(result.current.errorKind).toBe("network");

  await act(async () => {
    result.current.handleUseOfflineDeck();
    await Promise.resolve();
  });

  expect(result.current.error).toBeNull();
  expect(result.current.deckId).toBe("offline");
  expect(result.current.cards).toHaveLength(16);
});

test("loads a 4x4 deck and ends its preview", async () => {
  vi.useFakeTimers();
  const setMoves = vi.fn();

  const { result } = renderHook(() => useGameLogic(setMoves));

  expect(result.current.loading).toBe(true);
  await act(async () => {
    await Promise.resolve();
  });
  expect(result.current.cards).toHaveLength(16);
  expect(result.current.cards.every((card) => card.flipped)).toBe(true);

  act(() => {
    vi.advanceTimersByTime(750);
  });

  expect(result.current.loading).toBe(false);
  expect(result.current.cards.every((card) => !card.flipped)).toBe(true);
});

test("reloads the deck after changing preview duration", async () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useGameLogic(vi.fn(), 0));
  await act(async () => {
    await Promise.resolve();
  });
  act(() => vi.advanceTimersByTime(750));
  vi.mocked(fetchPokemon).mockClear();

  await act(async () => {
    result.current.setPreviewMs(1500);
    await Promise.resolve();
  });

  expect(result.current.loading).toBe(false);
  expect(result.current.cards).toHaveLength(16);
  expect(result.current.cards.every(({ flipped }) => flipped)).toBe(true);
  expect(fetchPokemon).toHaveBeenCalledTimes(8);
});

test("shows optional training information only after a matched pair", async () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useGameLogic(vi.fn(), 0));

  await act(async () => {
    await Promise.resolve();
  });
  act(() => {
    vi.advanceTimersByTime(750);
    result.current.setTrainingMode(true);
  });

  const firstCard = result.current.cards[0];
  const secondCard = result.current.cards.find(
    (card) => card.pairId === firstCard.pairId && card.id !== firstCard.id,
  );

  act(() => result.current.handleFlip(firstCard.id));
  act(() => result.current.handleFlip(secondCard.id));
  await act(async () => {
    await Promise.resolve();
  });

  expect(result.current.trainingInfo).toEqual({
    id: firstCard.pairId,
    name: firstCard.name,
    fact: `${firstCard.name} è una curiosità locale.`,
  });
  act(() => result.current.dismissTrainingInfo());
  expect(result.current.trainingInfo).toBeNull();
});

test("updates the local profile once and only after a valid victory", async () => {
  vi.useFakeTimers();
  localStorage.setItem(
    "flip-and-match:user-data",
    JSON.stringify({
      version: 1,
      preferences: {
        theme: "system",
        difficulty: "2x2",
        deck: "offline",
        previewMs: 0,
      },
      records: {},
    }),
  );
  const onProfileUpdate = vi.fn();
  const { result } = renderHook(() => {
    const [moves, setMoves] = useState(0);
    return useGameLogic(setMoves, moves, null, onProfileUpdate);
  });

  await act(async () => {
    await Promise.resolve();
  });
  expect(onProfileUpdate).not.toHaveBeenCalled();

  const pairIds = [
    ...new Set(result.current.cards.map(({ pairId }) => pairId)),
  ];
  pairIds.forEach((pairId) => {
    const pair = result.current.cards.filter((card) => card.pairId === pairId);
    act(() => result.current.handleFlip(pair[0].id));
    act(() => result.current.handleFlip(pair[1].id));
  });
  await act(async () => {
    vi.advanceTimersByTime(500);
    await Promise.resolve();
  });

  expect(onProfileUpdate).toHaveBeenCalledOnce();
  expect(onProfileUpdate.mock.calls[0][0]).toMatchObject({
    gamesCompleted: 1,
    totalAttempts: 2,
    correctPairs: 2,
  });
});
