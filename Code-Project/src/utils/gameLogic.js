import { GAME_CONFIG } from "../config/gameConfig";

export function selectUniquePokemonIds(
  count,
  random = Math.random,
  allowedIds = null,
) {
  const { minId, maxId } = GAME_CONFIG.pokemonApi;
  const availableIds = allowedIds
    ? [...new Set(allowedIds)]
    : Array.from({ length: maxId - minId + 1 }, (_, index) => index + minId);

  if (availableIds.length < count) {
    throw new RangeError(`Not enough unique Pokémon: requested ${count}`);
  }

  for (let index = 0; index < count; index += 1) {
    const randomIndex =
      index + Math.floor(random() * (availableIds.length - index));
    [availableIds[index], availableIds[randomIndex]] = [
      availableIds[randomIndex],
      availableIds[index],
    ];
  }

  return availableIds.slice(0, count);
}

export function shuffle(items, random = Math.random) {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [shuffledItems[index], shuffledItems[randomIndex]] = [
      shuffledItems[randomIndex],
      shuffledItems[index],
    ];
  }

  return shuffledItems;
}

export function createDeck(pokemon, random = Math.random) {
  const cards = pokemon.flatMap(({ id: pairId, name, image }) =>
    [0, 1].map((copyIndex) => ({
      id: `${pairId}-${copyIndex + 1}`,
      pairId,
      name,
      image,
      flipped: false,
      matched: false,
    })),
  );

  return shuffle(cards, random);
}

export function markPairAsMatched(cards, pairId) {
  return cards.map((card) =>
    card.pairId === pairId ? { ...card, matched: true } : card,
  );
}

export function isMatch(firstCard, secondCard) {
  return (
    firstCard?.pairId !== undefined &&
    secondCard?.pairId !== undefined &&
    firstCard.pairId === secondCard.pairId
  );
}

export function getGridConfig(gridSize) {
  const config = GAME_CONFIG.difficulties[gridSize];

  if (!config) {
    throw new RangeError(`Unsupported grid size: ${gridSize}`);
  }

  const { rows, columns, totalCards, pairs } = config;
  return { rows, columns, totalCards, pairs };
}

export function createLatestRequestManager() {
  let activeController = null;

  return {
    start() {
      activeController?.abort();

      const controller = new AbortController();
      activeController = controller;

      return {
        signal: controller.signal,
        isCurrent: () =>
          activeController === controller && !controller.signal.aborted,
      };
    },
    cancel() {
      activeController?.abort();
      activeController = null;
    },
  };
}

export function waitForDelay(delayMs, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timeoutId = setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve();
    }, delayMs);

    function handleAbort() {
      clearTimeout(timeoutId);
      reject(new DOMException("Aborted", "AbortError"));
    }

    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

export function createTimeoutManager(
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
) {
  const timeoutIds = new Set();

  return {
    schedule(callback, delay) {
      const timeoutId = setTimeoutFn(() => {
        timeoutIds.delete(timeoutId);
        callback();
      }, delay);
      timeoutIds.add(timeoutId);
      return timeoutId;
    },
    clearAll() {
      timeoutIds.forEach((timeoutId) => clearTimeoutFn(timeoutId));
      timeoutIds.clear();
    },
  };
}
