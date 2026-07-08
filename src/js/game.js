import {
  EMPTY_CELL,
  cloneMatrix,
  clonePiece,
  createPiece,
  createSevenBag,
  getMatrixBounds,
  rotateMatrixClockwise,
} from "./pieces.js";
import {
  clearStoredHighScores,
  readHighestLevel,
  saveHighestLevel,
} from "./storage.js";

export const ARENA_COLUMNS = 10;
export const ARENA_ROWS = 20;

export const PHASES = Object.freeze({
  MENU: "menu",
  PLAYING: "playing",
  PAUSED: "paused",
  GAME_OVER: "game-over",
});

const LINE_SCORES = Object.freeze([0, 40, 100, 300, 1200]);
const MAX_LOCK_RESETS = 15;
const CLEAR_EFFECT_MS = 240;
const LEVEL_NOTICE_MS = 1120;

export const STAGE_THEMES = Object.freeze({
  inicio: Object.freeze({
    accent: "#8C5CE6",
    accentStrong: "#B18BFF",
    accentDeep: "#5B2AB4",
    background: "#0D1019",
    surface: "#111722",
    surfaceSecondary: "#171B28",
    grid: "rgba(145, 158, 190, 0.10)",
    border: "rgba(140, 92, 230, 0.48)",
    glow: "rgba(140, 92, 230, 0.14)",
  }),
  pulso: Object.freeze({
    accent: "#A75AEB",
    accentStrong: "#D18BFF",
    accentDeep: "#742CC0",
    background: "#120F1D",
    surface: "#171323",
    surfaceSecondary: "#20172D",
    grid: "rgba(176, 121, 228, 0.11)",
    border: "rgba(167, 90, 235, 0.50)",
    glow: "rgba(167, 90, 235, 0.16)",
  }),
  aceleracao: Object.freeze({
    accent: "#527BE8",
    accentStrong: "#7FB5FF",
    accentDeep: "#184EAA",
    background: "#0B111C",
    surface: "#0F1825",
    surfaceSecondary: "#152033",
    grid: "rgba(83, 135, 219, 0.13)",
    border: "rgba(82, 123, 232, 0.50)",
    glow: "rgba(82, 123, 232, 0.16)",
  }),
  fluxo: Object.freeze({
    accent: "#34AEB5",
    accentStrong: "#66E2DD",
    accentDeep: "#147078",
    background: "#091619",
    surface: "#0D1E21",
    surfaceSecondary: "#12282C",
    grid: "rgba(59, 173, 174, 0.12)",
    border: "rgba(52, 174, 181, 0.50)",
    glow: "rgba(52, 174, 181, 0.16)",
  }),
  sobrecarga: Object.freeze({
    accent: "#D95378",
    accentStrong: "#FF86A8",
    accentDeep: "#8B2546",
    background: "#180D14",
    surface: "#211018",
    surfaceSecondary: "#2B1520",
    grid: "rgba(220, 91, 125, 0.13)",
    border: "rgba(217, 83, 120, 0.52)",
    glow: "rgba(217, 83, 120, 0.17)",
  }),
  infinito: Object.freeze({
    accent: "#D1795C",
    accentStrong: "#F5A36D",
    accentDeep: "#8E4428",
    background: "#09090E",
    surface: "#101016",
    surfaceSecondary: "#18171F",
    grid: "rgba(196, 165, 255, 0.10)",
    border: "rgba(209, 121, 92, 0.50)",
    glow: "rgba(209, 121, 92, 0.16)",
  }),
});

const INFINITE_CYCLE_THEME_VARIANTS = Object.freeze([
  Object.freeze({
    accent: "#D1795C",
    accentStrong: "#F5A36D",
    accentDeep: "#8E4428",
    border: "rgba(209, 121, 92, 0.50)",
    glow: "rgba(209, 121, 92, 0.16)",
  }),
  Object.freeze({
    accent: "#8C6FE8",
    accentStrong: "#B6A3FF",
    accentDeep: "#4E38A8",
    border: "rgba(140, 111, 232, 0.48)",
    glow: "rgba(140, 111, 232, 0.15)",
  }),
  Object.freeze({
    accent: "#4F8EDB",
    accentStrong: "#85BDFF",
    accentDeep: "#285E9C",
    border: "rgba(79, 142, 219, 0.48)",
    glow: "rgba(79, 142, 219, 0.15)",
  }),
  Object.freeze({
    accent: "#C8579D",
    accentStrong: "#F08AC8",
    accentDeep: "#81305F",
    border: "rgba(200, 87, 157, 0.48)",
    glow: "rgba(200, 87, 157, 0.15)",
  }),
]);

