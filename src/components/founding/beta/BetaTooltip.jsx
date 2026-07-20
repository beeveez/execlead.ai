import React, { useState, useId } from "react";
import { Info } from "lucide-react";

/**
 * Accessible tooltip — visible on hover AND keyboard focus.
 * Uses role="tooltip" + aria-describedby for screen readers.
 */
export default function BetaTooltip({ text, label }) {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-describedby={visible ? tooltipId : undefined}
        aria-label={`More information about ${label}`}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="text-white/20 hover:text-white/40 focus:outline-none focus:text-white/40 cursor-help align-middle"
      >
        <Info size={10} />
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black/90 border border-white/10 rounded-lg text-[10px] font-normal text-white/60 normal-case tracking-normal leading-relaxed pointer-events-none z-20 transition-opacity duration-150 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        {text}
      </span>
    </span>
  );
}