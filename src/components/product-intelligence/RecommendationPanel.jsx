import React from "react";
import { Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Panel, PriorityBadge, Empty } from "./Shared";

export default function RecommendationPanel({ data }) {
  if (!data) return null;
  const { recommendations } = data;

  const typeIcons = {
    ai: Sparkles,
    learning: Lightbulb,
    retention: Lightbulb,
    coaching: Sparkles,
    commercial: ArrowRight,
    expansion: ArrowRight,
    report: ArrowRight,
  };

  return (
    <div className="space-y-6">
      <Panel title="EXEC™ Recommendation Engine™ — Automated Next Actions">
        <p className="text-white/40 text-xs mb-4">
          EXEC™ analyzes platform intelligence and recommends actions to improve customer success, adoption, and growth.
        </p>
        {recommendations.length === 0 ? (
          <Empty text="No recommendations at this time — all metrics are healthy." />
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, i) => {
              const Icon = typeIcons[rec.type] || Lightbulb;
              return (
                <div key={i} className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white/80 text-sm font-medium">{rec.title}</span>
                      <PriorityBadge priority={rec.priority} />
                    </div>
                    <p className="text-white/40 text-xs">{rec.detail}</p>
                  </div>
                  {rec.action && (
                    <Link to={rec.action} className="flex items-center gap-1 text-indigo-400 text-xs font-medium hover:text-indigo-300 flex-shrink-0">
                      Act <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel title="Customer Success Workspace™ — Recommendations by Category">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {["ai", "learning", "retention", "coaching", "commercial", "expansion"].map((cat) => {
            const catRecs = recommendations.filter((r) => r.type === cat);
            if (catRecs.length === 0) return null;
            return (
              <div key={cat} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <div className="text-white/50 text-xs font-semibold uppercase mb-2">{cat}</div>
                <div className="space-y-1">
                  {catRecs.map((r, i) => (
                    <div key={i} className="text-white/40 text-xs">• {r.title}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}