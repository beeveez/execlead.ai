import React from "react";
import {
  Inbox, Bug, Lightbulb, Clock, CheckCircle2, Rocket, TrendingUp,
  Timer, AlertTriangle, Sparkles, Smile,
} from "lucide-react";
import KpiCard from "@/components/product/KpiCard";
import SectionHeader from "@/components/product/SectionHeader";
import { formatHours } from "@/lib/productManagement";

export default function Dashboard({ pm, onSelect, onNavigate }) {
  const k = pm.insights?.kpis || {};
  const recent = pm.insights?.analytics?.recentActivity || [];

  const cards = [
    { icon: Inbox, label: "New Feedback", value: k.newFeedback || 0, color: "#3b82f6", onClick: () => onNavigate("inbox") },
    { icon: Bug, label: "Open Bugs", value: k.openBugs || 0, color: "#ef4444", onClick: () => onNavigate("bugs") },
    { icon: Lightbulb, label: "Feature Requests", value: k.featureRequests || 0, color: "#f59e0b", onClick: () => onNavigate("features") },
    { icon: TrendingUp, label: "Planned Features", value: k.plannedFeatures || 0, color: "#8b5cf6", onClick: () => onNavigate("roadmap") },
    { icon: Clock, label: "In Progress", value: k.inProgress || 0, color: "#6366f1", onClick: () => onNavigate("roadmap") },
    { icon: CheckCircle2, label: "Completed This Month", value: k.completedThisMonth || 0, color: "#10b981" },
    { icon: Rocket, label: "Released This Month", value: k.releasedThisMonth || 0, color: "#06b6d4", onClick: () => onNavigate("releases") },
    { icon: Smile, label: "Customer Satisfaction", value: `${k.customerSatisfaction || 0}%`, color: "#ec4899" },
    { icon: Timer, label: "Avg Response Time", value: formatHours(k.avgResponseTimeHours), color: "#f97316" },
    { icon: CheckCircle2, label: "Avg Resolution Time", value: formatHours(k.avgResolutionTimeHours), color: "#14b8a6" },
    { icon: AlertTriangle, label: "Waiting Review", value: k.waitingReview || 0, color: "#f59e0b", onClick: () => onNavigate("inbox") },
    { icon: Sparkles, label: "AI Priorities Suggested", value: k.aiSuggestedPriorities || 0, color: "#a855f7", onClick: () => onNavigate("insights") },
  ];

  return (
    <div>
      <SectionHeader
        icon={Inbox}
        title="Product Dashboard"
        description="Executive overview of feedback, bugs, features, releases, and operational health."
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {cards.map((c, i) => <KpiCard key={i} {...c} delay={i * 0.03} />)}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Recent Activity</h3>
        {recent.length === 0 ? (
          <p className="text-xs text-white/30 text-center py-6">No recent feedback.</p>
        ) : (
          <div className="space-y-1">
            {recent.map(item => (
              <div key={item.id} onClick={() => onSelect(item.id)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                <span className="text-xs text-white/30 w-20 shrink-0">{item.feedback_id}</span>
                <span className="text-sm text-white/70 flex-1 truncate">{item.title}</span>
                <span className="text-[10px] text-white/30">{item.type}</span>
                <span className="text-[10px] text-white/30">{new Date(item.created_date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}