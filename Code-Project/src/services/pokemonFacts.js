import { GAME_CONFIG } from "../config/gameConfig";

const factsCache = new Map();

export function getLocalPokemonFact(id, name) {
  if (
    id >= GAME_CONFIG.pokemonApi.minId &&
    id <= GAME_CONFIG.pokemonApi.maxId
  ) {
    return `${name} fa parte dei primi 150 Pokémon scoperti nella regione di Kanto.`;
  }

  return `Hai trovato una coppia di ${name}.`;
}

function normalizeFact(value) {
  return value
    ?.replace(/[\n\f\r]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function clearPokemonFactsCache() {
  factsCache.clear();
}

export async function fetchPokemonFact(
  id,
  name,
  {
    signal,
    fetchFn = fetch,
    timeoutMs = GAME_CONFIG.pokemonApi.timeoutMs,
  } = {},
) {
  if (signal?.aborted) {
    throw signal.reason ?? new DOMException("Aborted", "AbortError");
  }

  if (factsCache.has(id)) {
    return factsCache.get(id);
  }

  const controller = new AbortController();
  const abortRequest = () =>
    controller.abort(
      signal.reason ?? new DOMException("Aborted", "AbortError"),
    );
  signal?.addEventListener("abort", abortRequest, { once: true });
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchFn(
      `https://pokeapi.co/api/v2/pokemon-species/${id}`,
      { signal: controller.signal },
    );

    if (!response.ok) {
      throw new Error(`Species request failed with status ${response.status}`);
    }

    const entries = (await response.json())?.flavor_text_entries ?? [];
    const selectedEntry =
      entries.find((entry) => entry?.language?.name === "it") ??
      entries.find((entry) => entry?.language?.name === "en");
    const fact = normalizeFact(selectedEntry?.flavor_text);

    if (!fact) {
      throw new Error("Species description is unavailable");
    }

    factsCache.set(id, fact);
    return fact;
  } catch (error) {
    if (signal?.aborted) {
      throw signal.reason ?? error;
    }

    const fallbackFact = getLocalPokemonFact(id, name);
    factsCache.set(id, fallbackFact);
    return fallbackFact;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", abortRequest);
  }
}
