import { useState, useEffect } from "react";

const MAX_TOASTS = 5;
const EXIT_ANIM_MS = 220;

const DURATIONS = {
  default: 5000,
  success: 4000,
  info: 5000,
  information: 5000,
  warning: 7000,
  error: null,
  destructive: null,
};

let count = 0;
const genId = () => {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
};

const listeners = new Set();
let memoryState = { toasts: [] };

const timers = new Map();
const remaining = new Map();
const deadlines = new Map();
const exitTimers = new Map();

function emit() {
  listeners.forEach((l) => l(memoryState));
}

function clearTimer(id) {
  if (timers.has(id)) {
    clearTimeout(timers.get(id));
    timers.delete(id);
  }
}

function clearExitTimer(id) {
  if (exitTimers.has(id)) {
    clearTimeout(exitTimers.get(id));
    exitTimers.delete(id);
  }
}

function startTimer(id, duration) {
  clearTimer(id);
  if (duration == null) return;
  remaining.set(id, duration);
  deadlines.set(id, Date.now() + duration);
  timers.set(id, setTimeout(() => removeToast(id), duration));
}

function pauseToast(id) {
  if (!timers.has(id)) return;
  const left = Math.max(0, (deadlines.get(id) || 0) - Date.now());
  clearTimer(id);
  remaining.set(id, left);
}

function resumeToast(id) {
  if (remaining.get(id) == null) return;
  const left = remaining.get(id);
  clearTimer(id);
  if (left <= 0) { removeToast(id); return; }
  deadlines.set(id, Date.now() + left);
  timers.set(id, setTimeout(() => removeToast(id), left));
}

function removeToast(id) {
  if (!memoryState.toasts.some((t) => t.id === id)) return;
  clearTimer(id);
  remaining.delete(id);
  deadlines.delete(id);
  clearExitTimer(id);
  memoryState = {
    toasts: memoryState.toasts.map((t) => (t.id === id ? { ...t, open: false } : t)),
  };
  emit();
  exitTimers.set(id, setTimeout(() => {
    clearExitTimer(id);
    memoryState = { toasts: memoryState.toasts.filter((t) => t.id !== id) };
    emit();
  }, EXIT_ANIM_MS));
}

function addToast(props) {
  const id = props.id ?? genId();
  const variant = props.variant || "default";
  const duration = props.duration != null ? props.duration : (DURATIONS[variant] ?? DURATIONS.default);
  const toastObj = { id, open: true, ...props, variant, duration };

  const combined = [toastObj, ...memoryState.toasts];
  const next = combined.slice(0, MAX_TOASTS);

  const nextIds = new Set(next.map((t) => t.id));
  combined.forEach((t) => {
    if (!nextIds.has(t.id)) {
      clearTimer(t.id);
      clearExitTimer(t.id);
      remaining.delete(t.id);
      deadlines.delete(t.id);
    }
  });

  memoryState = { toasts: next };
  emit();
  startTimer(id, duration);

  return {
    id,
    dismiss: () => removeToast(id),
    update: (p) => updateToast(id, p),
  };
}

function updateToast(id, props) {
  memoryState = {
    toasts: memoryState.toasts.map((t) => (t.id === id ? { ...t, ...props, id } : t)),
  };
  emit();
}

function dismiss(id) {
  if (id) removeToast(id);
  else memoryState.toasts.forEach((t) => removeToast(t.id));
}

if (typeof window !== "undefined" && !window.__execleadToastEscapeBound) {
  window.__execleadToastEscapeBound = true;
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const latest = memoryState.toasts.find((t) => t.open);
      if (latest) removeToast(latest.id);
    }
  });
}

function toast(props) {
  return addToast(props);
}

function useToast() {
  const [state, setState] = useState(memoryState);

  useEffect(() => {
    listeners.add(setState);
    setState(memoryState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss,
    pause: pauseToast,
    resume: resumeToast,
  };
}

export { useToast, toast };