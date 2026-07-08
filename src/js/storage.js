const HIGHEST_LEVEL_KEY = "gridfall_highest_level";
const LEGACY_HIGH_SCORE_KEYS = Object.freeze([
  "gridfall.highScore.v1",
  "gridfall_high_score",
  "gridfall_highScore",
  "gridfall_highscore",
]);

function canUseLocalStorage() {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  } catch {
    return false;
  }
}

export function readHighestLevel() {
  return Math.max(1, readSafeNumber(HIGHEST_LEVEL_KEY, 1));
}

export function saveHighestLevel(level) {
  const normalizedLevel = Math.max(1, Math.floor(Number(level) || 1));
  const currentHighest = readHighestLevel();
  const nextHighest = Math.max(currentHighest, normalizedLevel);

  if (canUseLocalStorage()) {
    window.localStorage.setItem(HIGHEST_LEVEL_KEY, String(nextHighest));
  }

  return nextHighest;
}

export function clearStoredHighScores() {
  if (!canUseLocalStorage()) {
    return;
  }

  LEGACY_HIGH_SCORE_KEYS.forEach((key) => {
    window.localStorage.removeItem(key);
  });
}

function readSafeNumber(key, fallback = 0) {
  if (!canUseLocalStorage()) {
    return fallback;
  }

  const parsedValue = Number.parseInt(window.localStorage.getItem(key) ?? String(fallback), 10);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}
