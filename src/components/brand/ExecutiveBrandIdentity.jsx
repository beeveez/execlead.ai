import React from "react";
import ExecutiveMark from "@/components/layout/ExecutiveMark";
import { BrandRegistry } from "@/lib/brandRegistry";

const COLORS = [
  { name: "Gold Highlight", hex: "#D4B483", label: "Champagne" },
  { name: "Gold Shadow", hex: "#A68759", label: "Burnished Bronze" },
  { name: "Primary", hex: "#6366f1", label: "Indigo" },
  { name: "Background", hex: "#0B111D", label: "Executive Navy" },
  { name: "Card", hex: "#0d0d14", label: "Card Surface" },
  { name: "Primary Dark", hex: "#4f46e5", label: "Indigo Dark" },
];

const MEANING_E = [
  { label: "Executive Leadership", desc: "The foundation of every decision" },
  { label: "Excellence", desc: "The standard we hold ourselves to" },
  { label: "Execution", desc: "Getting things done — not just talking" },
  { label: "Empowerment", desc: "Lifting others as you climb" },
];

const MEANING_ARROW = [
  { label: "Leadership Growth", desc: "Growth is never finished" },
  { label: "Career Progression", desc: "Every step builds on the last" },
  { label: "Continuous Learning", desc: "The journey never stops" },
  { label: "Promotion", desc: "Earning the next role, not waiting for it" },
  { label: "Executive Impact", desc: "Leading at a level that matters" },
];

export default function ExecutiveBrandIdentity() {
  return (
    <div className="space-y-8">
      {/* Logo Display */}
      <div className="bg-gradient-to-br from-amber-500/[0.06] via-indigo-500/[0.03] to-transparent border border-white/10 rounded-2xl p-8 md:p-12 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-[#0a0a0f] border border-amber-500/20 mb-6">
          <ExecutiveMark size={56}  />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{BrandRegistry.brandName} Executive Mark™</h2>
        <p className="text-white/40 text-sm max-w-lg mx-auto">
          A stylized capital "E" with a vertical spine, a horizontal bottom bar, an upward-angled middle bar, and a sharp-tipped arrow on the top bar pointing diagonally upward to the right.
        </p>
      </div>

      {/* Logo Meaning */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <ExecutiveMark size={22}  />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">The Executive "E"</h3>
              <p className="text-white/30 text-xs">Four meanings</p>
            </div>
          </div>
          <div className="space-y-3">
            {MEANING_E.map((m) => (
              <div key={m.label} className="flex items-start gap-2">
                <span className="text-amber-400 text-xs mt-0.5">▸</span>
                <div>
                  <span className="text-white/70 text-sm font-medium">{m.label}</span>
                  <span className="text-white/30 text-xs ml-2">{m.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 20 L12 4 M6 10 L12 4 L18 10" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">The Upward Arrow</h3>
              <p className="text-white/30 text-xs">Five meanings</p>
            </div>
          </div>
          <div className="space-y-3">
            {MEANING_ARROW.map((m) => (
              <div key={m.label} className="flex items-start gap-2">
                <span className="text-indigo-400 text-xs mt-0.5">↗</span>
                <div>
                  <span className="text-white/70 text-sm font-medium">{m.label}</span>
                  <span className="text-white/30 text-xs ml-2">{m.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brand Philosophy */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h3 className="text-white font-semibold text-sm mb-3">Brand Philosophy</h3>
        <p className="text-white/50 text-sm leading-relaxed">{BrandRegistry.brandPhilosophy}</p>
      </div>

      {/* Brand Colors */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h3 className="text-white font-semibold text-sm mb-4">Brand Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {COLORS.map((c) => (
            <div key={c.name} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div className="w-10 h-10 rounded-lg shrink-0 border border-white/10" style={{ backgroundColor: c.hex }} />
              <div className="min-w-0">
                <div className="text-white/70 text-xs font-medium">{c.name}</div>
                <div className="text-white/30 text-[10px] font-mono">{c.hex}</div>
                <div className="text-white/20 text-[10px]">{c.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h3 className="text-white font-semibold text-sm mb-4">Typography</h3>
        <div className="space-y-4">
          <div className="flex items-baseline gap-3">
            <span className="text-white/30 text-xs w-20 shrink-0">Heading</span>
            <span className="text-white/70 text-lg font-bold">EXECLEAD.AI</span>
            <span className="text-white/20 text-xs font-mono">ui-sans-serif, system-ui</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-white/30 text-xs w-20 shrink-0">Body</span>
            <span className="text-white/70 text-sm">Executive leadership development</span>
            <span className="text-white/20 text-xs font-mono">ui-sans-serif, system-ui</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-white/30 text-xs w-20 shrink-0">Mono</span>
            <span className="text-white/70 text-xs font-mono">0123456789</span>
            <span className="text-white/20 text-xs font-mono">ui-monospace</span>
          </div>
        </div>
      </div>

      {/* Logo Usage Guidelines */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-3">Clear Space</h3>
          <div className="flex items-center justify-center bg-[#0a0a0f] border border-white/5 rounded-xl p-8">
            <div className="relative">
              <div className="absolute -inset-4 border-2 border-dashed border-amber-500/20 rounded-lg" />
              <ExecutiveMark size={48}  />
            </div>
          </div>
          <p className="text-white/30 text-xs mt-3 text-center">Maintain padding equal to the mark height on all sides.</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-3">Minimum Sizes</h3>
          <div className="flex items-end justify-center gap-6 bg-[#0a0a0f] border border-white/5 rounded-xl p-8">
            <div className="text-center">
              <ExecutiveMark size={32}  />
              <div className="text-white/30 text-[10px] mt-2">32px</div>
              <div className="text-white/20 text-[10px]">Digital min</div>
            </div>
            <div className="text-center">
              <ExecutiveMark size={20}  />
              <div className="text-white/30 text-[10px] mt-2">20px</div>
              <div className="text-white/20 text-[10px]">Favicon min</div>
            </div>
            <div className="text-center">
              <ExecutiveMark size={14}  />
              <div className="text-white/30 text-[10px] mt-2">14px</div>
              <div className="text-white/20 text-[10px]">Absolute min</div>
            </div>
          </div>
          <p className="text-white/30 text-xs mt-3 text-center">Never display smaller than 14px.</p>
        </div>
      </div>

      {/* Dark & Light Variants */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h3 className="text-white font-semibold text-sm mb-4">Dark &amp; Light Variants</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-8 text-center">
            <ExecutiveMark size={48}  />
            <div className="text-white/40 text-xs mt-3">Dark Variant</div>
            <div className="text-white/20 text-[10px]">Gold mark on navy</div>
          </div>
          <div className="bg-white border border-black/10 rounded-xl p-8 text-center">
            <ExecutiveMark size={48}  />
            <div className="text-black/60 text-xs mt-3">Light Variant</div>
            <div className="text-black/30 text-[10px]">Dark gold on white</div>
          </div>
        </div>
      </div>

      {/* Brand Story */}
      <div className="bg-gradient-to-br from-indigo-500/[0.05] to-transparent border border-white/5 rounded-2xl p-6">
        <h3 className="text-white font-semibold text-sm mb-3">Official Brand Story</h3>
        <p className="text-white/50 text-sm leading-relaxed">{BrandRegistry.logoStory}</p>
      </div>
    </div>
  );
}