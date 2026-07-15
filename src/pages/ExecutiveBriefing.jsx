import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import {
  generateBriefing, getBriefingForPeriod, getBriefingHistory,
  markBriefingRead, getWeeklyPeriod, parseBriefing,
} from "@/lib/executiveBriefingEngine";
import { FileText, Sparkles, ArrowRight } from "lucide-react";
import BriefingHero from "@/components/briefing/BriefingHero";
import BriefingSummary from "@/components/briefing/BriefingSummary";
import BriefingForecast from "@/components/briefing/BriefingForecast";
import BriefingProgress from "@/components/briefing/BriefingProgress";
import BriefingActions from "@/components/briefing/BriefingActions";
import BriefingTimeline from "@/components/briefing/BriefingTimeline";
import BriefingInsights from "@/components/briefing/BriefingInsights";
import BriefingHistory from "@/components/briefing/BriefingHistory";
import BriefingSkeleton from "@/components/briefing/BriefingSkeleton";

export default function ExecutiveBriefing() {
  const { user } = useAuth();
  const [briefing, setBriefing] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user?.id) loadBriefing();
  }, [user?.id]);

  const loadBriefing = async () => {
    try {
      const period = getWeeklyPeriod();
      const existing = await getBriefingForPeriod(user.id, period);
      const hist = await getBriefingHistory(user.id, 20);
      setHistory(hist);
      if (existing) {
        setBriefing(existing);
        markBriefingRead(existing.id);
        base44.analytics.track({ eventName: "executive_briefing_viewed", properties: { period } });
      }
    } catch {}
    setLoading(false);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generateBriefing(user);
      setBriefing(result);
      const hist = await getBriefingHistory(user.id, 20);
      setHistory(hist);
      markBriefingRead(result.id);
      base44.analytics.track({ eventName: "executive_briefing_generated", properties: { period: result.period } });
    } catch {}
    setGenerating(false);
  };

  const handlePrint = () => {
    base44.analytics.track({ eventName: "executive_briefing_pdf_downloaded" });
    window.print();
  };

  if (loading || generating) return <BriefingSkeleton />;

  if (showHistory) {
    return (
      <BriefingHistory
        briefings={history}
        onSelect={(b) => { setBriefing(b); setShowHistory(false); }}
        onBack={() => setShowHistory(false)}
      />
    );
  }

  if (!briefing) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Your Weekly Executive Briefing™</h1>
          <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-md mx-auto">
            An AI-generated leadership intelligence report that synthesizes your entire executive journey —
            promotion readiness, leadership DNA, learning progress, and strategic recommendations — into one
            concise weekly briefing.
          </p>
          <button
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded-lg px-5 py-2.5 transition-colors"
          >
            <Sparkles size={14} /> Generate This Week's Briefing
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  const parsed = parseBriefing(briefing);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6">
      <BriefingHero
        briefing={parsed}
        onRegenerate={handleGenerate}
        onHistory={() => setShowHistory(true)}
      />
      <BriefingSummary briefing={parsed} />
      <BriefingInsights briefing={parsed} />
      <BriefingForecast briefing={parsed} />
      <BriefingProgress briefing={parsed} />
      <BriefingActions briefing={parsed} />
      <BriefingTimeline briefing={parsed} />
      <div className="flex justify-center pb-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-2 transition-colors"
        >
          <FileText size={12} /> Download PDF
        </button>
      </div>
    </div>
  );
}