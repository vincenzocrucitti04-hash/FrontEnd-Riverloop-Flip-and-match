import { GAME_CONFIG } from "./gameConfig";

const KANTO_IDS = Array.from({ length: 150 }, (_, index) => index + 1);
const OFFLINE_NAMES = [
  "Bulbasaur",
  "Ivysaur",
  "Venusaur",
  "Charmander",
  "Charmeleon",
  "Charizard",
  "Squirtle",
  "Wartortle",
  "Blastoise",
  "Caterpie",
  "Metapod",
  "Butterfree",
  "Weedle",
  "Kakuna",
  "Beedrill",
  "Pidgey",
  "Pidgeotto",
  "Pidgeot",
];

function createOfflineBadge(id, name) {
  const hue = (id * 47) % 360;
  const initials = name.slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" rx="32" fill="hsl(${hue} 65% 42%)"/><circle cx="80" cy="72" r="48" fill="hsl(${hue} 75% 75%)"/><path d="M32 80h96M80 24v96" stroke="#fff" stroke-width="8" opacity=".45"/><text x="80" y="90" text-anchor="middle" font-family="sans-serif" font-size="38" font-weight="700" fill="#172033">${initials}</text><text x="80" y="145" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#fff">#${id}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const offlinePokemon = OFFLINE_NAMES.map((name, index) => ({
  id: index + 1,
  name,
  image: createOfflineBadge(index + 1, name),
}));

export const DECK_CATALOG = {
  kanto: {
    id: "kanto",
    label: "Kanto (tutti)",
    pokemonIds: KANTO_IDS,
    supportedDifficulties: ["2x2", "4x4", "6x6"],
  },
  starters: {
    id: "starters",
    label: "Starter e evoluzioni",
    pokemonIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    supportedDifficulties: ["2x2", "4x4"],
  },
  evolutions: {
    id: "evolutions",
    label: "Linee evolutive",
    pokemonIds: [
      10, 11, 12, 13, 14, 15, 16, 17, 18, 29, 30, 31, 32, 33, 34, 43, 44, 45,
    ],
    supportedDifficulties: ["2x2", "4x4", "6x6"],
  },
  water: {
    id: "water",
    label: "Tipo Acqua",
    pokemonIds: [
      7, 8, 9, 54, 55, 60, 61, 62, 72, 73, 79, 80, 86, 87, 90, 91, 98, 99,
    ],
    supportedDifficulties: ["2x2", "4x4", "6x6"],
  },
  offline: {
    id: "offline",
    label: "Locale offline",
    pokemonIds: offlinePokemon.map(({ id }) => id),
    pokemon: offlinePokemon,
    supportedDifficulties: ["2x2", "4x4", "6x6"],
    offline: true,
  },
};

export function validateDeckCatalog(catalog) {
  const decks = Object.values(catalog ?? {});
  const isValid =
    decks.length > 0 &&
    decks.every((deck) => {
      const uniqueIds = new Set(deck.pokemonIds);
      return (
        deck.id &&
        deck.label &&
        uniqueIds.size === deck.pokemonIds.length &&
        deck.pokemonIds.every((id) => Number.isInteger(id) && id > 0) &&
        deck.supportedDifficulties.length > 0 &&
        deck.supportedDifficulties.every(
          (difficulty) =>
            GAME_CONFIG.difficulties[difficulty] &&
            deck.pokemonIds.length >=
              GAME_CONFIG.difficulties[difficulty].pairs,
        ) &&
        (!deck.offline ||
          (deck.pokemon?.length === deck.pokemonIds.length &&
            deck.pokemon.every(({ id, name, image }) =>
              Boolean(id && name && image),
            )))
      );
    });

  if (!isValid) {
    throw new Error("Invalid deck catalog");
  }

  return true;
}

export function isDeckCompatible(deckId, difficulty) {
  return Boolean(
    DECK_CATALOG[deckId]?.supportedDifficulties.includes(difficulty),
  );
}

export function getDeckPokemon(deckId) {
  const deck = DECK_CATALOG[deckId];
  if (!deck) {
    throw new RangeError(`Unknown deck: ${deckId}`);
  }
  return deck.pokemon ?? deck.pokemonIds.map((id) => ({ id }));
}

validateDeckCatalog(DECK_CATALOG);
