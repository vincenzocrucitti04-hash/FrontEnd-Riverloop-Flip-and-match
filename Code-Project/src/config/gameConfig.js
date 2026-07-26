function deepFreeze(value) {
  Object.values(value).forEach((nestedValue) => {
    if (nestedValue && typeof nestedValue === "object") {
      deepFreeze(nestedValue);
    }
  });
  return Object.freeze(value);
}

export function validateGameConfig(config) {
  const difficulties = Object.values(config?.difficulties ?? {});
  const timings = Object.values(config?.timings ?? {});
  const apiConfig = config?.pokemonApi;
  const previewOptions = config?.previewOptions ?? [];
  const scoring = config?.scoring;
  const hasValidDifficulties =
    difficulties.length > 0 &&
    difficulties.every(
      ({ id, label, rows, columns, totalCards, pairs }) =>
        id &&
        label &&
        Number.isInteger(rows) &&
        rows > 0 &&
        Number.isInteger(columns) &&
        columns > 0 &&
        totalCards === rows * columns &&
        pairs * 2 === totalCards,
    );
  const hasValidTimings =
    timings.length === 4 &&
    timings.every((duration) => Number.isFinite(duration) && duration >= 0);
  const hasValidApiConfig =
    Number.isInteger(apiConfig?.minId) &&
    Number.isInteger(apiConfig?.maxId) &&
    apiConfig.minId > 0 &&
    apiConfig.maxId >= apiConfig.minId &&
    Number.isFinite(apiConfig.timeoutMs) &&
    apiConfig.timeoutMs > 0 &&
    Boolean(apiConfig.spriteKey);
  const hasValidDefault = Boolean(
    config?.difficulties?.[config?.defaultDifficulty],
  );
  const hasValidPreviewOptions =
    previewOptions.length > 0 &&
    previewOptions.every(
      (option) =>
        Number.isFinite(option.value) && option.value >= 0 && option.label,
    ) &&
    previewOptions.some((option) => option.value === config?.defaultPreviewMs);
  const hasValidScoring =
    Number.isInteger(scoring?.version) &&
    scoring.version > 0 &&
    [
      scoring?.pointsPerPair,
      scoring?.comboStepBonus,
      scoring?.extraMovePenalty,
      scoring?.secondsPenalty,
    ].every((value) => Number.isFinite(value) && value >= 0) &&
    difficulties.every(({ id }) => {
      const thresholds = scoring?.starThresholds?.[id];
      return (
        Number.isFinite(thresholds?.two) &&
        Number.isFinite(thresholds?.three) &&
        thresholds.two >= 0 &&
        thresholds.three > thresholds.two
      );
    });

  if (
    !hasValidDifficulties ||
    !hasValidTimings ||
    !hasValidApiConfig ||
    !hasValidDefault ||
    !hasValidPreviewOptions ||
    !hasValidScoring
  ) {
    throw new Error("Invalid game configuration");
  }

  return true;
}

const gameConfig = {
  defaultDifficulty: "4x4",
  defaultPreviewMs: 750,
  difficulties: {
    "2x2": {
      id: "2x2",
      label: "2x2",
      rows: 2,
      columns: 2,
      totalCards: 4,
      pairs: 2,
    },
    "4x4": {
      id: "4x4",
      label: "4x4",
      rows: 4,
      columns: 4,
      totalCards: 16,
      pairs: 8,
    },
    "6x6": {
      id: "6x6",
      label: "6x6",
      rows: 6,
      columns: 6,
      totalCards: 36,
      pairs: 18,
    },
  },
  timings: {
    minimumLoadingMs: 1000,
    previewMs: 750,
    mismatchMs: 1000,
    victoryMs: 500,
  },
  previewOptions: [
    { value: 0, label: "Nessuna" },
    { value: 750, label: "Breve" },
    { value: 1500, label: "Lunga" },
  ],
  pokemonApi: {
    minId: 1,
    maxId: 150,
    timeoutMs: 5000,
    spriteKey: "front_default",
  },
  scoring: {
    version: 1,
    pointsPerPair: 100,
    comboStepBonus: 25,
    extraMovePenalty: 15,
    secondsPenalty: 2,
    starThresholds: {
      "2x2": { two: 130, three: 190 },
      "4x4": { two: 800, three: 1200 },
      "6x6": { two: 3000, three: 4500 },
    },
  },
};

validateGameConfig(gameConfig);

export const GAME_CONFIG = deepFreeze(gameConfig);
