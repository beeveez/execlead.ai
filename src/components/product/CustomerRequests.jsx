import React from "react";
import { Users, ThumbsUp, Bug, Lightbulb, Link2, Cpu, ChevronRight, TrendingUp } from "lucide-react";
import SectionHeader from "@/components/product/SectionHeader";

export default function CustomerRequests({ pm, onSelect }) {
  const cr = pm.insights?.customerRequests || {};

  const sections = [
    { icon: Lightbulb, title: "Most Requested Features", items: cr.mostRequestedFeatures, color: "#f59e0b" },
    { icon: TrendingUp, title: "Most Requested Improvements", items: cr.mostRequestedImprovements, color: "#10b981" },
    { icon: Bug, title: "Most Reported Bugs", items: cr.mostReportedBugs, color: "#ef4444" },
    { icon: Link2, title: "Most Requested Integrations", items: cr.mostRequestedIntegrations, color: "#6366f1" },
    { icon: Cpu, title: "Most Requested AI Models", items: cr.mostRequestedAIModels, color: "#a855f7" },
  ];

  return (
    <div>
      <SectionHeader icon={Users} title="Customer Requests" description="Demand-ranked features, improvements, bugs, integrations, and AI models — by customer votes." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sections.map((s, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-3"><s.icon size={13} style={{ color: s.color }} /><span className="text-xs font-medium text-white/70">{s.title}</span></div>
            {s.items && s.items.length > 0 ? (
              <div className="space-y-1">
                {s.items.map((item, idx) => (
                  <div key={item.id || idx} onClick={() => onSelect(item.id)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                    <span className="text-xs text-white/30 w-4 shrink-0">{idx + 1}</span>
                    <span className="flex-1 text-sm text-white/70 truncate">{item.title}</span>
                    {item.severity && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-500/10 text-red-400">{item.severity}</span>}
                    <span className="flex items-center gap-0.5 text-xs text-indigo-400 shrink-0"><ThumbsUp size={10} /> {item.votes || 0}</span>
                    <ChevronRight size={12} className="text-white/20 shrink-0" />
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-white/30 text-center py-4">No data yet.</p>}
          </div>
        ))}
      </div>
    </div>
  );
}