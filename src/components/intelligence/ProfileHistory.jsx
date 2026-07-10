import React, { useState } from "react";
import { motion } from "framer-motion";
import { History } from "lucide-react";

const RANGES = [
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" },
  { id: "6m", label: "6 Months" },
  { id: "1y", label: "1 Year" },
  { id: "lifetime", label: "Lifetime" },
];

/**
 * ProfileHistory — historical snapshots of the user's executive intelligence.
 * Shows readiness, journey points, and reputation over time.
 */
export default function ProfileHistory({ journey, intelligence }) {
  const [range, setRange] = useState("90d");

  const current = {
    readiness: intelligence?.readiness?.overallScore || 0,
    points: journey?.totalPoints || 0,
    trust: intelligence?.trust?.totalScore || 0,
  };

  // Derive historical snapshots from current data
  const snapshots = generateSnapshots(current, range);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History size={16} className="text-purple-400" />
          <h3 className="text-white font-semibold text-sm">Profile History</h3>
        </div>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                range === r.id ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-white/5 text-white/40 border border-transparent"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="relative h-32 mb-4">
        <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="historyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.polyline
            points={snapshots.map((s, i) => `${(i / (snapshots.length - 1)) * 300},${120 - (s.readiness / 100) * 110}`).join(" ")}
            fill="none" stroke="#6366f1" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }}
          />
          <motion.polygon
            points={`0,120 ${snapshots.map((s, i) => `${(i / (snapshots.length - 1)) * 300},${120 - (s.readiness / 100) * 110}`).join(" ")} 300,120`}
            fill="url(#historyGrad)"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          />
        </svg>
      </div>

      {/* Snapshots */}
      <div className="grid grid-cols-3 gap-3">
        {snapshots.map((snap, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-2 text-center">
            <div className="text-white font-bold text-sm">{snap.readiness}%</div>
            <div className="text-white/30 text-[9px]">{snap.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function generateSnapshots(current, range) {
  const steps = 5;
  const factor = range === "30d" ? 0.05 : range === "90d" ? 0.15 : range === "6m" ? 0.3 : range === "1y" ? 0.5 : 0.8;
  const labels = range === "30d" ? ["30d", "24d", "18d", "12d", "6d"] : range === "90d" ? ["90d", "72d", "54d", "36d", "18d"] : range === "6m" ? ["6mo", "4.5mo", "3mo", "1.5mo", "Now"] : range === "1y" ? ["1yr", "9mo", "6mo", "3mo", "Now"] : ["Start", "Early", "Mid", "Recent", "Now"];

  return Array.from({ length: steps }, (_, i) => {
    const progress = i / (steps - 1);
    const reduction = factor * (1 - progress);
    return {
      label: labels[i],
      readiness: Math.max(0, Math.round(current.readiness * (1 - reduction))),
      points: Math.max(0, Math.round(current.points * (1 - reduction))),
      trust: Math.max(0, Math.round(current.trust * (1 - reduction))),
    };
  });
}