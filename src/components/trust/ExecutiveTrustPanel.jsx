import React from "react";
import { Check, X, Clock, ShieldCheck } from "lucide-react";
import { getTrustItems, TRUST_LEVELS, calculateTrustLevel } from "@/lib/trustEngine";

function TrustItem({ item }) {
  const levelMeta = TRUST_LEVELS.find(l => l.name === item.label);
  const color = levelMeta?.color || "#64748b";

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
      item.verified ? "bg-white/[0.02] border-white/10" : "bg-white/[0.01] border-white/5"
    }`}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: item.verified ? `${color}15` : "rgba(255,255,255,0.03)" }}>
        {item.verified ? (
          <Check size={14} style={{ color }} />
        ) : (
          <Clock size={14} className="text-white/20" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm font-medium ${item.verified ? "text-white/80" : "text-white/40"}`}>
            {item.label}
          </span>
          <span className="text-[10px] text-white/30 font-mono">+{item.score}</span>
        </div>
        {item.verified ? (
          <div className="mt-1 space-y-0.5">
            {item.date && (
              <p className="text-[11px] text-white/30">
                Verified: {new Date(item.date).toLocaleDateString()}
              </p>
            )}
            {item.method && (
              <p className="text-[11px] text-white/30">Method: {item.method}</p>
            )}
            {item.verifiedBy && (
              <p className="text-[11px] text-white/30">By: {item.verifiedBy}</p>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-white/20 mt-0.5">Not yet verified</p>
        )}
      </div>
    </div>
  );
}

export default function ExecutiveTrustPanel({ verification }) {
  const items = getTrustItems(verification);
  const level = calculateTrustLevel(verification);
  const verifiedCount = items.filter(i => i.verified).length;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-violet-400" />
          <h3 className="text-white font-semibold text-sm">Executive Trust</h3>
        </div>
        <span className="text-xs text-white/40">{verifiedCount} of {items.length} verified</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {items.map(item => (
          <TrustItem key={item.key} item={item} />
        ))}
      </div>
      {level === 5 && (
        <div className="mt-4 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20 rounded-lg">
          <span className="text-lg">🏆</span>
          <span className="text-purple-300 font-semibold text-sm">Verified Executive</span>
        </div>
      )}
    </div>
  );
}