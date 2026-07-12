import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { Sparkles } from "lucide-react";
import { generateExecutiveBriefing, generateFallbackBriefing } from "@/lib/executiveBriefingEngine";
import BriefingHero from "@/components/dashboard/BriefingHero";
import ExecutivePriorities from "@/components/dashboard/ExecutivePriorities";
import ExecutiveInsights from "@/components/dashboard/ExecutiveInsights";
import ExecutiveDecision from "@/components/dashboard/ExecutiveDecision";

export default function DailyBriefing({ profile }) {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    generateExecutiveBriefing(user, activeWorkspace)
      .then(({ briefing }) => { if (!cancelled) setData(briefing); })
      .catch(() => { if (!cancelled) setData(generateFallbackBriefing(user, null)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/15 rounded-2xl p-6 h-48 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
          <div className="flex items-center gap-2 text-indigo-400 text-xs uppercase tracking-widest">
            <Sparkles size={12} /> Generating your daily briefing...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BriefingHero data={data} profile={profile} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExecutivePriorities priorities={data?.priorities} />
        <ExecutiveInsights insights={data?.insights} />
      </div>
      <ExecutiveDecision decision={data?.decision} />
    </div>
  );
}