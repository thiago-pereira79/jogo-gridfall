const KEY_TO_ACTION = Object.freeze({
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowDown: "down",
  ArrowUp: "rotate",
  Space: "drop",
  KeyP: "pause",
  Enter: "enter",
  Escape: "escape",
});

const REPEATABLE_ACTIONS = new Set(["left", "right", "down"]);
const REPEAT_DELAY_MS = 150;
const REPEAT_RATE_MS = 72;

export function createControls({ root, onCommand, getContext }) {
  let holdTimeout = null;
  let holdInterval = null;
  let activePointerId = null;
  let lastPointerDispatch = null;

  function clearHold() {
    window.clearTimeout(holdTimeout);
    window.clearInterval(holdInterval);
    holdTimeout = null;
    holdInterval = null;
    activePointerId = null;
  }

  function dispatch(action, event) {
    if (!action) {
      return false;
    }

    return Boolean(onCommand(action, event));
  }

  function getKeyboardActionButton(event) {
    const target = event.target;

    if (!(target instanceof Element) || !["Enter", "Space"].includes(event.code)) {
      return null;
    }

    return target.closest("[data-action]");
  }

  function handleKeyDown(event) {
    const action = KEY_TO_ACTION[event.code];

    if (!action) {
      return;
    }

    const keyboardActionButton = getKeyboardActionButton(event);

    if (keyboardActionButton) {
      event.preventDefault();

      if (!event.repeat) {
        dispatch(keyboardActionButton.dataset.action, event);
      }

      return;
    }

    const context = getContext();
    const isGameKey = ["left", "right", "down", "rotate", "drop", "pause"].includes(action);
    const shouldPrevent = context.screen === "game" || action === "enter" || action === "escape";

    if (shouldPrevent) {
      event.preventDefault();
    }

    if (event.repeat && !REPEATABLE_ACTIONS.has(action)) {
      return;
    }

    if (isGameKey || action === "enter" || action === "escape") {
      dispatch(action, event);
    }
  }

  function getButtonFromEvent(event) {
    const target = event.target;

    if (!(target instanceof Element)) {
      return null;
    }

    return target.closest("[data-action]");
  }

  function handlePointerDown(event) {
    const button = getButtonFromEvent(event);

    if (!button) {
      return;
    }

    const action = button.dataset.action;

    event.preventDefault();
    clearHold();
    activePointerId = event.pointerId;
    try {
      button.setPointerCapture?.(event.pointerId);
    } catch {
      // Some synthetic pointer events do not have an active pointer to capture.
    }

    const accepted = dispatch(action, event);

    if (accepted) {
      lastPointerDispatch = {
        action,
        button,
        time: performance.now(),
      };
    }

    if (!accepted || !REPEATABLE_ACTIONS.has(action)) {
      return;
    }

    holdTimeout = window.setTimeout(() => {
      holdInterval = window.setInterval(() => {
        dispatch(action, event);
      }, REPEAT_RATE_MS);
    }, REPEAT_DELAY_MS);
  }

  function handlePointerEnd(event) {
    if (activePointerId === null || event.pointerId === activePointerId) {
      clearHold();
    }
  }

  function handleClick(event) {
    const button = getButtonFromEvent(event);

    if (!button) {
      return;
    }

    event.preventDefault();
    const action = button.dataset.action;
    const wasHandledByPointer =
      event.detail > 0 &&
      lastPointerDispatch &&
      performance.now() - lastPointerDispatch.time < 700;

    if (wasHandledByPointer) {
      return;
    }

    dispatch(action, event);
  }

  document.addEventListener("keydown", handleKeyDown, { passive: false });
  root.addEventListener("pointerdown", handlePointerDown, { passive: false });
  root.addEventListener("click", handleClick);
  window.addEventListener("pointerup", handlePointerEnd, { passive: true });
  window.addEventListener("pointercancel", handlePointerEnd, { passive: true });
  window.addEventListener("blur", clearHold);

  return {
    destroy() {
      clearHold();
      document.removeEventListener("keydown", handleKeyDown);
      root.removeEventListener("pointerdown", handlePointerDown);
      root.removeEventListener("click", handleClick);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
      window.removeEventListener("blur", clearHold);
    },
  };
}
