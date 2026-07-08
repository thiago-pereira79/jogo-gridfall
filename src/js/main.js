import {
  CAMPAIGN_STAGES,
  GridfallGame,
  PHASES,
  getLevelStage,
  getStageTheme,
  isStageUnlocked,
} from "./game.js";
import { GridfallRenderer } from "./renderer.js";
import { createControls } from "./controls.js?v=20260702-responsive-layout";
import { readHighestLevel } from "./storage.js";

const numberFormatter = new Intl.NumberFormat("pt-BR");
const reducedMotionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
const landscapeQuery = window.matchMedia?.("(orientation: landscape) and (max-width: 1099px)");
const MENU_INPUT_GUARD_MS = 450;

const app = getRequiredElement("#app", "Container principal");
const campaignButton = getRequiredElement("#btnJogarDoInicio", 'Botão "Jogar campanha"');
const stagesButton = getRequiredElement("#btnEscolherFase", 'Botão "Ver fases"');
const howtoButton = getRequiredElement("#btnComoJogar", 'Botão "Como jogar"');
const screens = {
  menu: document.querySelector("#menuScreen"),
  howto: document.querySelector("#howtoScreen"),
  phase: document.querySelector("#phaseScreen"),
  game: document.querySelector("#gameScreen"),
};
const phaseGrid = document.querySelector("#phaseGrid");
const phaseLabel = document.querySelector("#phaseLabel");
const pauseOverlay = document.querySelector("#pauseOverlay");
const gameOverOverlay = document.querySelector("#gameOverOverlay");
const orientationNotice = document.querySelector("#orientationNotice");
const newRecordBadge = document.querySelector("#newRecordBadge");
const levelTransition = document.querySelector("#levelTransition");
const levelTransitionNumber = document.querySelector("#levelTransitionNumber");
const levelTransitionPhase = document.querySelector("#levelTransitionPhase");
const phaseTransition = document.querySelector("#phaseTransition");
const phaseTransitionName = document.querySelector("#phaseTransitionName");
const phaseTransitionLevels = document.querySelector("#phaseTransitionLevels");
const levelProgress = document.querySelector("#levelProgress");
const levelProgressFill = document.querySelector("#levelProgressFill");
const boardCanvas = document.querySelector("#gameCanvas");
const nextCanvas = document.querySelector("#nextCanvas");
const gameRoot = document.querySelector("[data-game-root]");

const game = new GridfallGame();
const renderer = new GridfallRenderer({ boardCanvas, nextCanvas });
const statElements = groupElementsByData("stat");
const textElements = groupElementsByData("text");
const uiCache = new Map();

let currentScreen = "menu";
let animationFrameId = null;
let lastFrameTime = 0;
let activeLevelNoticeKey = null;
let activeThemeKey = null;
let activeStageId = null;
let phaseTransitionTimeout = null;
let lastDirectMenuDispatch = null;
let pausedForOrientation = false;
let menuInputBlockedUntil = 0;

function getRequiredElement(selector, label) {
  const element = document.querySelector(selector);

  if (!element) {
    throw new Error(`${label} não encontrado no DOM.`);
  }

  return element;
}

function validateRequiredDom() {
  const requiredActions = [
    [campaignButton, "startCampaign", 'Botão "Jogar campanha"'],
    [stagesButton, "viewStages", 'Botão "Ver fases"'],
    [howtoButton, "howto", 'Botão "Como jogar"'],
  ];

  requiredActions.forEach(([button, action, label]) => {
    if (button.dataset.action !== action) {
      throw new Error(`${label} precisa usar data-action="${action}".`);
    }
  });

  Object.entries(screens).forEach(([name, screen]) => {
    if (!screen) {
      throw new Error(`Tela obrigatória não encontrada: ${name}.`);
    }
  });
}

