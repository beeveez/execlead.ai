import React from "react";
import { Mail, Globe } from "lucide-react";
import { BrandRegistry } from "@/lib/brandRegistry";

/**
 * Reusable executive email signature block.
 * Pulls from BrandRegistry.founder — the single source of truth.
 */
export default function EmailSignature({ className = "" }) {
  const f = BrandRegistry.founder;
  return (
    <div className={`bg-white/[0.02] border border-white/10 rounded-xl p-5 ${className}`}>
      <div className="text-white font-semibold text-sm">{f.name}</div>
      <div className="text-white/50 text-xs mt-0.5">
        {f.title} | {f.company}
      </div>
      <div className="text-white/40 text-xs">{f.roleLine}</div>
      <div className="mt-3 space-y-1.5">
        <a
          href={`mailto:${f.email}`}
          className="flex items-center gap-2 text-white/60 hover:text-white/90 text-xs transition-colors break-all"
        >
          <Mail size={13} className="text-indigo-400 flex-shrink-0" /> {f.email}
        </a>
        <a
          href={f.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/60 hover:text-white/90 text-xs transition-colors"
        >
          <Globe size={13} className="text-cyan-400 flex-shrink-0" /> {f.website}
        </a>
      </div>
      <p className="text-white/35 text-xs mt-3 italic leading-relaxed">{f.tagline}</p>
    </div>
  );
}