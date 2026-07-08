import React, { useState, useEffect } from "react";
import { Rocket, X, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "execlead-early-access-dismissed";

export default function EarlyAccessBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === "true");
    } catch {}
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(STORAGE_KEY, "true"); } catch {}
  };

  if (dismissed) return null;

  return (
    <div className="relative z-40 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Rocket size={15} className="text-indigo-400 shrink-0" />
            <p className="text-xs md:text-sm text-white/60 truncate">
              <span className="text-white/80 font-medium">EXECLEAD.AI is currently in Early Access.</span>{" "}
              <span className="hidden sm:inline">We are welcoming our first Founding Members while preparing our official custom domain. All platform features and subscription payments are fully functional and securely processed.</span>
              <span className="sm:hidden">Welcoming Founding Members — all features fully functional.</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-medium transition-colors"
            >
              Learn More {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
            <button onClick={dismiss} className="text-white/30 hover:text-white/60 transition-colors p-1" aria-label="Dismiss banner">
              <X size={14} />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pb-1 flex items-start gap-2.5">
            <Globe size={14} className="text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-white/50 leading-relaxed">
              <span className="text-white/70 font-medium">Why a Base44 domain?</span> EXECLEAD.AI is hosted on Base44 during our Early Access phase, letting us focus on building exceptional AI-powered executive leadership tools. Our official custom domain (execlead.ai) will be connected as we grow — your account, subscription, and data will transition seamlessly without any action from you.{" "}
              <Link to="/pricing" className="text-indigo-400 hover:text-indigo-300 font-medium">View plans →</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}