import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { analyzePlatform, generateRepairs } from "@/lib/selfHealingEngine";
import SelfHealingSummary from "./SelfHealingSummary";
import SelfHealingReport from "./SelfHealingReport";
import SelfHealingReview from "./SelfHealingReview";
import SelfHealingHistory from "./SelfHealingHistory";
import { Loader2, CheckCircle2 } from "lucide-react";

const ANALYZE_STEPS = [
  "Validating Platform Manifest™...",
  "Checking Module Registry...",
  "Checking Route Registry...",
  "Checking Workspace Registry...",
  "Checking Knowledge Pack Registry...",
  "Checking Framework Registry...",
  "Checking Capability Registry...",
  "Checking AI Persona Registry...",
  "Checking Subscription Registry...",
  "Checking Feature Flag Registry...",
  "Checking EXEC™ Knowledge Index...",
  "Checking Navigation Registry...",
];

const REPAIR_STEPS = [
  "Repairing Route Registry...",
  "Repairing Module Registry...",
  "Synchronizing Platform Manifest...",
  "Refreshing Knowledge Index...",
  "Rebuilding Navigation...",
];

const STEP_INTERVAL = 300;

export default function SelfHealingEngine() {
  const { user } = useAuth();
  const [phase, setPhase] = useState("loading");
  const [analysis, setAnalysis] = useState(null);
  const [repairResult, setRepairResult] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const result = analyzePlatform();
    setAnalysis(result);
    loadHistory();
    setPhase("idle");
  }, []);

  const loadHistory = async () => {
    try {
      const events = await base44.entities.SelfHealingEvent.list("-created_date", 20);
      setHistory(events);
    } catch (e) {
      setHistory([]);
    }
  };

  const logEvent = (eventType, data) => {
    try {
      base44.entities.SelfHealingEvent.create({
        user_id: user?.id || "system",
        user_name: user?.full_name || "System",
        event_type: eventType,
        total_findings: data.totalFindings || 0,
        safe_repairs_available: data.safeCount || 0,
        require_review: data.reviewCount || 0,
        issues_repaired: data.issuesRepaired || 0,
        remaining_issues: data.remaining || 0,
        coverage_before: data.coverageBefore || data.coverage || 0,
        coverage_after: data.coverageAfter || data.projectedCoverage || 0,
        health_before: data.healthBefore || data.healthScore || 0,
        health_after: data.healthAfter || data.projectedHealth || 0,
        analysis_time_ms: data.analysisTime || 0,
        repair_time_ms: data.repairTime || 0,
        platform_version: data.platformVersion,
        manifest_version: data.manifestVersion,
        knowledge_version: data.knowledgeVersion,
        findings_json: JSON.stringify(data.findings || []),
        repairs_json: JSON.stringify(data.repairs || []),
        review_items_json: JSON.stringify(data.review || []),
      });
      setTimeout(loadHistory, 500);
    } catch (e) {}
  };

  useEffect(() => {
    if (phase !== "analyzing" && phase !== "repairing") return;
    const steps = phase === "analyzing" ? ANALYZE_STEPS : REPAIR_STEPS;
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, STEP_INTERVAL);
    return () => clearInterval(timer);
  }, [phase]);

  const handleAnalyze = () => {
    setStepIndex(0);
    setPhase("analyzing");
    const duration = ANALYZE_STEPS.length * STEP_INTERVAL + 500;
    setTimeout(() => {
      const result = analyzePlatform();
      setAnalysis(result);
      setPhase("analysis");
      logEvent("analysis", result);
    }, duration);
  };

  const handleRepair = () => {
    if (!analysis) return;
    setStepIndex(0);
    setPhase("repairing");
    const startTime = Date.now();
    const duration = REPAIR_STEPS.length * STEP_INTERVAL + 500;
    setTimeout(() => {
      const repairs = generateRepairs(analysis.safe);
      const result = {
        ...analysis,
        issuesRepaired: repairs.length,
        coverageBefore: analysis.coverage,
        coverageAfter: analysis.projectedCoverage,
        healthBefore: analysis.healthScore,
        healthAfter: analysis.projectedHealth,
        remaining: analysis.reviewCount,
        repairTime: Date.now() - startTime,
        repairs,
      };
      setRepairResult(result);
      setPhase("repair");
      logEvent("repair", result);
    }, duration);
  };

  if (phase === "loading") {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 size={16} className="animate-spin text-emerald-500" />
        <span className="text-sm text-muted-foreground">Initializing Self-Healing Engine...</span>
      </div>
    );
  }

  if (phase === "analyzing" || phase === "repairing") {
    const steps = phase === "analyzing" ? ANALYZE_STEPS : REPAIR_STEPS;
    const label = phase === "analyzing" ? "Analyzing Platform..." : "Repairing Safe Issues...";
    return (
      <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Loader2 size={16} className="animate-spin text-emerald-500" />
          <p className="text-sm font-medium text-foreground">{label}</p>
        </div>
        <div className="space-y-1.5">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {i < stepIndex ? (
                <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
              ) : i === stepIndex ? (
                <Loader2 size={12} className="animate-spin text-emerald-500 flex-shrink-0" />
              ) : (
                <div className="w-3 h-3 rounded-full border border-border flex-shrink-0" />
              )}
              <span className={i <= stepIndex ? "text-foreground" : "text-muted-foreground/40"}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "analysis" && analysis) {
    return (
      <SelfHealingReport
        type="analysis"
        data={analysis}
        onStartRepair={handleRepair}
        onReview={() => setPhase("review")}
        onCancel={() => setPhase("idle")}
      />
    );
  }

  if (phase === "repair" && repairResult) {
    return (
      <SelfHealingReport
        type="repair"
        data={repairResult}
        onReview={() => setPhase("review")}
        onDone={() => {
          setPhase("idle");
          const result = analyzePlatform();
          setAnalysis(result);
        }}
      />
    );
  }

  if (phase === "review") {
    return <SelfHealingReview findings={analysis?.review || []} onBack={() => setPhase("idle")} />;
  }

  if (phase === "history") {
    return <SelfHealingHistory events={history} onBack={() => setPhase("idle")} />;
  }

  return (
    <SelfHealingSummary
      analysis={analysis}
      onAnalyze={handleAnalyze}
      onRepair={handleRepair}
      onReview={() => setPhase("review")}
      onHistory={() => setPhase("history")}
    />
  );
}