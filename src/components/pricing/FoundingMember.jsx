import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Crown, Clock, Check, ArrowRight } from "lucide-react";

const TARGET_DATE = new Date("2026-10-01T00:00:00").getTime();

const BENEFITS = [
  "Lifetime Founding Member Badge",
  "25% Lifetime Discount (while subscription remains active)",
  "Early Access to New Features",
  "Priority Feature Requests",
  "Exclusive Founding Member Community",
  "Direct Product Feedback Sessions",
];

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, TARGET_DATE - Date.now()));
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, TARGET_DATE - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

function TimeBlock({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
        <span className="text-2xl md:text-3xl font-bold text-white tabular-nums">{String(value).padStart(2, "0")}</span>
      </div>
      <span className="text-white/30 text-[10px] uppercase tracking-wider mt-2">{label}</span>
    </div>
  );
}

export default function FoundingMember() {
  const { days, hours, minutes, seconds } = useCountdown();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-8 md:p-12"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-full mb-5">
            <Crown size={14} className="text-amber-400" />
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Limited Time · Founding Member</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Become a Founding Member</h2>
          <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-md">
            Join the first cohort of EXECLEAD.AI leaders. Founding Members receive exclusive lifetime benefits available only during this limited launch window.
          </p>
          <ul className="space-y-2.5 mb-8">
            {BENEFITS.map((benefit, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-white/60">
                <Check size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Claim Founding Member Status <ArrowRight size={16} />
          </Link>
        </div>

        <div className="flex flex-col items-center lg:items-end">
          <div className="flex items-center gap-2 text-amber-400 mb-5">
            <Clock size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Program Closes In</span>
          </div>
          <div className="flex gap-3 md:gap-4">
            <TimeBlock value={days} label="Days" />
            <TimeBlock value={hours} label="Hours" />
            <TimeBlock value={minutes} label="Mins" />
            <TimeBlock value={seconds} label="Secs" />
          </div>
          <p className="text-white/30 text-xs mt-6 text-center lg:text-right max-w-xs">
            Once the countdown ends, the Founding Member program closes permanently.
          </p>
        </div>
      </div>
    </motion.div>
  );
}