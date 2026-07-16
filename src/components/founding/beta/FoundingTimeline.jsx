import React from "react";
import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";

const STAGES = [
  {
    label: "Founding Private Beta",
    desc: "RC1 — 50–100 invited Founding Members",
    estimate: "Q3 2026",
    status: "active",
  },
  {
    label: "Beta Iteration",
    desc: "Collect feedback and improve core capabilities",
    estimate: "Q4 2026",
    status: "future",
  },
  {
    label: "Early Access",
    desc: "RC2 — Expanded invitations (up to 250 members)",
    estimate: "Q1 2027",
    status: "future",
  },
  {
    label: "Open Beta",
    desc: "Public registration with waitlist",
    estimate: "Q2 2027",
    status: "future",
  },
  {
    label: "General Availability (GA)",
    desc: "Public launch with paid subscriptions",
    estimate: "Q3 2027",
    status: "future",
  },
  {
    label: "Founding Benefits Locked",
    desc: "Lifetime Founding Member benefits permanently activated",
    estimate: "At GA",
    status: "future",
  },
];

function StageMarker({ status }) {
  if (status === "completed") {
    return (
      <div className="w-5 h-5 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
        <Check size={11} className="text-emerald-400" strokeWidth={3} />
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="w-5 h-5 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center gold-glow">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full bg-[#0d0d14] border-2 border-white/20 flex items-center justify-center">
      <Circle size={9} className="text-white/20" />
    </div>
  );
}

export default function FoundingTimeline({ hideCurrentDate = true }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <span className="text-amber-400">🟢</span>
        <h3 className="text-white font-semibold text-lg">Founding Member Timeline</h3>
      </div>
      <div className="relative pl-6">
        <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-amber-500/40 via-white/10 to-transparent" />
        <div className="space-y-5">
          {STAGES.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="relative"
            >
              <div className="absolute -left-[18px] top-0.5">
                <StageMarker status={item.status} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-sm font-medium ${
                    item.status === "active"
                      ? "text-amber-400"
                      : item.status === "completed"
                      ? "text-emerald-400"
                      : "text-white"
                  }`}
                >
                  {item.label}
                </span>
                {item.status === "active" && (
                  <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] text-amber-400 font-semibold uppercase">
                    Current
                  </span>
                )}
                {item.status === "completed" && (
                  <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] text-emerald-400 font-medium uppercase">
                    Done
                  </span>
                )}
              </div>
              <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
              {item.status === "future" && item.estimate && (
                <p className="text-white/25 text-[10px] mt-1">
                  <span className="text-white/30">ETA:</span> {item.estimate}
                </p>
              )}
              {item.status === "active" && item.estimate && (
                <p className="text-amber-400/50 text-[10px] mt-1">{item.estimate}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}