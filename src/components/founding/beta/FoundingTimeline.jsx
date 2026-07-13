import React from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const ROADMAP = [
  { label: "Today", desc: "Founding Private Beta™ launched", active: true },
  { label: "Private Beta", desc: "RC1 — 50–100 invited members", active: true },
  { label: "Executive Feedback", desc: "Iterate on core capabilities", active: false },
  { label: "Early Access", desc: "RC2 — expanded invite codes", active: false },
  { label: "Open Beta", desc: "Public registration with waitlist", active: false },
  { label: "General Availability", desc: "Open to everyone, paid subscriptions", active: false },
  { label: "Founding Benefits Activated", desc: "Lifetime benefits locked in", active: false },
];

export default function FoundingTimeline() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <MapPin size={16} className="text-amber-400" />
        <h3 className="text-white font-semibold text-lg">Founding Member Timeline</h3>
      </div>
      <div className="relative pl-6">
        <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-amber-500/40 via-white/10 to-transparent" />
        <div className="space-y-5">
          {ROADMAP.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="relative"
            >
              <div className={`absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2 ${item.active ? "bg-amber-400 border-amber-300" : "bg-[#0d0d14] border-white/20"}`} />
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium">{item.label}</span>
                {item.active && (
                  <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] text-amber-400 font-medium uppercase">Current</span>
                )}
              </div>
              <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}