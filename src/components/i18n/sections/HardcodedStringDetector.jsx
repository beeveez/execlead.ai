import React from 'react';
import { Code2, AlertTriangle, Copy, KeyRound, FileWarning, Ban } from 'lucide-react';

const TYPE_ICONS = {
  hardcoded_string: Code2,
  missing_key: KeyRound,
  broken_placeholder: FileWarning,
  duplicate_key: Copy,
  unused_translation: Ban,
  invalid_formatting: AlertTriangle,
};

const SEVERITY_STYLES = {
  high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-white/5 text-white/40 border-white/10',
};

export default function HardcodedStringDetector({ data }) {
  const { total, bySeverity, byModule, violations } = data;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Code2 size={16} className="text-rose-400" />
        <h3 className="text-sm font-semibold text-white">Hardcoded String Detector™</h3>
        <span className="text-[10px] text-white/30 ml-auto">{total} violations</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-rose-400">{bySeverity.high || 0}</div>
          <div className="text-[10px] text-white/40">High Severity</div>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-amber-400">{bySeverity.medium || 0}</div>
          <div className="text-[10px] text-white/40">Medium Severity</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-white/40">{bySeverity.low || 0}</div>
          <div className="text-[10px] text-white/40">Low Severity</div>
        </div>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {violations.map((v) => {
          const Icon = TYPE_ICONS[v.type] || AlertTriangle;
          const st = SEVERITY_STYLES[v.severity] || SEVERITY_STYLES.low;
          return (
            <div key={v.id} className={`rounded-lg border p-3 ${st}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon size={12} />
                <span className="text-xs font-medium text-white flex-1 truncate">{v.string}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${st}`}>{v.severity}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-white/40">
                <span>{v.module}</span>
                <span className="text-white/20">·</span>
                <span className="font-mono">{v.file}</span>
              </div>
              <div className="text-[10px] text-white/50 mt-1">→ {v.recommendation}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}