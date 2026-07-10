import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TIMELINE_RANGES } from "@/lib/journeyEngine";

/**
 * JourneyTimeline — chronological milestone display with date range filters.
 * Props: events (array), initialRange
 */
export default function JourneyTimeline({ events = [], initialRange = "lifetime" }) {
  const [range, setRange] = useState(initialRange);

  const filtered = useFilteredEvents(events, range);

  return (
    <div className="space-y-5">
      {/* Range filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {TIMELINE_RANGES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRange(r.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              range === r.id
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                : "bg-white/5 text-white/40 border border-transparent hover:text-white/60"
            }`}
          >
            {r.label}
          </button>
        ))}
        <span className="text-white/30 text-xs ml-auto">{filtered.length} events</span>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/50 text-sm font-medium">Your journey timeline is being built.</p>
          <p className="text-white/30 text-xs mt-1">Complete activities across the platform to populate your timeline.</p>
        </div>
      ) : (
        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-500/40 via-purple-500/20 to-transparent" />

          <div className="space-y-4">
            {filtered.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="relative"
              >
                {/* Dot */}
                <div
                  className={`absolute -left-[18px] top-3 w-3 h-3 rounded-full border-2 ${
                    event.milestone
                      ? "bg-indigo-500 border-indigo-300 shadow-lg shadow-indigo-500/30"
                      : "bg-white/10 border-white/20"
                  }`}
                />

                <div
                  className={`rounded-xl p-4 border transition-colors ${
                    event.milestone
                      ? "bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/15"
                      : "bg-white/[0.02] border-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-xl flex-shrink-0">{event.icon}</span>
                      <div className="min-w-0">
                        <h4 className={`text-sm font-medium ${event.milestone ? "text-white" : "text-white/80"}`}>{event.title}</h4>
                        {event.description && <p className="text-white/40 text-xs mt-0.5 truncate">{event.description}</p>}
                        <p className="text-white/25 text-xs mt-1">{formatDate(event.date)}</p>
                      </div>
                    </div>
                    {event.points > 0 && (
                      <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                        +{event.points}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function useFilteredEvents(events, range) {
  const [filtered, setFiltered] = useState(events);
  useEffect(() => {
    if (range === "lifetime") {
      setFiltered(events);
      return;
    }
    const now = Date.now();
    const cutoff =
      range === "30d" ? now - 30 * 86400000 :
      range === "90d" ? now - 90 * 86400000 :
      range === "year" ? now - 365 * 86400000 : 0;
    setFiltered(events.filter((e) => new Date(e.date).getTime() >= cutoff));
  }, [events, range]);
  return filtered;
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}