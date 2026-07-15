import assert from "node:assert/strict";
import { beforeEach, test, vi } from "vitest";

import * as pokemonApi from "./pokemonApi.js";

const { fetchPokemon } = pokemonApi;

beforeEach(() => {
  pokemonApi.clearPokemonCache?.();
  vi.useRealTimers();
});

test("fetchPokemon returns normalized Pokemon data and forwards the signal", async () => {
  const controller = new AbortController();
  let receivedSignal;
  const fetchFn = async (_url, options) => {
    receivedSignal = options.signal;
    return {
      ok: true,
      json: async () => ({
        id: 25,
        name: "pikachu",
        sprites: { front_default: "pikachu.png" },
      }),
    };
  };

  const pokemon = await fetchPokemon(25, {
    signal: controller.signal,
    fetchFn,
  });

  assert.ok(receivedSignal instanceof AbortSignal);
  assert.equal(receivedSignal.aborted, false);
  assert.deepEqual(pokemon, {
    id: 25,
    name: "Pikachu",
    image: "pikachu.png",
  });
});

test("fetchPokemon rejects an unsuccessful HTTP response", async () => {
  const fetchFn = async () => ({ ok: false, status: 500 });

  await assert.rejects(
    fetchPokemon(25, { fetchFn }),
    /Pokemon request failed with status 500/,
  );
});

test("fetchPokemon rejects a payload without the required fields", async () => {
  const fetchFn = async () => ({
    ok: true,
    json: async () => ({ id: 25, name: "pikachu", sprites: {} }),
  });

  await assert.rejects(
    fetchPokemon(25, { fetchFn }),
    /Pokemon response is invalid/,
  );
});

test("fetchPokemon caches normalized data for the session", async () => {
  assert.equal(typeof pokemonApi.clearPokemonCache, "function");
  let requestCount = 0;
  const fetchFn = async () => {
    requestCount += 1;
    return {
      ok: true,
      json: async () => ({
        id: 25,
        name: "pikachu",
        sprites: { front_default: "pikachu.png" },
      }),
    };
  };

  await fetchPokemon(25, { fetchFn });
  await fetchPokemon(25, { fetchFn });

  assert.equal(requestCount, 1);
});

test("fetchPokemon rejects with a domain error when the request times out", async () => {
  assert.equal(typeof pokemonApi.PokemonApiError, "function");
  vi.useFakeTimers();
  const fetchFn = (_url, { signal }) =>
    new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(signal.reason), {
        once: true,
      });
    });

  const request = fetchPokemon(25, { fetchFn, timeoutMs: 100 });
  const rejection = assert.rejects(
    request,
    (error) =>
      error instanceof pokemonApi.PokemonApiError && error.code === "TIMEOUT",
  );
  await vi.advanceTimersByTimeAsync(100);

  await rejection;
});

test("fetchPokemon uses and caches a valid local fallback", async () => {
  let requestCount = 0;
  let fallbackCount = 0;
  const fetchFn = async () => {
    requestCount += 1;
    return { ok: false, status: 503 };
  };
  const fallbackFn = async () => {
    fallbackCount += 1;
    return { id: 25, name: "pikachu", image: "local-pikachu.png" };
  };

  const firstResult = await fetchPokemon(25, { fetchFn, fallbackFn });
  const secondResult = await fetchPokemon(25, { fetchFn, fallbackFn });

  assert.deepEqual(firstResult, {
    id: 25,
    name: "Pikachu",
    image: "local-pikachu.png",
  });
  assert.deepEqual(secondResult, firstResult);
  assert.equal(requestCount, 1);
  assert.equal(fallbackCount, 1);
});

test("an external abort stays separate from errors and fallback", async () => {
  const controller = new AbortController();
  let fallbackCalled = false;
  const fetchFn = (_url, { signal }) =>
    new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(signal.reason), {
        once: true,
      });
    });

  const request = fetchPokemon(25, {
    signal: controller.signal,
    fetchFn,
    fallbackFn: async () => {
      fallbackCalled = true;
      return null;
    },
  });
  controller.abort();

  await assert.rejects(request, (error) => error?.name === "AbortError");
  assert.equal(fallbackCalled, false);
});