function registerRequiredMenuButton(button, action) {
  button.addEventListener(
    "pointerdown",
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      lastDirectMenuDispatch = {
        action,
        button,
        time: performance.now(),
      };
      handleCommand(action);
    },
    { passive: false },
  );

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const wasHandledByPointer =
      lastDirectMenuDispatch?.button === button &&
      lastDirectMenuDispatch.action === action &&
      performance.now() - lastDirectMenuDispatch.time < 700;

    if (!wasHandledByPointer) {
      handleCommand(action);
    }
  });
}

function registerRequiredMenuButtons() {
  registerRequiredMenuButton(campaignButton, "startCampaign");
  registerRequiredMenuButton(stagesButton, "viewStages");
  registerRequiredMenuButton(howtoButton, "howto");
}

function groupElementsByData(attributeName) {
  const groups = new Map();

  document.querySelectorAll(`[data-${attributeName}]`).forEach((element) => {
    const key = element.dataset[attributeName];

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(element);
  });

  return groups;
}

function formatNumber(value) {
  return numberFormatter.format(Math.max(0, Math.floor(Number(value) || 0)));
}

function setScreen(name) {
  currentScreen = name;
  app.dataset.screen = name;
  document.documentElement.dataset.screen = name;
  document.body.dataset.screen = name;

  for (const [screenName, screen] of Object.entries(screens)) {
    if (!screen) {
      continue;
    }

    const isActive = screenName === name;
    screen.hidden = !isActive;
    screen.classList.toggle("is-active", isActive);
  }

  if (name === "phase" || name === "howto") {
    window.scrollTo({ top: 0, left: 0 });
  }

  updateOrientationNotice();
}

function startLoop() {
  stopLoop();
  lastFrameTime = performance.now();
  animationFrameId = window.requestAnimationFrame(loop);
}

