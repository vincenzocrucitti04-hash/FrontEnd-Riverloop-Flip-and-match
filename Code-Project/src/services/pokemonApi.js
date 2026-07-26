import { GAME_CONFIG } from "../config/gameConfig";

const pokemonCache = new Map();

export class PokemonApiError extends Error {
  constructor(message, code, cause) {
    super(message, { cause });
    this.name = "PokemonApiError";
    this.code = code;
  }
}

function normalizePokemon(data) {
  const image =
    data?.image ?? data?.sprites?.[GAME_CONFIG.pokemonApi.spriteKey];

  if (!Number.isInteger(data?.id) || !data?.name || !image) {
    throw new PokemonApiError(
      "Pokemon response is invalid",
      "INVALID_RESPONSE",
    );
  }

  return {
    id: data.id,
    name: data.name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    image,
  };
}

function createAbortError() {
  return new DOMException("The request was aborted", "AbortError");
}

export function clearPokemonCache() {
  pokemonCache.clear();
}

export async function fetchPokemon(
  id,
  {
    signal,
    fetchFn = fetch,
    fallbackFn,
    timeoutMs = GAME_CONFIG.pokemonApi.timeoutMs,
  } = {},
) {
  if (signal?.aborted) {
    throw signal.reason ?? createAbortError();
  }

  if (pokemonCache.has(id)) {
    return pokemonCache.get(id);
  }

  const requestController = new AbortController();
  let timedOut = false;
  const abortRequest = () =>
    requestController.abort(signal.reason ?? createAbortError());
  signal?.addEventListener("abort", abortRequest, { once: true });

  const timeoutId = setTimeout(() => {
    timedOut = true;
    requestController.abort(
      new DOMException("The request timed out", "TimeoutError"),
    );
  }, timeoutMs);

  try {
    const response = await fetchFn(`https://pokeapi.co/api/v2/pokemon/${id}`, {
      signal: requestController.signal,
    });

    if (!response.ok) {
      throw new PokemonApiError(
        `Pokemon request failed with status ${response.status}`,
        "HTTP_ERROR",
      );
    }

    const pokemon = normalizePokemon(await response.json());
    pokemonCache.set(id, pokemon);
    return pokemon;
  } catch (error) {
    if (signal?.aborted) {
      throw signal.reason ?? createAbortError();
    }

    let domainError = error;
    if (timedOut) {
      domainError = new PokemonApiError(
        "Pokemon request timed out",
        "TIMEOUT",
        error,
      );
    } else if (!(error instanceof PokemonApiError)) {
      domainError = new PokemonApiError(
        "Pokemon request failed",
        "NETWORK_ERROR",
        error,
      );
    }

    if (typeof fallbackFn === "function") {
      const fallbackPokemon = await fallbackFn(id, domainError);
      if (fallbackPokemon) {
        const pokemon = normalizePokemon(fallbackPokemon);
        pokemonCache.set(id, pokemon);
        return pokemon;
      }
    }

    throw domainError;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", abortRequest);
  }
}
