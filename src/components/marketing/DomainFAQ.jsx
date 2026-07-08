import React, { useState } from "react";
import { Globe, ChevronDown, ChevronUp, Check } from "lucide-react";

export default function DomainFAQ() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Globe size={18} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm md:text-base">Why is EXECLEAD.AI using a Base44 domain?</h3>
            <p className="text-white/40 text-xs mt-0.5">Learn about our Early Access phase and domain transition plan.</p>
          </div>
        </div>
        {open ? <ChevronUp size={18} className="text-white/40 shrink-0" /> : <ChevronDown size={18} className="text-white/40 shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-5 pl-[4.5rem] space-y-4">
          <p className="text-sm text-white/60 leading-relaxed">
            EXECLEAD.AI is currently hosted on Base44 during our Early Access phase. This allows us to focus our resources on building exceptional AI-powered executive leadership tools rather than infrastructure.
          </p>
          <p className="text-sm text-white/60 leading-relaxed">
            Our official custom domain <span className="text-indigo-400 font-medium">(execlead.ai)</span> will be connected as we continue to grow.
          </p>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
            <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-300/80">
              Your account, subscription, and data will transition seamlessly without requiring any action from you.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}