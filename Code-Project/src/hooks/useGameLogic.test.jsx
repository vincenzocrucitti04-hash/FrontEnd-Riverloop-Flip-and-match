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

test("keeps loading visible for one second when Pokemon load immediately", async () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useGameLogic(vi.fn(), 0));

  await act(async () => {
    await Promise.resolve();
  });
  expect(result.current.loading).toBe(true);

  await act(async () => {
    await vi.advanceTimersByTimeAsync(999);
  });
  expect(result.current.loading).toBe(true);

  await act(async () => {
    await vi.advanceTimersByTimeAsync(1);
  });
  expect(result.current.loading).toBe(false);
  expect(result.current.cards).toHaveLength(16);
});

test("keeps loading visible after one second until a slow Pokemon load completes", async () => {
  vi.useFakeTimers();
  let resolvePokemon;
  const pokemonResponse = new Promise((resolve) => {
    resolvePokemon = resolve;
  });
  vi.mocked(fetchPokemon).mockImplementation((id) =>
    pokemonResponse.then(() => ({
      id,
      name: `pokemon-${id}`,
      image: `pokemon-${id}.png`,
    })),
  );
  const { result } = renderHook(() => useGameLogic(vi.fn(), 0));

  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });
  expect(result.current.loading).toBe(true);

  await act(async () => {
    resolvePokemon();
    await pokemonResponse;
  });
  expect(result.current.loading).toBe(false);
  expect(result.current.cards).toHaveLength(16);
});

test("keeps an early load error behind the minimum loading interval", async () => {
  vi.useFakeTimers();
  vi.mocked(fetchPokemon).mockRejectedValue(new TypeError("offline"));
  const { result } = renderHook(() => useGameLogic(vi.fn(), 0));

  await act(async () => {
    await vi.advanceTimersByTimeAsync(999);
  });
  expect(result.current.loading).toBe(true);
  expect(result.current.error).toBeNull();

  await act(async () => {
    await vi.advanceTimersByTimeAsync(1);
  });
  expect(result.current.loading).toBe(false);
  expect(result.current.errorKind).toBe("network");
});

test("aborts obsolete loading and gives the replacement request a full interval", async () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useGameLogic(vi.fn(), 0));
  const firstSignal = vi.mocked(fetchPokemon).mock.calls[0][1].signal;

  await act(async () => {
    await vi.advanceTimersByTimeAsync(500);
    result.current.setDeckId("water");
    await Promise.resolve();
  });
  expect(firstSignal.aborted).toBe(true);

  await act(async () => {
    await vi.advanceTimersByTimeAsync(500);
  });
  expect(result.current.loading).toBe(true);

  await act(async () => {
    await vi.advanceTimersByTimeAsync(500);
  });
  expect(result.current.loading).toBe(false);
  expect(result.current.deckId).toBe("water");
});

test("aborts loading and clears its delay when the hook unmounts", () => {
  vi.useFakeTimers();
  const { unmount } = renderHook(() => useGameLogic(vi.fn(), 0));
  const signal = vi.mocked(fetchPokemon).mock.calls[0][1].signal;

  expect(vi.getTimerCount()).toBe(2);
  unmount();

  expect(signal.aborted).toBe(true);
  expect(vi.getTimerCount()).toBe(0);
});

test("starts a complete local deck without network requests", async () => {
  vi.useFakeTimers();
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
    await vi.advanceTimersByTimeAsync(1000);
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
  vi.useFakeTimers();
  const waterIds = new Set([
    7, 8, 9, 54, 55, 60, 61, 62, 72, 73, 79, 80, 86, 87, 90, 91, 98, 99,
  ]);
  const { result } = renderHook(() => useGameLogic(vi.fn(), 0));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
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
  vi.useFakeTimers();
  vi.mocked(fetchPokemon).mockRejectedValue(new TypeError("offline"));
  const { result } = renderHook(() => useGameLogic(vi.fn(), 0));

  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });
  expect(result.current.errorKind).toBe("network");

  await act(async () => {
    result.current.handleUseOfflineDeck();
    await Promise.resolve();
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
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
    await vi.advanceTimersByTimeAsync(1000);
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
    await vi.advanceTimersByTimeAsync(1000);
  });
  act(() => vi.advanceTimersByTime(750));
  vi.mocked(fetchPokemon).mockClear();

  await act(async () => {
    result.current.setPreviewMs(1500);
    await vi.advanceTimersByTimeAsync(1000);
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
    await vi.advanceTimersByTimeAsync(1000);
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
    await vi.advanceTimersByTimeAsync(1000);
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