export function getInfiniteCycleTheme(cycle) {
  const safeCycle = Math.max(1, Math.floor(Number(cycle) || 1));
  const variant = INFINITE_CYCLE_THEME_VARIANTS[(safeCycle - 1) % INFINITE_CYCLE_THEME_VARIANTS.length];

  return Object.freeze({
    ...STAGE_THEMES.infinito,
    ...variant,
  });
}

export function getStageTheme(stage) {
  if (!stage) {
    return STAGE_THEMES.inicio;
  }

  if (stage.id === "infinito" && stage.cycle) {
    return getInfiniteCycleTheme(stage.cycle);
  }

  return stage.theme ?? STAGE_THEMES[stage.id] ?? STAGE_THEMES.inicio;
}

export const DROP_INTERVALS_BY_LEVEL = Object.freeze([
  1000,
  900,
  800,
  700,
  620,
  540,
  470,
  400,
  340,
  290,
  250,
  215,
  185,
  160,
  140,
  135,
  130,
  125,
  120,
  115,
  110,
  105,
  100,
  95,
  90,
]);

export const LEVEL_STAGES = Object.freeze([
  {
    id: "inicio",
    name: "INÍCIO",
    minLevel: 1,
    maxLevel: 3,
    theme: STAGE_THEMES.inicio,
    description: "Aprenda o ritmo e organize o tabuleiro.",
  },
  {
    id: "pulso",
    name: "PULSO",
    minLevel: 4,
    maxLevel: 6,
    theme: STAGE_THEMES.pulso,
    description: "A velocidade aumenta e exige decisões mais rápidas.",
  },
  {
    id: "aceleracao",
    name: "ACELERAÇÃO",
    minLevel: 7,
    maxLevel: 9,
    theme: STAGE_THEMES.aceleracao,
    description: "O espaço para pensar começa a diminuir.",
  },
  {
    id: "fluxo",
    name: "FLUXO",
    minLevel: 10,
    maxLevel: 12,
    theme: STAGE_THEMES.fluxo,
    description: "Mantenha o controle sob pressão constante.",
  },
  {
    id: "sobrecarga",
    name: "SOBRECARGA",
    minLevel: 13,
    maxLevel: 15,
    theme: STAGE_THEMES.sobrecarga,
    description: "Velocidade alta e pouco espaço para hesitar.",
  },
]);

export const CAMPAIGN_STAGES = Object.freeze([
  ...LEVEL_STAGES,
  {
    id: "infinito",
    name: "INFINITO",
    minLevel: 16,
    maxLevel: Infinity,
    theme: STAGE_THEMES.infinito,
    description: "Sobreviva e avance por ciclos sem limite final.",
  },
]);

export function createArena(rows = ARENA_ROWS, columns = ARENA_COLUMNS) {
  return Array.from({ length: rows }, () => Array(columns).fill(EMPTY_CELL));
}

export function calculateLevel(linesCleared) {
  return Math.floor(linesCleared / 10) + 1;
}

export function getLinesIntoCurrentLevel(runLines) {
  return Math.max(0, Math.floor(Number(runLines) || 0)) % 10;
}

export function getDropInterval(level) {
  const definedSpeed = DROP_INTERVALS_BY_LEVEL[level - 1];

  if (definedSpeed !== undefined) {
    return definedSpeed;
  }

  if (level <= 30) return 85;
  if (level <= 35) return 80;
  if (level <= 40) return 75;

  return 70;
}

export function getLockDelay(level) {
  if (level <= 15) return 500;
  if (level <= 25) return 400;
  if (level <= 35) return 320;
  if (level <= 40) return 270;

  return 240;
}

