import React, { useState } from "react";
import { Star, ThumbsUp, MessageSquare, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Panel, StatCard, Empty } from "./Shared";

export default function MarketFitPanel({ data, onSubmitted }) {
  const { toast } = useToast();
  const [tab, setTab] = useState("overview");
  const [submitting, setSubmitting] = useState(false);
  if (!data) return null;
  const { marketFit } = data;

  return (
    <div className="space-y-6">
      <div className="flex gap-1 mb-4 border-b border-white/5">
        <TabBtn active={tab === "overview"} onClick={() => setTab("overview")} label="PMF Overview" />
        <TabBtn active={tab === "survey"} onClick={() => setTab("survey")} label="Submit Survey" />
      </div>

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Star} label="PMF Score" value={`${marketFit.pmfScore}/100`} color={marketFit.pmfScore >= 60 ? "emerald" : "amber"} />
            <StatCard icon={ThumbsUp} label="NPS" value={marketFit.nps.score} sub={`${marketFit.nps.totalResponses} responses`} color="indigo" />
            <StatCard icon={Star} label="Avg CSAT" value={marketFit.avgCSAT || "—"} sub="out of 5" color="cyan" />
            <StatCard icon={MessageSquare} label="Total Surveys" value={marketFit.totalSurveys} color="purple" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel title="NPS Breakdown">
              <div className="space-y-3">
                <NpsBar label="Promoters (9-10)" value={marketFit.nps.promoters} total={marketFit.nps.totalResponses} color="bg-emerald-500/60" />
                <NpsBar label="Passives (7-8)" value={marketFit.nps.passives} total={marketFit.nps.totalResponses} color="bg-amber-500/60" />
                <NpsBar label="Detractors (0-6)" value={marketFit.nps.detractors} total={marketFit.nps.totalResponses} color="bg-red-500/60" />
              </div>
            </Panel>
            <Panel title="Value Ratings">
              <div className="space-y-3">
                <StatRow label="Avg Product Value" value={`${marketFit.avgValueRating || "—"} / 5`} />
                <StatRow label="Avg CES" value={`${marketFit.avgCES || "—"} / 7`} />
                <StatRow label="Avg NPS Score" value={marketFit.nps.avgScore} />
              </div>
            </Panel>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel title="Most Valuable Features">
              {marketFit.topValuable.length === 0 ? (
                <Empty text="No feature feedback yet." />
              ) : (
                <div className="space-y-1">
                  {marketFit.topValuable.map(([feat, count], i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1">
                      <span className="text-white/60">⭐ {feat}</span>
                      <span className="text-white/40 font-mono">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
            <Panel title="Least Valuable Features">
              {marketFit.topLeast.length === 0 ? (
                <Empty text="No feedback yet." />
              ) : (
                <div className="space-y-1">
                  {marketFit.topLeast.map(([feat, count], i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1">
                      <span className="text-white/60">⚠️ {feat}</span>
                      <span className="text-white/40 font-mono">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </>
      )}

      {tab === "survey" && <SurveyForm onSubmitted={onSubmitted} submitting={submitting} setSubmitting={setSubmitting} toast={toast} />}
    </div>
  );
}

function SurveyForm({ onSubmitted, submitting, setSubmitting, toast }) {
  const [type, setType] = useState("nps");
  const [score, setScore] = useState(8);
  const [mostValuable, setMostValuable] = useState("");
  const [leastValuable, setLeastValuable] = useState("");
  const [missingFeatures, setMissingFeatures] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await base44.entities.ProductInsight.create({
        insight_type: type,
        score: parseInt(score),
        most_valuable_feature: mostValuable || null,
        least_valuable_feature: leastValuable || null,
        missing_features: missingFeatures || null,
        feedback_text: feedback || null,
        likelihood_to_recommend: type === "nps" ? parseInt(score) : null,
        product_value_rating: type === "product_value" ? parseInt(score) : null,
        submitted_at: new Date().toISOString(),
      });
      toast({ title: "Thank you!", description: "Your feedback helps us build a better platform." });
      setFeedback("");
      setMostValuable("");
      setLeastValuable("");
      setMissingFeatures("");
      onSubmitted?.();
    } catch {
      toast({ title: "Error", description: "Could not submit feedback. Please try again.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const maxScore = type === "nps" ? 10 : type === "csat" ? 5 : type === "ces" ? 7 : 5;

  return (
    <Panel title="Product Feedback Survey">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-white/40 text-xs block mb-2">Survey Type</label>
          <div className="flex gap-2">
            {[["nps", "NPS (0-10)"], ["csat", "CSAT (1-5)"], ["ces", "CES (1-7)"], ["product_value", "Value (1-5)"]].map(([v, l]) => (
              <button key={v} type="button" onClick={() => { setType(v); setScore(v === "nps" ? 8 : v === "csat" ? 4 : 5); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${type === v ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-white/40 text-xs block mb-2">Score: <span className="text-indigo-400 font-bold">{score}</span></label>
          <input type="range" min={0} max={maxScore} value={score} onChange={(e) => setScore(e.target.value)} className="w-full accent-indigo-500" />
        </div>
        <input value={mostValuable} onChange={(e) => setMostValuable(e.target.value)} placeholder="Most valuable feature" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
        <input value={leastValuable} onChange={(e) => setLeastValuable(e.target.value)} placeholder="Least valuable feature" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
        <input value={missingFeatures} onChange={(e) => setMissingFeatures(e.target.value)} placeholder="Features you wish existed" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
        <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Open-ended feedback..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
        <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
          <Send size={14} /> {submitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </Panel>
  );
}

function TabBtn({ active, onClick, label }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${active ? "border-indigo-400 text-indigo-400" : "border-transparent text-white/40 hover:text-white/60"}`}>
      {label}
    </button>
  );
}

function NpsBar({ label, value, total, color }) {
  const pctVal = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-white/60 text-xs">{label}</span>
        <span className="text-white/40 text-xs font-mono">{value}</span>
      </div>
      <div className="bg-white/5 rounded-full h-2 overflow-hidden">
        <div className={`${color} h-full rounded-full`} style={{ width: `${pctVal}%` }} />
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1 text-xs">
      <span className="text-white/40">{label}</span>
      <span className="text-white/70 font-medium">{value}</span>
    </div>
  );
}