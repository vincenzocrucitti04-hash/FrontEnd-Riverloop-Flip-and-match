import { GAME_CONFIG } from "../config/gameConfig";

function toNonNegativeNumber(value) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function calculateScore({
  difficulty,
  matchedPairs,
  comboBonus,
  moves,
  elapsedMs,
}) {
  const difficultyConfig = GAME_CONFIG.difficulties[difficulty];
  const scoring = GAME_CONFIG.scoring;

  if (!difficultyConfig) {
    throw new Error(`Difficoltà sconosciuta: ${difficulty}`);
  }

  const safePairs = Math.floor(toNonNegativeNumber(matchedPairs));
  const safeMoves = Math.floor(toNonNegativeNumber(moves));
  const safeElapsedMs = toNonNegativeNumber(elapsedMs);
  const safeComboBonus = Math.floor(toNonNegativeNumber(comboBonus));
  const basePoints = safePairs * scoring.pointsPerPair;
  const movePenalty =
    Math.max(0, safeMoves - difficultyConfig.pairs) * scoring.extraMovePenalty;
  const timePenalty = Math.floor(safeElapsedMs / 1000) * scoring.secondsPenalty;
  const score = Math.max(
    0,
    basePoints + safeComboBonus - movePenalty - timePenalty,
  );
  const thresholds = scoring.starThresholds[difficulty];
  const stars = score >= thresholds.three ? 3 : score >= thresholds.two ? 2 : 1;

  return {
    version: scoring.version,
    score,
    stars,
    basePoints,
    comboBonus: safeComboBonus,
    movePenalty,
    timePenalty,
  };
}
