import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  READINESS_DOMAINS,
  CHECKLIST_GATES,
  computeOverallScore,
  computeGateSummary,
  computeBlockerSummary,
  computeDecision,
} from "@/lib/releaseReadinessEngine";
import { ScoreRing, StatusBadge, Spinner } from "@/components/release-readiness/Shared";
import ReadinessScorePanel from "@/components/release-readiness/ReadinessScorePanel";
import GoNoGoChecklist from "@/components/release-readiness/GoNoGoChecklist";
import BlockerRegistry from "@/components/release-readiness/BlockerRegistry";
import ReleaseTimeline from "@/components/release-readiness/ReleaseTimeline";
import ExecutiveDecisionPanel from "@/components/release-readiness/ExecutiveDecisionPanel";
import ReleaseReportsPanel from "@/components/release-readiness/ReleaseReportsPanel";
import { ShieldCheck, Gauge, ClipboardCheck, AlertTriangle, Rocket, Target, FileText } from "lucide-react";

const TABS = [
  { id: "score", label: "Readiness Score", icon: Gauge },
  { id: "checklist", label: "Go / No-Go", icon: ClipboardCheck },
  { id: "blockers", label: "Blockers", icon: AlertTriangle },
  { id: "timeline", label: "Timeline", icon: Rocket },
  { id: "decision", label: "Decision", icon: Target },
  { id: "reports", label: "Reports", icon: FileText },
];

export default function ReleaseReadiness() {
  const [activeTab, setActiveTab] = useState("score");
  const [blockers, setBlockers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlockers();
  }, []);

  async function loadBlockers() {
    try {
      const data = await base44.entities.ReleaseBlocker.list("-created_date", 100);
      setBlockers(data || []);
    } catch {
      setBlockers([]);
    } finally {
      setLoading(false);
    }
  }

  const score = computeOverallScore();
  const gateSummary = computeGateSummary();
  const blockerSummary = computeBlockerSummary(blockers);
  const decision = computeDecision(score, gateSummary, blockerSummary, READINESS_DOMAINS);

  const decisionColor =
    decision.recommendation === "GO"
      ? "text-emerald-400"
      : decision.recommendation === "GO_WITH_CONDITIONS"
      ? "text-amber-400"
      : "text-red-400";

  const reportData = { score, decision, gateSummary, blockerSummary, domains: READINESS_DOMAINS, blockers };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Release Readiness Command Center™</h1>
              <p className="text-xs text-white/40">Can EXECLEAD.AI safely launch today?</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero: Score + Decision */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {loading ? (
            <Spinner label="Loading release readiness data..." />
          ) : (
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="flex flex-col items-center">
                <ScoreRing score={score} size={130} label="Readiness" />
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wide text-white/40">Recommendation</div>
                  <div className={`text-base font-bold mt-0.5 ${decisionColor}`}>
                    {decision.recommendation === "GO" ? "GO" : decision.recommendation === "GO_WITH_CONDITIONS" ? "GO W/ CONDITIONS" : "NO GO"}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wide text-white/40">Gates Passing</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">{gateSummary.pass}/{gateSummary.total}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wide text-white/40">Open Blockers</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">{blockerSummary.unresolved}</div>
                  {blockerSummary.critical > 0 && <div className="text-[10px] text-red-400">{blockerSummary.critical} critical</div>}
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wide text-white/40">At-Risk Domains</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">
                    {READINESS_DOMAINS.filter((d) => d.status === "at_risk").length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#0a0a0f]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-400"
                      : "border-transparent text-white/40 hover:text-white/70"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "score" && <ReadinessScorePanel />}
        {activeTab === "checklist" && <GoNoGoChecklist />}
        {activeTab === "blockers" && <BlockerRegistry />}
        {activeTab === "timeline" && <ReleaseTimeline />}
        {activeTab === "decision" && (
          <ExecutiveDecisionPanel
            decision={decision}
            score={score}
            gateSummary={gateSummary}
            blockerSummary={blockerSummary}
            domains={READINESS_DOMAINS}
          />
        )}
        {activeTab === "reports" && <ReleaseReportsPanel reportData={reportData} />}
      </div>
    </div>
  );
}