function stopLoop() {
  if (animationFrameId !== null) {
    window.cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  lastFrameTime = 0;
}

function loop(time) {
  const deltaTime = lastFrameTime ? time - lastFrameTime : 0;
  lastFrameTime = time;

  game.update(deltaTime);
  renderer.render(game.getSnapshot());
  syncUi();

  animationFrameId = window.requestAnimationFrame(loop);
}

function startCampaign() {
  hideLevelTransition();
  hidePhaseTransition();
  pausedForOrientation = false;
  game.start();
  setScreen("game");
  syncUi(true);
  renderer.render(game.getSnapshot());
  updateOrientationNotice();
  startLoop();
}

function showMenu() {
  game.returnToMenu();
  stopLoop();
  hideLevelTransition();
  hidePhaseTransition();
  hideOrientationNotice({ resumeGame: false });
  resetVisualTheme();
  menuInputBlockedUntil = performance.now() + MENU_INPUT_GUARD_MS;
  setScreen("menu");
  syncUi(true);
}

function showInfoScreen(name) {
  stopLoop();
  game.returnToMenu();
  hideLevelTransition();
  hidePhaseTransition();
  hideOrientationNotice({ resumeGame: false });
  resetVisualTheme();
  setScreen(name);
  syncUi(true);
}

function showStagesMap() {
  stopLoop();
  game.returnToMenu();
  hideLevelTransition();
  hidePhaseTransition();
  hideOrientationNotice({ resumeGame: false });
  resetVisualTheme();
  renderStagesMap();
  setScreen("phase");
  syncUi(true);
}

function syncUi(force = false) {
  const snapshot = game.getSnapshot();
  const stage = snapshot.stage;

  if (app.dataset.phase !== snapshot.phase) {
    app.dataset.phase = snapshot.phase;
  }

  const themeChange = applyStageTheme(stage, {
    force,
    announce: currentScreen === "game" && snapshot.phase === PHASES.PLAYING,
  });

  setStat("score", snapshot.score, force);
  setStat("highScore", snapshot.highScore, force);
  setStat("level", snapshot.level, force);
  setStat("lines", snapshot.lines, force);
  setStat("finalScore", snapshot.score, force);
  setStat("finalHighScore", snapshot.highScore, force);
  setStat("finalLevel", snapshot.level, force);
  setStat("finalLines", snapshot.lines, force);
  setText("stage", stage.name, force);
  setText("finalStage", stage.name, force);
  updateProgressPanel(snapshot, force);

  setElementText(phaseLabel, getPhaseLabel(snapshot), "phaseLabel", force);

  const orientationIsVisible = orientationNotice && orientationNotice.hidden === false;
  pauseOverlay.hidden = orientationIsVisible || snapshot.phase !== PHASES.PAUSED;
  gameOverOverlay.hidden = snapshot.phase !== PHASES.GAME_OVER;
  newRecordBadge.hidden = !snapshot.isNewRecord;
  if (themeChange.shouldAnnounceStage) {
    if (snapshot.levelNotice) {
      activeLevelNoticeKey = snapshot.levelNotice.key;
    }

    hideLevelTransition();
    showPhaseTransition(stage);
  } else {
    syncLevelTransition(snapshot.levelNotice);
  }
}

function setStat(name, value, force = false) {
  setGroupedText(statElements, name, formatNumber(value), `stat:${name}`, force);
}

function setText(name, value, force = false) {
  setGroupedText(textElements, name, value, `text:${name}`, force);
}

function setGroupedText(groups, name, value, cacheKey, force) {
  if (!force && uiCache.get(cacheKey) === value) {
    return;
  }

  uiCache.set(cacheKey, value);
  groups.get(name)?.forEach((element) => {
    element.textContent = value;
  });
}

function setElementText(element, value, cacheKey, force) {
  if (!element || (!force && uiCache.get(cacheKey) === value)) {
    return;
  }

  uiCache.set(cacheKey, value);
  element.textContent = value;
}

function applyStageTheme(stage, { force = false, announce = false } = {}) {
  const resolvedStage = stage ?? getLevelStage(1);
  const theme = getStageTheme(resolvedStage);
  const stageId = resolvedStage.id ?? "inicio";
  const themeKey = `${stageId}:${resolvedStage.cycle ?? 0}`;
  const shouldUpdateTheme = force || activeThemeKey !== themeKey;
  const stageChanged = activeStageId !== null && activeStageId !== stageId;

  if (shouldUpdateTheme) {
    app.dataset.fase = stageId;
    document.body.dataset.fase = stageId;

    if (gameRoot) {
      gameRoot.dataset.phase = stageId;

      if (resolvedStage.cycle) {
        gameRoot.dataset.phaseCycle = String(resolvedStage.cycle);
      } else {
        delete gameRoot.dataset.phaseCycle;
      }
    }

    applyThemeVariables(theme);
    renderer.setTheme(theme);
    activeThemeKey = themeKey;
  }

  activeStageId = stageId;

  return {
    shouldAnnounceStage: announce && stageChanged && resolvedStage.minLevel > 1,
  };
}

function applyThemeVariables(theme) {
  const targets = [document.body, app, gameRoot].filter(Boolean);
  const values = {
    "--phase-accent": theme.accent,
    "--phase-accent-strong": theme.accentStrong,
    "--phase-accent-deep": theme.accentDeep,
    "--phase-bg": theme.background,
    "--phase-surface": theme.surface,
    "--phase-surface-secondary": theme.surfaceSecondary,
    "--phase-grid": theme.grid,
    "--phase-border": theme.border,
    "--phase-glow": theme.glow,
    "--game-bg": theme.background,
    "--game-board-bg": theme.surface,
    "--game-preview-bg": theme.surfaceSecondary,
    "--game-grid": theme.grid,
    "--game-board-border": theme.border,
    "--game-accent": theme.accent,
    "--game-accent-strong": theme.accentStrong,
    "--game-accent-deep": theme.accentDeep,
    "--game-accent-soft": theme.glow,
    "--game-ambient": theme.glow,
    "--primary": theme.accent,
    "--primary-strong": theme.accentStrong,
    "--primary-deep": theme.accentDeep,
  };

  targets.forEach((target) => {
    Object.entries(values).forEach(([name, value]) => {
      target.style.setProperty(name, value);
    });
  });
}

function resetVisualTheme() {
  activeThemeKey = null;
  activeStageId = null;
  app.dataset.fase = "menu";
  document.body.dataset.fase = "menu";

  if (gameRoot) {
    gameRoot.dataset.phase = "inicio";
    delete gameRoot.dataset.phaseCycle;
  }

  const theme = getStageTheme(getLevelStage(1));
  applyThemeVariables(theme);
  renderer.setTheme(theme);
}

function syncLevelTransition(notice) {
  if (!notice) {
    if (activeLevelNoticeKey !== null || levelTransition?.hidden === false) {
      hideLevelTransition();
    }

    return;
  }

  if (activeLevelNoticeKey === notice.key) {
    return;
  }

  activeLevelNoticeKey = notice.key;
  showLevelTransition(notice.level, notice.stage.name);
  vibrateForLevelUp();
}

function showLevelTransition(level, stageName) {
  if (!levelTransition || !levelTransitionNumber || !levelTransitionPhase) {
    return;
  }

  levelTransitionNumber.textContent = String(level);
  levelTransitionPhase.textContent = stageName;
  levelTransition.hidden = false;
  levelTransition.classList.remove("is-visible");
  void levelTransition.offsetWidth;
  levelTransition.classList.add("is-visible");
}

function hideLevelTransition() {
  activeLevelNoticeKey = null;

  if (!levelTransition) {
    return;
  }

  levelTransition.classList.remove("is-visible");
  levelTransition.hidden = true;
}

function showPhaseTransition(stage) {
  if (!phaseTransition || !phaseTransitionName || !phaseTransitionLevels) {
    return;
  }

  if (phaseTransitionTimeout !== null) {
    window.clearTimeout(phaseTransitionTimeout);
  }

  phaseTransitionName.textContent = stage.name;
  phaseTransitionLevels.textContent = formatStageRange(stage);
  phaseTransition.hidden = false;
  phaseTransition.classList.remove("is-visible");
  void phaseTransition.offsetWidth;
  phaseTransition.classList.add("is-visible");

  phaseTransitionTimeout = window.setTimeout(() => {
    hidePhaseTransition();
  }, 1280);
}

function hidePhaseTransition() {
  if (phaseTransitionTimeout !== null) {
    window.clearTimeout(phaseTransitionTimeout);
    phaseTransitionTimeout = null;
  }

  if (!phaseTransition) {
    return;
  }

  phaseTransition.classList.remove("is-visible");
  phaseTransition.hidden = true;
}

function vibrateForLevelUp() {
  if (reducedMotionQuery?.matches || !("vibrate" in navigator)) {
    return;
  }

  navigator.vibrate(35);
}

function getPhaseLabel(snapshot) {
  const stageName = snapshot.stage?.name ?? "INÍCIO";

  switch (snapshot.phase) {
    case PHASES.PLAYING:
      return `JOGANDO · ${stageName}`;
    case PHASES.PAUSED:
      return `PAUSADO · ${stageName}`;
    case PHASES.GAME_OVER:
      return `FIM DE JOGO · ${stageName}`;
    default:
      return "PRONTO";
  }
}

function renderStagesMap() {
  if (!phaseGrid) {
    return;
  }

  const highestLevel = readHighestLevel();
  const currentStage = getLevelStage(highestLevel);
  phaseGrid.replaceChildren();

  CAMPAIGN_STAGES.forEach((stage, index) => {
    const reached = isStageUnlocked(stage, highestLevel);
    const isCurrent = reached && currentStage.id === stage.id;
    const card = document.createElement("article");
    card.className = [
      "phase-option",
      reached ? "is-reached" : "is-locked",
      isCurrent ? "is-current" : "",
    ]
      .filter(Boolean)
      .join(" ");
    card.setAttribute("aria-label", `${stage.name}, ${formatStageRange(stage)}`);
    applyCardTheme(card, getStageTheme(stage));

    const top = document.createElement("div");
    top.className = "phase-option__top";

    const number = document.createElement("span");
    number.className = "phase-option__number";
    number.textContent = String(index + 1).padStart(2, "0");

    const title = document.createElement("h3");
    title.textContent = stage.name;

    top.append(number, title);

    const range = document.createElement("p");
    range.className = "phase-option__range";
    range.textContent = formatStageRange(stage);

    const description = document.createElement("p");
    description.className = "phase-option__description";
    description.textContent = stage.description;

    const status = document.createElement("p");
    status.className = "phase-option__status";
    status.textContent = getStageStatusText({ stage, reached, isCurrent });

    card.append(top, range, description, status);
    phaseGrid.append(card);
  });
}

function applyCardTheme(card, theme) {
  const values = {
    "--card-accent": theme.accent,
    "--card-accent-strong": theme.accentStrong,
    "--card-accent-deep": theme.accentDeep,
    "--card-bg": theme.surface,
    "--card-bg-secondary": theme.surfaceSecondary,
    "--card-grid": theme.grid,
    "--card-border": theme.border,
    "--card-glow": theme.glow,
  };

  Object.entries(values).forEach(([name, value]) => {
    card.style.setProperty(name, value);
  });
}

function getStageStatusText({ stage, reached, isCurrent }) {
  if (!reached) {
    return `DESBLOQUEIA NO NÍVEL ${stage.minLevel}`;
  }

  return isCurrent ? "EM ANDAMENTO" : "ALCANÇADA";
}

function formatStageRange(stage) {
  if (stage.maxLevel === Infinity) {
    return `Nível ${stage.minLevel}+`;
  }

  return `Níveis ${stage.minLevel}-${stage.maxLevel}`;
}

function updateProgressPanel(snapshot, force = false) {
  const linesIntoLevel = Math.min(10, snapshot.linesIntoCurrentLevel ?? 0);
  const progressText = `${linesIntoLevel} de 10 linhas`;
  const progressPercent = `${linesIntoLevel * 10}%`;
  const nextTarget = getNextStageTarget(snapshot.level);

  setText("progressTitle", "JORNADA", force);
  setText("progressMode", formatStageRange(snapshot.stage), force);
  setText("progressStage", snapshot.stage.name, force);
  setText("levelProgressLabel", `PRÓXIMO NÍVEL ${snapshot.level + 1}`, force);
  setText("levelProgressText", progressText, force);
  setText("milestoneLabel", "PRÓXIMO MARCO", force);
  setText("nextMilestone", `Nível ${snapshot.level + 1}`, force);
  setText("nextStageLabel", nextTarget.label, force);
  setText("nextStageValue", `${formatDisplayStageName(nextTarget.name)} · nível ${nextTarget.level}`, force);
  setText("progressRecordLabel", "MELHOR JORNADA", force);
  setText("progressRecordValue", `Nível ${Math.max(1, snapshot.highestLevel)}`, force);

  if (levelProgress) {
    levelProgress.setAttribute("aria-valuenow", String(linesIntoLevel));
    levelProgress.setAttribute("aria-valuetext", progressText);
  }

  if (levelProgressFill && (force || uiCache.get("levelProgressFill") !== progressPercent)) {
    uiCache.set("levelProgressFill", progressPercent);
    levelProgressFill.style.width = progressPercent;
  }
}

function getNextStageTarget(level) {
  const nextStage = CAMPAIGN_STAGES.find((stage) => stage.minLevel > level);

  if (nextStage) {
    return {
      label: "PRÓXIMA FASE",
      name: nextStage.name,
      level: nextStage.minLevel,
    };
  }

  const nextCycleLevel = getNextInfiniteCycleLevel(level);

  return {
    label: "PRÓXIMO CICLO",
    name: getLevelStage(nextCycleLevel).name,
    level: nextCycleLevel,
  };
}

function formatDisplayStageName(name) {
  return String(name)
    .split(" ")
    .map((word) => {
      if (/^[IVXLCDM0-9]+$/.test(word)) {
        return word;
      }

      const lower = word.toLocaleLowerCase("pt-BR");
      return lower.charAt(0).toLocaleUpperCase("pt-BR") + lower.slice(1);
    })
    .join(" ");
}

function getNextInfiniteCycleLevel(level) {
  if (level < 16) {
    return 16;
  }

  return 16 + Math.floor((level - 16) / 5 + 1) * 5;
}

function handleCommand(action) {
  if (isOrientationBlocked()) {
    return true;
  }

  if (
    currentScreen === "menu" &&
    performance.now() < menuInputBlockedUntil &&
    ["start", "startCampaign", "viewStages", "howto"].includes(action)
  ) {
    return true;
  }

  switch (action) {
    case "start":
    case "startCampaign":
      startCampaign();
      return true;
    case "viewStages":
      showStagesMap();
      return true;
    case "howto":
      showInfoScreen("howto");
      return true;
    case "menu":
      showMenu();
      return true;
    case "restart":
      startCampaign();
      return true;
    case "resume":
      if (game.resume()) {
        lastFrameTime = performance.now();
        syncUi();
      }
      return true;
    case "pause":
      if (game.togglePause()) {
        if (game.phase === PHASES.PLAYING) {
          lastFrameTime = performance.now();
        }
        syncUi();
      }
      return true;
    case "left":
      return game.moveHorizontal(-1);
    case "right":
      return game.moveHorizontal(1);
    case "down":
      return game.softDrop();
    case "rotate":
      return game.rotate();
    case "drop":
      return game.hardDrop();
    case "enter":
      return handleEnter();
    case "escape":
      return handleEscape();
    default:
      return false;
  }
}

function handleEnter() {
  if (currentScreen === "menu" || game.phase === PHASES.GAME_OVER) {
    startCampaign();
    return true;
  }

  if (game.phase === PHASES.PAUSED) {
    game.resume();
    lastFrameTime = performance.now();
    syncUi();
    return true;
  }

  return false;
}

function handleEscape() {
  if (currentScreen === "howto" || currentScreen === "phase") {
    showMenu();
    return true;
  }

  if (currentScreen === "game" && game.phase === PHASES.PLAYING) {
    game.pause();
    syncUi();
    return true;
  }

  if (currentScreen === "game" && (game.phase === PHASES.PAUSED || game.phase === PHASES.GAME_OVER)) {
    showMenu();
    return true;
  }

  return false;
}

function isSmallLandscape() {
  return Boolean(landscapeQuery?.matches);
}

function isOrientationBlocked() {
  return Boolean(orientationNotice && orientationNotice.hidden === false);
}

function updateOrientationNotice() {
  if (!orientationNotice) {
    return;
  }

  const shouldShow = currentScreen === "game" && isSmallLandscape();

  if (shouldShow) {
    if (game.phase === PHASES.PLAYING && game.pause()) {
      pausedForOrientation = true;
      lastFrameTime = performance.now();
    }

    orientationNotice.hidden = false;
    syncUi();
    return;
  }

  if (!isSmallLandscape()) {
    hideOrientationNotice();
    return;
  }

  orientationNotice.hidden = true;
}

function hideOrientationNotice() {
  if (orientationNotice) {
    orientationNotice.hidden = true;
  }

  pausedForOrientation = false;
  syncUi();
}

function handleResize() {
  updateOrientationNotice();

  if (currentScreen !== "game") {
    return;
  }

  renderer.render(game.getSnapshot());
}

function pauseWhenHidden() {
  if (document.hidden && game.phase === PHASES.PLAYING) {
    game.pause();
    syncUi();
  }
}

createControls({
  root: app,
  onCommand: handleCommand,
  getContext: () => ({
    screen: currentScreen,
    phase: game.phase,
  }),
});

window.addEventListener("resize", handleResize, { passive: true });
window.addEventListener("orientationchange", handleResize, { passive: true });
window.visualViewport?.addEventListener("resize", handleResize, { passive: true });
landscapeQuery?.addEventListener?.("change", handleResize);
document.addEventListener("visibilitychange", pauseWhenHidden);

validateRequiredDom();
registerRequiredMenuButtons();
setScreen("menu");
renderStagesMap();
syncUi(true);
