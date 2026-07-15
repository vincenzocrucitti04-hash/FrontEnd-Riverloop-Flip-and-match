import { GAME_CONFIG } from "../config/gameConfig";
import { DECK_CATALOG } from "../config/deckCatalog";

const STORAGE_KEY = "flip-and-match:user-data";
const STORAGE_VERSION = 2;
const THEMES = new Set(["light", "dark", "system"]);

function createDefaultProfile() {
  return {
    gamesCompleted: 0,
    totalAttempts: 0,
    correctPairs: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
    discoveredPokemon: [],
  };
}

function createDefaultData() {
  return {
    version: STORAGE_VERSION,
    preferences: {
      theme: "system",
      difficulty: GAME_CONFIG.defaultDifficulty,
      deck: "kanto",
      previewMs: GAME_CONFIG.defaultPreviewMs,
    },
    records: {},
    profile: createDefaultProfile(),
  };
}

function hasValidPreferences(preferences) {
  return (
    THEMES.has(preferences?.theme) &&
    Boolean(GAME_CONFIG.difficulties[preferences?.difficulty]) &&
    Boolean(DECK_CATALOG[preferences?.deck]) &&
    GAME_CONFIG.previewOptions.some(
      (option) => option.value === preferences?.previewMs,
    )
  );
}

function hasValidRecords(records) {
  return (
    records !== null && typeof records === "object" && !Array.isArray(records)
  );
}

function hasValidProfile(profile) {
  const counters = [
    profile?.gamesCompleted,
    profile?.totalAttempts,
    profile?.correctPairs,
    profile?.currentWinStreak,
    profile?.bestWinStreak,
  ];
  const discoveries = profile?.discoveredPokemon;

  return (
    counters.every((value) => Number.isInteger(value) && value >= 0) &&
    Array.isArray(discoveries) &&
    discoveries.every(
      ({ id, name }) => Number.isInteger(id) && id > 0 && Boolean(name),
    ) &&
    new Set(discoveries.map(({ id }) => id)).size === discoveries.length
  );
}

function normalizeData(data) {
  if (
    data?.version === 1 &&
    hasValidPreferences(data.preferences) &&
    hasValidRecords(data.records)
  ) {
    return {
      ...data,
      version: STORAGE_VERSION,
      profile: createDefaultProfile(),
    };
  }

  if (
    data?.version === STORAGE_VERSION &&
    hasValidPreferences(data.preferences) &&
    hasValidRecords(data.records) &&
    hasValidProfile(data.profile)
  ) {
    return data;
  }

  return createDefaultData();
}

export function loadUserData(storage = localStorage) {
  try {
    const storedData = storage.getItem(STORAGE_KEY);
    if (!storedData) {
      return createDefaultData();
    }

    return normalizeData(JSON.parse(storedData));
  } catch {
    return createDefaultData();
  }
}

export function updatePreferences(partialPreferences, storage = localStorage) {
  const currentData = loadUserData(storage);
  const nextData = {
    ...currentData,
    preferences: {
      ...currentData.preferences,
      ...partialPreferences,
    },
  };
  const validatedData = normalizeData(nextData);
  storage.setItem(STORAGE_KEY, JSON.stringify(validatedData));
  return validatedData;
}

export function saveBestRecord(difficulty, result, storage = localStorage) {
  const currentData = loadUserData(storage);
  const currentRecord = currentData.records[difficulty];
  const isBetter =
    !currentRecord ||
    result.timeMs < currentRecord.timeMs ||
    (result.timeMs === currentRecord.timeMs &&
      result.moves < currentRecord.moves);

  if (!isBetter) {
    return currentRecord;
  }

  const nextData = {
    ...currentData,
    records: {
      ...currentData.records,
      [difficulty]: result,
    },
  };
  storage.setItem(STORAGE_KEY, JSON.stringify(nextData));
  return result;
}

export function recordCompletedGame(result, storage = localStorage) {
  const attempts = Math.floor(result?.attempts);
  const correctPairs = Math.floor(result?.correctPairs);

  if (
    !Number.isFinite(attempts) ||
    !Number.isFinite(correctPairs) ||
    attempts <= 0 ||
    correctPairs <= 0 ||
    attempts < correctPairs
  ) {
    throw new TypeError("Invalid completed game statistics");
  }

  const currentData = loadUserData(storage);
  const discoveredById = new Map(
    currentData.profile.discoveredPokemon.map((pokemon) => [
      pokemon.id,
      pokemon,
    ]),
  );
  (result.discoveredPokemon ?? []).forEach((pokemon) => {
    if (Number.isInteger(pokemon?.id) && pokemon.id > 0 && pokemon.name) {
      discoveredById.set(pokemon.id, { id: pokemon.id, name: pokemon.name });
    }
  });
  const currentWinStreak = currentData.profile.currentWinStreak + 1;
  const profile = {
    ...currentData.profile,
    gamesCompleted: currentData.profile.gamesCompleted + 1,
    totalAttempts: currentData.profile.totalAttempts + attempts,
    correctPairs: currentData.profile.correctPairs + correctPairs,
    currentWinStreak,
    bestWinStreak: Math.max(
      currentData.profile.bestWinStreak,
      currentWinStreak,
    ),
    discoveredPokemon: [...discoveredById.values()].sort((a, b) => a.id - b.id),
  };

  storage.setItem(STORAGE_KEY, JSON.stringify({ ...currentData, profile }));
  return profile;
}

export function resetProfile(storage = localStorage) {
  const currentData = loadUserData(storage);
  const profile = createDefaultProfile();
  storage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...currentData, records: {}, profile }),
  );
  return profile;
}
