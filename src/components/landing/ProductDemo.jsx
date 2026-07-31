import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, RotateCcw, Maximize2, Minimize2, X, ArrowRight, Volume2, VolumeX,
} from "lucide-react";
import { SCENES, DEMO_TOTAL } from "./demo/DemoScenes";
import { base44 } from "@/api/base44Client";

// Ambient cinematic music volume — kept low so it never overpowers narration.
const MUSIC_VOLUME = 0.07;
const MUSIC_DIM = 0.028;

const NARRATION_AUDIO_URL = "";
const hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

function pickVoice() {
  if (!hasSpeech) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find((v) => /en-GB|en_US|Google US English|Samantha|Daniel|Aaron/i.test(v.name)) ||
    voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("en")) ||
    voices[0]
  );
}

function track(event, properties) { try { base44.analytics.track({ eventName: event, properties }); } catch (e) {} }

export default function ProductDemo({ open, onClose, startSceneId, authed }) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [fs, setFs] = useState(false);
  const [muted, setMuted] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const lastRef = useRef(null);
  const completedRef = useRef(false);

  // Audio refs
  const audioCtxRef = useRef(null);
  const musicGainRef = useRef(null);
  const musicNodesRef = useRef(null);
  const musicStartedRef = useRef(false);
  const mutedRef = useRef(false);
  const playingRef = useRef(false);

  // Compute start offset from an optional related scene (for "Watch Related Demo").
  const startElapsed = (() => {
    if (!startSceneId) return 0;
    let acc = 0;
    for (const s of SCENES) { if (s.id === startSceneId) return acc; acc += s.duration; }
    return 0;
  })();

  const sceneIndex = (() => {
    let acc = 0;
    for (let i = 0; i < SCENES.length; i++) {
      if (elapsed < acc + SCENES[i].duration) return i;
      acc += SCENES[i].duration;
    }
    return SCENES.length - 1;
  })();
  const scene = SCENES[sceneIndex];
  const finished = elapsed >= DEMO_TOTAL;

  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => { playingRef.current = playing; }, [playing]);

  const setMusicGain = useCallback((target) => {
    const ctx = audioCtxRef.current;
    const gain = musicGainRef.current;
    if (!ctx || !gain) return;
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(target, ctx.currentTime + 1.2);
  }, []);

  const startMusic = useCallback(() => {
    if (musicStartedRef.current) return;
    musicStartedRef.current = true;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      musicGainRef.current = master;
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(mutedRef.current ? 0 : MUSIC_VOLUME, ctx.currentTime + 2.5);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 900;
      filter.connect(master);
      const freqs = [110, 164.81, 220, 277.18];
      const nodes = freqs.map((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = (0.16 / freqs.length) * (i === 0 ? 1.5 : 1);
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.04 + i * 0.02;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.05;
        lfo.connect(lfoGain);
        lfoGain.connect(g.gain);
        osc.connect(g);
        g.connect(filter);
        osc.start();
        lfo.start();
        return { osc, lfo };
      });
      musicNodesRef.current = nodes;
      if (ctx.state === "suspended") ctx.resume();
    } catch {}
  }, []);

  const stopMusic = useCallback(() => {
    const ctx = audioCtxRef.current;
    const gain = musicGainRef.current;
    if (ctx && gain) {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.1);
    }
    setTimeout(() => {
      musicNodesRef.current?.forEach(({ osc, lfo }) => { try { osc.stop(); lfo.stop(); } catch {} });
      try { audioCtxRef.current?.close(); } catch {}
      audioCtxRef.current = null;
      musicGainRef.current = null;
      musicNodesRef.current = null;
      musicStartedRef.current = false;
    }, 1300);
  }, []);

  const speak = useCallback((text) => {
    if (!hasSpeech || mutedRef.current || !playingRef.current) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.97; u.pitch = 1; u.volume = 1;
      const v = pickVoice();
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch {}
  }, []);

  const cancelSpeech = useCallback(() => { if (!hasSpeech) return; try { window.speechSynthesis.cancel(); } catch {} }, []);

  useEffect(() => {
    if (!open || !playing) return undefined;
    lastRef.current = performance.now();
    const tick = (now) => {
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      setElapsed((e) => Math.min(DEMO_TOTAL, e + dt));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [open, playing]);

  useEffect(() => {
    if (open) {
      setPlaying(true);
      setElapsed(startElapsed);
      setMuted(false);
      completedRef.current = false;
      startMusic();
      track("demo_opened", { start_scene: startSceneId || "full" });
    } else {
      setPlaying(false);
      setElapsed(0);
      cancelSpeech();
      stopMusic();
    }
    return () => { if (!open) return; cancelSpeech(); stopMusic(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (playing) {
      setMusicGain(mutedRef.current ? 0 : MUSIC_VOLUME);
      if (hasSpeech && !mutedRef.current) { try { window.speechSynthesis.resume(); } catch {} speak(scene.narration); }
    } else {
      setMusicGain(MUSIC_DIM);
      if (hasSpeech) { try { window.speechSynthesis.pause(); } catch {} }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, open]);

  useEffect(() => {
    if (!open) return;
    if (muted) { setMusicGain(0); cancelSpeech(); }
    else { setMusicGain(playingRef.current ? MUSIC_VOLUME : MUSIC_DIM); if (playingRef.current) speak(scene.narration); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted, open]);

  useEffect(() => {
    if (!open || !playing || muted) return;
    speak(scene.narration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIndex, open]);

  useEffect(() => {
    if (finished && !completedRef.current) {
      completedRef.current = true;
      setPlaying(false);
      cancelSpeech();
      track("demo_completed", { completion_pct: 100, watch_time_seconds: Math.round(elapsed) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const replay = useCallback(() => {
    track("demo_replay", { timestamp_seconds: Math.round(elapsed) });
    completedRef.current = false;
    setElapsed(startElapsed);
    setPlaying(true);
  }, [elapsed, startElapsed]);

  const toggleFs = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) { await el.requestFullscreen(); setFs(true); }
      else { await document.exitFullscreen(); setFs(false); }
    } catch (e) {}
  }, []);

  useEffect(() => { const onFs = () => setFs(!!document.fullscreenElement); document.addEventListener("fullscreenchange", onFs); return () => document.removeEventListener("fullscreenchange", onFs); }, []);
  useEffect(() => { if (!open) return undefined; const onKey = (e) => { if (e.key === "Escape" && !document.fullscreenElement) onClose(); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [open, onClose]);

  if (!open) return null;
  const progress = (elapsed / DEMO_TOTAL) * 100;
  const narrationReady = hasSpeech && !NARRATION_AUDIO_URL ? hasSpeech : !!NARRATION_AUDIO_URL;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8">
        <div ref={containerRef} className="relative w-full max-w-5xl aspect-video bg-[#0a0a0f] rounded-2xl border border-white/10 overflow-hidden flex flex-col">
          {/* progress bar */}
          <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-white/5">
            <div className="h-full bg-gradient-to-r from-amber-400 to-accent-orange transition-[width] duration-100" style={{ width: `${progress}%` }} />
          </div>

          {/* header */}
          <div className="absolute top-3 left-3 z-30 max-w-[55%]">
            <div className="text-[10px] uppercase tracking-wider text-accent-orange/80 font-semibold">Platform Demo™</div>
            <div className="text-[12px] md:text-[13px] text-white font-semibold leading-tight hidden sm:block">Become the Executive Every Organization Wants to Hire.</div>
            <div className="text-[10px] text-white/40 mt-0.5">90 Seconds</div>
          </div>

          {/* narration coming-soon badge */}
          {!narrationReady && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-[10px] text-white/55 font-medium flex items-center gap-1.5">
              <Volume2 size={11} className="text-amber-400" /> Audio narration coming soon.
            </div>
          )}

          <button onClick={onClose} aria-label="Close demo" className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"><X size={16} /></button>

          {/* stage */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden p-6 pt-16">
            <div className="absolute inset-0 opacity-40">
              <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-accent-orange/15 rounded-full blur-[100px]" />
              <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px]" />
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={scene.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.5 }} className="relative w-full h-full flex flex-col items-center justify-center">
                <div className="text-center mb-4"><span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-wider text-white/40">Scene {sceneIndex + 1} / {SCENES.length}</span></div>
                <scene.Visual />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* captions + controls */}
          <div className="relative z-20 bg-gradient-to-t from-black/60 to-transparent px-6 py-4">
            <AnimatePresence mode="wait">
              {captionsOn && !finished && (
                <motion.div key={scene.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center max-w-2xl mx-auto mb-4">
                  <p className="text-sm text-white/80 leading-relaxed" role="caption">{scene.narration}</p>
                  {scene.takeaway && <div className="text-[11px] text-accent-orange/80 mt-1.5">✦ {scene.takeaway}</div>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* completion CTA */}
            <AnimatePresence>
              {finished && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center mb-4">
                  <p className="text-base font-semibold text-white mb-1">Ready to begin your Executive Leadership Journey?</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2">
                    <Link to={authed ? "/assessment" : "/beta"} onClick={() => { track("demo_cta_click", { cta: "assessment" }); onClose(); }}
                      className="bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all hover:-translate-y-0.5">
                      Start Executive Readiness Assessment™ <ArrowRight size={16} />
                    </Link>
                    <button onClick={() => { track("demo_cta_click", { cta: "explore" }); onClose(); }}
                      className="bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 font-medium px-6 py-2.5 rounded-xl transition-colors">
                      Explore the Platform
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* controls */}
            <div className="flex items-center justify-center gap-2">
              <button onClick={replay} aria-label="Replay" className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"><RotateCcw size={15} /></button>
              <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"} className="w-11 h-11 rounded-full bg-accent-orange hover:bg-accent-orange/90 flex items-center justify-center text-white transition-colors">{finished ? <RotateCcw size={18} /> : playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}</button>
              <button onClick={toggleFs} aria-label="Fullscreen" className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">{fs ? <Minimize2 size={15} /> : <Maximize2 size={15} />}</button>
              <button onClick={() => setCaptionsOn((c) => !c)} aria-label={captionsOn ? "Hide captions" : "Show captions"} className={`w-9 h-9 rounded-full border flex items-center justify-center text-[10px] font-bold transition-colors ${captionsOn ? "bg-white/10 border-white/25 text-white" : "bg-white/5 border-white/10 text-white/40 hover:text-white"}`}>CC</button>
              <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"} className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${muted ? "bg-white/5 border-white/10 text-white/40 hover:text-white" : "bg-accent-orange/15 border-accent-orange/30 text-accent-orange"}`}>{muted ? <VolumeX size={15} /> : <Volume2 size={15} />}</button>
              <span className="ml-3 text-[11px] text-white/40 font-mono">{String(Math.floor(elapsed)).padStart(2, "0")}s / {DEMO_TOTAL}s</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}