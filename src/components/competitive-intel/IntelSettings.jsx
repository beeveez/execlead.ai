import React from "react";
import { Settings as SettingsIcon, ShieldCheck, Eye, Lock, FileCheck } from "lucide-react";
import { SectionHeader } from "@/components/commercial-revenue/shared";

export default function IntelSettings() {
  return (
    <div>
      <SectionHeader icon={SettingsIcon} title="Settings" subtitle="Data governance and AI transparency standards for the Strategic Market Intelligence Platform." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel icon={ShieldCheck} title="Data Governance" color="text-emerald-400">
          <ul className="text-xs text-white/60 space-y-1.5 list-disc list-inside">
            <li>Use only publicly available information.</li>
            <li>Use verified internal data.</li>
            <li>Use customer-approved win/loss information.</li>
            <li>Never scrape protected content.</li>
            <li>Never infer confidential pricing.</li>
            <li>Never fabricate features or capabilities.</li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Unknown", "Not Publicly Available", "Not Yet Verified"].map((t) => <span key={t} className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-white/60">{t}</span>)}
          </div>
        </Panel>
        <Panel icon={Eye} title="AI Transparency" color="text-indigo-400">
          <p className="text-xs text-white/60 mb-2">Every AI-generated insight must include:</p>
          <ul className="text-xs text-white/60 space-y-1.5 list-disc list-inside">
            <li>Knowledge Source</li>
            <li>Confidence</li>
            <li>Evidence Summary</li>
            <li>Last Updated</li>
            <li>Human Review Recommended (where appropriate)</li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Verified Fact", "AI Analysis", "Strategic Forecast"].map((t) => <span key={t} className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-white/60">{t}</span>)}
          </div>
        </Panel>
        <Panel icon={Lock} title="Information Source Standards" color="text-amber-400">
          <p className="text-xs text-white/60">All competitive claims remain grounded in verified, publicly available information. Unknown information is labeled transparently — never fabricated to fill gaps.</p>
        </Panel>
        <Panel icon={FileCheck} title="Compete Through Strategic Clarity" color="text-sky-400">
          <p className="text-xs text-white/60">EXECLEAD.AI competes through strategic clarity, evidence-based positioning, and differentiated executive leadership outcomes — not by copying competitors. Feature development prioritizes customer value over feature parity.</p>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ icon: Icon, title, color, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-3"><Icon size={16} className={color} /><h3 className="text-white text-sm font-semibold">{title}</h3></div>
      {children}
    </div>
  );
}