export function getInfiniteCycle(level) {
  if (level < 16) {
    return null;
  }

  return Math.floor((level - 16) / 5) + 1;
}

export function convertToRoman(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return String(value);
  }

  if (value > 39) {
    return String(value);
  }

  const numerals = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let remaining = Math.floor(value);
  let result = "";

  for (const [amount, numeral] of numerals) {
    while (remaining >= amount) {
      result += numeral;
      remaining -= amount;
    }
  }

  return result || String(value);
}

export function getLevelStage(level) {
  const baseStage = LEVEL_STAGES.find((stage) => level >= stage.minLevel && level <= stage.maxLevel);

  if (baseStage) {
    return baseStage;
  }

  const cycle = getInfiniteCycle(level) ?? 1;

  return {
    id: "infinito",
    name: `INFINITO ${convertToRoman(cycle)}`,
    minLevel: 16 + (cycle - 1) * 5,
    maxLevel: 20 + (cycle - 1) * 5,
    cycle,
    theme: getInfiniteCycleTheme(cycle),
    description: CAMPAIGN_STAGES.find((stage) => stage.id === "infinito")?.description ?? "",
  };
}

export function isStageUnlocked(stage, highestLevel) {
  return Number(highestLevel) >= stage.minLevel;
}
function getSpawnPosition(matrix) {
  const bounds = getMatrixBounds(matrix);
  const width = bounds?.width ?? matrix[0].length;
  const topPadding = bounds?.minY ?? 0;

  return {
    x: Math.floor((ARENA_COLUMNS - width) / 2) - (bounds?.minX ?? 0),
    y: -topPadding,
  };
}

export class GridfallGame {
  constructor() {
    clearStoredHighScores();
    this.phase = PHASES.MENU;
    this.highScore = 0;
    this.highestLevel = readHighestLevel();
    this.resetRoundState();
  }

  resetRoundState() {
    this.arena = createArena();
    this.bag = createSevenBag();
    this.currentPiece = null;
    this.nextPiece = null;
    this.position = { x: 0, y: 0 };
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.dropCounter = 0;
    this.lockCounter = 0;
    this.lockResets = 0;
    this.lineClearEffect = null;
    this.levelNotice = null;
    this.levelNoticeKey = 0;
    this.isNewRecord = false;
  }

  start() {
    this.resetRoundState();
    this.highestLevel = readHighestLevel();
    this.level = calculateLevel(this.lines);
    this.phase = PHASES.PLAYING;
    this.currentPiece = createPiece(this.bag.next());
    this.nextPiece = createPiece(this.bag.next());
    this.placeCurrentPieceAtSpawn();
  }

  returnToMenu() {
    this.resetRoundState();
    this.highestLevel = readHighestLevel();
    this.phase = PHASES.MENU;
  }

  pause() {
    if (this.phase !== PHASES.PLAYING) {
      return false;
    }

    this.phase = PHASES.PAUSED;
    return true;
  }

  resume() {
    if (this.phase !== PHASES.PAUSED) {
      return false;
    }

    this.dropCounter = 0;
    this.phase = PHASES.PLAYING;
    return true;
  }

  togglePause() {
    if (this.phase === PHASES.PLAYING) {
      return this.pause();
    }

    if (this.phase === PHASES.PAUSED) {
      return this.resume();
    }

    return false;
  }

  update(deltaTime) {
    if (this.phase !== PHASES.PLAYING) {
      return;
    }

    const safeDelta = Math.min(deltaTime, 100);
    this.updateLineClearEffect(safeDelta);
    this.updateLevelNotice(safeDelta);

    if (!this.currentPiece) {
      return;
    }

    if (this.isGrounded()) {
      this.lockCounter += safeDelta;

      if (this.lockCounter >= getLockDelay(this.level)) {
        this.lockCurrentPiece();
      }

      return;
    }

    this.lockCounter = 0;
    this.lockResets = 0;
    this.dropCounter += safeDelta;

    if (this.dropCounter >= getDropInterval(this.level)) {
      this.dropCounter = 0;
      this.dropOneCell({ manual: false });
    }
  }

