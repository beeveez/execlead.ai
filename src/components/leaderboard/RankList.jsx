import React from "react";

const medal = (i) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`);

const ACCENTS = {
  indigo: "bg-indigo-500/5 border-indigo-500/10",
  violet: "bg-violet-500/5 border-violet-500/10",
  amber: "bg-amber-500/5 border-amber-500/10",
  cyan: "bg-cyan-500/5 border-cyan-500/10",
  emerald: "bg-emerald-500/5 border-emerald-500/10",
};

/**
 * Reusable ranked list with medals. Top 3 get an accent highlight.
 * renderName / renderMeta / renderRight are optional formatters.
 */
export default function RankList({ items, accent = "indigo", renderName, renderMeta, renderRight }) {
  if (!items || items.length === 0) return null;
  const accentBg = ACCENTS[accent] || ACCENTS.indigo;

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={item.id || i}
          className={`flex items-center gap-3 p-3 rounded-lg ${i < 3 ? accentBg : "bg-white/[0.02]"}`}
        >
          <span className="text-lg w-8 text-center shrink-0">{medal(i)}</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white/80 font-medium truncate">
              {renderName ? renderName(item) : item.name}
            </div>
            {renderMeta && <div className="text-xs text-white/30 truncate">{renderMeta(item)}</div>}
          </div>
          {renderRight && <div className="text-right shrink-0">{renderRight(item)}</div>}
        </div>
      ))}
    </div>
  );
}