import assert from "node:assert/strict";
import { test, vi } from "vitest";

import {
  createDeck,
  markPairAsMatched,
  selectUniquePokemonIds,
} from "./gameLogic.js";
import * as gameLogic from "./gameLogic.js";

test("selectUniquePokemonIds returns eight distinct ids for a 4x4 grid", () => {
  const ids = selectUniquePokemonIds(8, () => 0);

  assert.equal(ids.length, 8);
  assert.equal(new Set(ids).size, 8);
});

test("selectUniquePokemonIds returns eighteen distinct ids for a 6x6 grid", () => {
  const ids = selectUniquePokemonIds(18, () => 0.5);

  assert.equal(ids.length, 18);
  assert.equal(new Set(ids).size, 18);
});

test("selectUniquePokemonIds only samples from the selected deck", () => {
  const ids = selectUniquePokemonIds(3, () => 0, [7, 25, 54, 60]);

  assert.equal(ids.length, 3);
  assert.ok(ids.every((id) => [7, 25, 54, 60].includes(id)));
  assert.throws(
    () => selectUniquePokemonIds(5, Math.random, [1, 2]),
    /unique Pokémon/i,
  );
});

test("createDeck creates exactly two complete cards for each Pokemon", () => {
  const deck = createDeck(
    [
      { id: 25, name: "pikachu", image: "pikachu.png" },
      { id: 133, name: "eevee", image: "eevee.png" },
    ],
    () => 0.999999,
  );

  assert.equal(deck.length, 4);
  assert.deepEqual(
    deck.map((card) => card.pairId),
    [25, 25, 133, 133],
  );
  assert.equal(new Set(deck.map((card) => card.id)).size, 4);
  deck.forEach((card) => {
    assert.deepEqual(Object.keys(card).sort(), [
      "flipped",
      "id",
      "image",
      "matched",
      "name",
      "pairId",
    ]);
    assert.equal(card.flipped, false);
    assert.equal(card.matched, false);
  });
});

test("markPairAsMatched only matches the two cards with the selected pairId", () => {
  const cards = createDeck(
    [
      { id: 1, name: "bulbasaur", image: "shared.png" },
      { id: 2, name: "ivysaur", image: "shared.png" },
    ],
    () => 0.999999,
  );

  const updatedCards = markPairAsMatched(cards, 1);

  assert.equal(updatedCards.filter((card) => card.matched).length, 2);
  assert.ok(
    updatedCards
      .filter((card) => card.pairId === 1)
      .every((card) => card.matched),
  );
  assert.ok(
    updatedCards
      .filter((card) => card.pairId === 2)
      .every((card) => !card.matched),
  );
});

test("a new request aborts and invalidates the previous delayed request", async () => {
  assert.equal(typeof gameLogic.createLatestRequestManager, "function");
  const requests = gameLogic.createLatestRequestManager();
  const firstRequest = requests.start();
  let resolveFirstRequest;
  const delayedResult = new Promise((resolve) => {
    resolveFirstRequest = () =>
      resolve(firstRequest.isCurrent() ? "obsolete deck" : null);
  });

  const secondRequest = requests.start();
  resolveFirstRequest();

  assert.equal(firstRequest.signal.aborted, true);
  assert.equal(firstRequest.isCurrent(), false);
  assert.equal(await delayedResult, null);
  assert.equal(secondRequest.signal.aborted, false);
  assert.equal(secondRequest.isCurrent(), true);
});

test("cancel aborts and invalidates the active request", () => {
  assert.equal(typeof gameLogic.createLatestRequestManager, "function");
  const requests = gameLogic.createLatestRequestManager();
  const request = requests.start();

  requests.cancel();

  assert.equal(request.signal.aborted, true);
  assert.equal(request.isCurrent(), false);
});

test("clearing pending timeouts prevents callbacks from an old game", () => {
  assert.equal(typeof gameLogic.createTimeoutManager, "function");
  const pendingCallbacks = new Map();
  let nextTimeoutId = 1;
  const fakeSetTimeout = (callback) => {
    const timeoutId = nextTimeoutId;
    nextTimeoutId += 1;
    pendingCallbacks.set(timeoutId, callback);
    return timeoutId;
  };
  const fakeClearTimeout = (timeoutId) => {
    pendingCallbacks.delete(timeoutId);
  };
  const timeouts = gameLogic.createTimeoutManager(
    fakeSetTimeout,
    fakeClearTimeout,
  );
  let result = "new game";

  timeouts.schedule(() => {
    result = "old game";
  }, 1000);
  timeouts.clearAll();
  pendingCallbacks.forEach((callback) => callback());

  assert.equal(result, "new game");
});

test("waitForDelay resolves after the requested duration and aborts cleanly", async () => {
  vi.useFakeTimers();

  try {
    const controller = new AbortController();
    const completed = vi.fn();
    const waiting = gameLogic
      .waitForDelay(1000, controller.signal)
      .then(completed);

    await vi.advanceTimersByTimeAsync(999);
    assert.equal(completed.mock.calls.length, 0);
    await vi.advanceTimersByTimeAsync(1);
    await waiting;
    assert.equal(completed.mock.calls.length, 1);

    const abortedController = new AbortController();
    const aborted = gameLogic.waitForDelay(1000, abortedController.signal);
    abortedController.abort();

    await assert.rejects(aborted, { name: "AbortError" });
  } finally {
    vi.useRealTimers();
  }
});

test("shuffle returns a deterministic permutation without mutating its input", () => {
  assert.equal(typeof gameLogic.shuffle, "function");
  const items = [1, 2, 3, 4];

  const shuffledItems = gameLogic.shuffle(items, () => 0);

  assert.deepEqual(items, [1, 2, 3, 4]);
  assert.deepEqual(shuffledItems, [2, 3, 4, 1]);
});

test("createDeck uses the injected random generator to shuffle cards", () => {
  const deck = createDeck(
    [
      { id: 25, name: "pikachu", image: "pikachu.png" },
      { id: 133, name: "eevee", image: "eevee.png" },
    ],
    () => 0,
  );

  assert.deepEqual(
    deck.map((card) => card.pairId),
    [25, 133, 133, 25],
  );
});

test("isMatch compares cards by pairId", () => {
  assert.equal(typeof gameLogic.isMatch, "function");
  assert.equal(gameLogic.isMatch({ pairId: 25 }, { pairId: 25 }), true);
  assert.equal(gameLogic.isMatch({ pairId: 25 }, { pairId: 133 }), false);
});

test("isMatch rejects missing cards and pair identifiers", () => {
  assert.equal(typeof gameLogic.isMatch, "function");
  assert.equal(gameLogic.isMatch(null, { pairId: 25 }), false);
  assert.equal(gameLogic.isMatch({}, {}), false);
});

test("getGridConfig returns the supported grid dimensions", () => {
  assert.equal(typeof gameLogic.getGridConfig, "function");
  assert.deepEqual(gameLogic.getGridConfig("4x4"), {
    rows: 4,
    columns: 4,
    totalCards: 16,
    pairs: 8,
  });
  assert.deepEqual(gameLogic.getGridConfig("6x6"), {
    rows: 6,
    columns: 6,
    totalCards: 36,
    pairs: 18,
  });
});

test("getGridConfig rejects an unsupported grid size", () => {
  assert.equal(typeof gameLogic.getGridConfig, "function");
  assert.throws(
    () => gameLogic.getGridConfig("5x5"),
    /Unsupported grid size: 5x5/,
  );
});

test("deck and shuffle utilities handle empty arrays", () => {
  assert.deepEqual(createDeck([]), []);
  assert.deepEqual(gameLogic.shuffle([]), []);
});
