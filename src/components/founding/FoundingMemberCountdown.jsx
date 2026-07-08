import React from "react";
import { motion } from "framer-motion";
import { useFoundingMemberCountdown } from "@/lib/foundingMember";

function TimeBlock({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ opacity: 0.5, y: -2 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/[0.02] border border-amber-500/20 flex items-center justify-center"
      >
        <span className="text-2xl md:text-3xl font-bold text-amber-200 tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </motion.div>
      <span className="text-amber-400/50 text-[10px] uppercase tracking-wider mt-2">{label}</span>
    </div>
  );
}

export default function FoundingMemberCountdown() {
  const { days, hours, minutes, seconds, expired } = useFoundingMemberCountdown();

  if (expired) {
    return (
      <div className="text-center py-8">
        <p className="text-amber-400/60 text-sm">
          The Founding Member Program has officially concluded.
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-3 md:gap-4 justify-center">
      <TimeBlock value={days} label="Days" />
      <TimeBlock value={hours} label="Hours" />
      <TimeBlock value={minutes} label="Minutes" />
      <TimeBlock value={seconds} label="Seconds" />
    </div>
  );
}