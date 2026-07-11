import React from "react";
import { useNavigate } from "react-router-dom";
import { groupReviewItems, getRelatedPath } from "@/lib/selfHealingEngine";
import { ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";

export default function SelfHealingReview({ findings, onBack }) {
  const navigate = useNavigate();
  const groups = groupReviewItems(findings);

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500" />
          <h3 className="text-sm font-bold text-foreground">Review Center</h3>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={12} /> Back
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">No issues requiring review.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">All findings have been auto-repaired.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {groups.map((group, gi) => (
            <div key={gi} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">{group.category}</span>
                <span className="text-[10px] text-muted-foreground">({group.items.length} item{group.items.length > 1 ? "s" : ""})</span>
              </div>
              {group.items.map((item, ii) => (
                <div key={ii} className="bg-background/50 border border-border rounded-md p-3 space-y-2">
                  <p className="text-xs text-foreground">{item.message}</p>
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase">Impact</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.impact}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase">Recommendation</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.recommendation}</p>
                  </div>
                  <button
                    onClick={() => navigate(getRelatedPath(item))}
                    className="flex items-center gap-1 text-[11px] text-emerald-500 hover:text-emerald-400 transition-colors"
                  >
                    Open Related Module <ArrowRight size={10} />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}