import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Maximize2, Minimize2, X, ArrowRight, Minimize } from "lucide-react";
import { SCENES, DEMO_TOTAL } from "./demo/DemoScenes";

export default function ProductDemo({ open, onClose }) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [fs, setFs] = useState(false);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const lastRef = useRef(null);

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

  // animation loop
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

  // reset when reopened
  useEffect(() => {
    if (open) {
      setPlaying(true);
      setElapsed(0);
    } else {
      setPlaying(false);
      setElapsed(0);
    }
  }, [open]);

  // stop at end
  useEffect(() => {
    if (finished) setPlaying(false);
  }, [finished]);

  const replay = useCallback(() => {
    setElapsed(0);
    setPlaying(true);
  }, []);

  const toggleFs = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        setFs(true);
      } else {
        await document.exitFullscreen();
        setFs(false);
      }
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => {
    const onFs = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !document.fullscreenElement) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const progress = (elapsed / DEMO_TOTAL) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
      >
        <div
          ref={containerRef}
          className="relative w-full max-w-5xl aspect-video bg-[#0a0a0f] rounded-2xl border border-white/10 overflow-hidden flex flex-col"
        >
          {/* top progress bar */}
          <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-white/5">
            <div className="h-full bg-gradient-to-r from-amber-400 to-accent-orange transition-[width] duration-100" style={{ width: `${progress}%` }} />
          </div>

          {/* close */}
          <button onClick={onClose} aria-label="Close demo"
            className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <X size={16} />
          </button>

          {/* stage */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden p-6">
            {/* subtle background glow */}
            <div className="absolute inset-0 opacity-40">
              <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-accent-orange/15 rounded-full blur-[100px]" />
              <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px]" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={scene.id}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.5 }}
                className="relative w-full h-full flex flex-col items-center justify-center"
              >
                <div className="text-center mb-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-wider text-white/40">
                    Scene {sceneIndex + 1} / {SCENES.length}
                  </span>
                </div>
                <scene.Visual />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* narration + controls */}
          <div className="relative z-20 bg-gradient-to-t from-black/60 to-transparent px-6 py-4">
            <AnimatePresence mode="wait">
              <motion.p
                key={scene.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-center text-sm text-white/70 max-w-2xl mx-auto mb-4 leading-relaxed"
              >
                {finished ? "One Leadership Journey. One AI Platform. One Executive Future." : scene.narration}
              </motion.p>
            </AnimatePresence>

            {/* ending CTA */}
            <AnimatePresence>
              {finished && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4"
                >
                  <Link to="/beta" onClick={onClose}
                    className="bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all hover:-translate-y-0.5">
                    Apply for Founding Private Beta <ArrowRight size={16} />
                  </Link>
                  <button onClick={onClose}
                    className="bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 font-medium px-6 py-2.5 rounded-xl transition-colors">
                    Explore the Platform
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* controls */}
            <div className="flex items-center justify-center gap-2">
              <button onClick={replay} aria-label="Replay"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                <RotateCcw size={15} />
              </button>
              <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}
                className="w-11 h-11 rounded-full bg-accent-orange hover:bg-accent-orange/90 flex items-center justify-center text-white transition-colors">
                {finished ? <RotateCcw size={18} /> : playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </button>
              <button onClick={toggleFs} aria-label="Fullscreen"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                {fs ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <span className="ml-3 text-[11px] text-white/40 font-mono">
                {String(Math.floor(elapsed)).padStart(2, "0")}s / {DEMO_TOTAL}s
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}