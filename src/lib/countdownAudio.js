let audioContext;
let soundEnabled = false;

const context = () => {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  return audioContext;
};

const tone = (frequency, duration, volume, delay = 0) => {
  if (!soundEnabled || document.visibilityState !== 'visible') return;
  const ctx = context();
  if (ctx.state !== 'running') return;
  const start = ctx.currentTime + delay;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.01);
};

export const isCountdownSoundEnabled = () => soundEnabled;

export async function enableCountdownSound() {
  const ctx = context();
  await ctx.resume();
  soundEnabled = true;
}

export function disableCountdownSound() {
  soundEnabled = false;
}

export function playCountdownTick() {
  tone(920, 0.045, 0.025);
}

export function playCountdownComplete() {
  tone(660, 0.16, 0.022);
  tone(880, 0.22, 0.018, 0.12);
}