  moveHorizontal(direction) {
    if (this.phase !== PHASES.PLAYING || !this.currentPiece) {
      return false;
    }

    const nextPosition = {
      x: this.position.x + direction,
      y: this.position.y,
    };

    if (this.hasCollision(this.currentPiece.matrix, nextPosition)) {
      return false;
    }

    this.position = nextPosition;
    this.resetLockDelayAfterInput();
    return true;
  }

  softDrop() {
    return this.dropOneCell({ manual: true });
  }

  hardDrop() {
    if (this.phase !== PHASES.PLAYING || !this.currentPiece) {
      return false;
    }

    let distance = 0;

    while (
      !this.hasCollision(this.currentPiece.matrix, {
        x: this.position.x,
        y: this.position.y + 1,
      })
    ) {
      this.position.y += 1;
      distance += 1;
    }

    this.addScore(distance * 2);
    this.lockCurrentPiece();
    return true;
  }

  rotate() {
    if (this.phase !== PHASES.PLAYING || !this.currentPiece || this.currentPiece.type === "O") {
      return false;
    }

    const originalMatrix = cloneMatrix(this.currentPiece.matrix);
    const originalPosition = { ...this.position };
    const rotatedMatrix = rotateMatrixClockwise(originalMatrix);
    const kickOffsets = [0, -1, 1, -2, 2];

    for (const offset of kickOffsets) {
      const kickedPosition = {
        x: originalPosition.x + offset,
        y: originalPosition.y,
      };

      if (!this.hasCollision(rotatedMatrix, kickedPosition)) {
        this.currentPiece.matrix = rotatedMatrix;
        this.position = kickedPosition;
        this.resetLockDelayAfterInput();
        return true;
      }
    }

    this.currentPiece.matrix = originalMatrix;
    this.position = originalPosition;
    return false;
  }

  hasCollision(matrix, position) {
    for (let y = 0; y < matrix.length; y += 1) {
      for (let x = 0; x < matrix[y].length; x += 1) {
        if (matrix[y][x] === EMPTY_CELL) {
          continue;
        }

        const arenaX = position.x + x;
        const arenaY = position.y + y;

        if (arenaX < 0 || arenaX >= ARENA_COLUMNS || arenaY >= ARENA_ROWS) {
          return true;
        }

        if (arenaY >= 0 && this.arena[arenaY][arenaX] !== EMPTY_CELL) {
          return true;
        }
      }
    }

    return false;
  }

  getSnapshot() {
    const stage = getLevelStage(this.level);

    return {
      arena: this.arena,
      currentPiece: this.currentPiece,
      nextPiece: this.nextPiece,
      position: this.position,
      ghostPosition: this.getGhostPosition(),
      score: this.score,
      highScore: this.highScore,
      finalHighScore: this.highScore,
      lines: this.lines,
      level: this.level,
      phase: this.phase,
      highestLevel: this.highestLevel,
      isNewRecord: this.isNewRecord,
      dropInterval: getDropInterval(this.level),
      lockDelay: getLockDelay(this.level),
      stage,
      linesIntoCurrentLevel: getLinesIntoCurrentLevel(this.lines),
      levelNotice: this.levelNotice,
      lineClearEffect: this.lineClearEffect,
    };
  }

  dropOneCell({ manual }) {
    if (this.phase !== PHASES.PLAYING || !this.currentPiece) {
      return false;
    }

    const nextPosition = {
      x: this.position.x,
      y: this.position.y + 1,
    };

    if (this.hasCollision(this.currentPiece.matrix, nextPosition)) {
      return false;
    }

    this.position = nextPosition;
    this.dropCounter = 0;

    if (manual) {
      this.addScore(1);
    }

    return true;
  }

  spawnPiece() {
    this.currentPiece = this.nextPiece ? clonePiece(this.nextPiece) : createPiece(this.bag.next());
    this.placeCurrentPieceAtSpawn();

    if (this.phase !== PHASES.GAME_OVER) {
      this.nextPiece = createPiece(this.bag.next());
    }
  }

  placeCurrentPieceAtSpawn() {
    this.position = getSpawnPosition(this.currentPiece.matrix);
    this.dropCounter = 0;
    this.lockCounter = 0;
    this.lockResets = 0;

    if (this.hasCollision(this.currentPiece.matrix, this.position)) {
      this.finishGame();
    }
  }

