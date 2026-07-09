import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function ReservationCountdown({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    if (!expiresAt) return;
    const calc = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        expired: false,
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (timeLeft.expired) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
        <Clock size={14} className="text-red-400" />
        <span className="text-red-400 text-xs font-medium">Reserved pricing expired</span>
      </div>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-2">
      <Clock size={14} className="text-amber-400 flex-shrink-0" />
      <span className="text-white/40 text-xs whitespace-nowrap">Your reserved pricing expires in</span>
      <div className="flex items-center gap-1">
        {units.map((u, i) => (
          <React.Fragment key={u.label}>
            <div className="flex flex-col items-center bg-amber-500/10 border border-amber-500/20 rounded-md px-2 py-1 min-w-[36px]">
              <span className="text-amber-400 text-sm font-bold tabular-nums leading-none">{String(u.value).padStart(2, "0")}</span>
              <span className="text-amber-400/50 text-[8px] uppercase tracking-wider mt-0.5">{u.label}</span>
            </div>
            {i < units.length - 1 && <span className="text-amber-400/30 text-xs">:</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}