  lockCurrentPiece() {
    if (!this.currentPiece) {
      return;
    }

    let lockedAboveArena = false;

    for (let y = 0; y < this.currentPiece.matrix.length; y += 1) {
      for (let x = 0; x < this.currentPiece.matrix[y].length; x += 1) {
        const value = this.currentPiece.matrix[y][x];

        if (value === EMPTY_CELL) {
          continue;
        }

        const arenaY = this.position.y + y;
        const arenaX = this.position.x + x;

        if (arenaY < 0) {
          lockedAboveArena = true;
          continue;
        }

        if (arenaY >= 0 && arenaY < ARENA_ROWS && arenaX >= 0 && arenaX < ARENA_COLUMNS) {
          this.arena[arenaY][arenaX] = value;
        }
      }
    }

    this.currentPiece = null;
    this.clearCompletedLines();

    if (lockedAboveArena) {
      this.finishGame();
      return;
    }

    this.spawnPiece();
  }

  clearCompletedLines() {
    let clearedLines = 0;
    const clearedRows = [];

    for (let y = ARENA_ROWS - 1; y >= 0; y -= 1) {
      if (this.arena[y].every((cell) => cell !== EMPTY_CELL)) {
        const row = this.arena.splice(y, 1)[0].fill(EMPTY_CELL);
        this.arena.unshift(row);
        clearedRows.push(y);
        clearedLines += 1;
        y += 1;
      }
    }

    if (clearedLines === 0) {
      return;
    }

    const previousLevel = this.level;
    this.addScore((LINE_SCORES[clearedLines] ?? 0) * previousLevel);
    this.lines += clearedLines;
    this.level = calculateLevel(this.lines);
    this.lineClearEffect = {
      rows: clearedRows,
      age: 0,
      duration: CLEAR_EFFECT_MS,
    };

    if (this.level > this.highestLevel) {
      this.highestLevel = saveHighestLevel(this.level);
    }

    if (this.level > previousLevel) {
      this.levelNotice = {
        key: this.levelNoticeKey + 1,
        level: this.level,
        stage: getLevelStage(this.level),
        age: 0,
        duration: LEVEL_NOTICE_MS,
      };
      this.levelNoticeKey += 1;
    }
  }

  addScore(points) {
    const normalizedPoints = Math.max(0, Math.floor(Number(points) || 0));

    if (normalizedPoints === 0) {
      return;
    }

    const previousHighScore = this.highScore;
    this.score += normalizedPoints;

    if (this.score > previousHighScore) {
      this.highScore = this.score;
      this.isNewRecord = true;
    }
  }

  updateLineClearEffect(deltaTime) {
    if (!this.lineClearEffect) {
      return;
    }

    this.lineClearEffect.age += deltaTime;

    if (this.lineClearEffect.age >= this.lineClearEffect.duration) {
      this.lineClearEffect = null;
    }
  }

  updateLevelNotice(deltaTime) {
    if (!this.levelNotice) {
      return;
    }

    this.levelNotice.age += deltaTime;

    if (this.levelNotice.age >= this.levelNotice.duration) {
      this.levelNotice = null;
    }
  }

  isGrounded() {
    if (!this.currentPiece) {
      return false;
    }

    return this.hasCollision(this.currentPiece.matrix, {
      x: this.position.x,
      y: this.position.y + 1,
    });
  }

  resetLockDelayAfterInput() {
    if (!this.isGrounded() || this.lockResets >= MAX_LOCK_RESETS) {
      return;
    }

    this.lockCounter = 0;
    this.lockResets += 1;
  }

  getGhostPosition() {
    if (!this.currentPiece || this.phase === PHASES.MENU) {
      return null;
    }

    const ghost = { ...this.position };

    while (
      !this.hasCollision(this.currentPiece.matrix, {
        x: ghost.x,
        y: ghost.y + 1,
      })
    ) {
      ghost.y += 1;
    }

    return ghost;
  }

  finishGame() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.isNewRecord = true;
    }

    this.highestLevel = saveHighestLevel(this.level);

    this.levelNotice = null;
    this.phase = PHASES.GAME_OVER;
  }
}
