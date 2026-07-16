import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Brain } from "lucide-react";
import { getLatestBIReport, generateBIReport, listBIReports } from "@/lib/businessIntelligenceEngine";
import BIReportHero from "@/components/business-intelligence/BIReportHero";
import BIMetricsGrid from "@/components/business-intelligence/BIMetricsGrid";
import AutomationEffectivenessPanel from "@/components/business-intelligence/AutomationEffectivenessPanel";
import WeeklyNarrativePanel from "@/components/business-intelligence/WeeklyNarrativePanel";
import ImprovementLoopPanel from "@/components/business-intelligence/ImprovementLoopPanel";
import ROIWorkflowPanel from "@/components/business-intelligence/ROIWorkflowPanel";

export default function BusinessIntelligenceCenter() {
  const [report, setReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const loadLatest = useCallback(async () => {
    setLoading(true);
    try {
      const { report: latest } = await getLatestBIReport();
      setReport(latest);
      setSelectedPeriod(latest?.period || null);
      const { reports: list } = await listBIReports(20);
      setReports(list || []);
    } catch {
      setReport(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadLatest(); }, [loadLatest]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const data = await generateBIReport();
      setReport(data.report);
      setSelectedPeriod(data.report?.period);
      const { reports: list } = await listBIReports(20);
      setReports(list || []);
    } catch {
      // error handled by toast in production
    }
    setGenerating(false);
  };

  const handleSelectReport = (r) => {
    setReport(r);
    setSelectedPeriod(r.period);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Brain size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Business Intelligence™</h1>
            <p className="text-white/40 text-sm">Outcome analytics & continuous improvement loop</p>
          </div>
        </div>

        {/* Period selector */}
        {reports.length > 0 && (
          <select
            value={selectedPeriod || ""}
            onChange={(e) => {
              const r = reports.find(r => r.period === e.target.value);
              if (r) handleSelectReport(r);
            }}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-indigo-500/40"
          >
            {reports.map((r) => (
              <option key={r.id} value={r.period} className="bg-[#0d0d14]">
                {r.period} — Score: {r.overall_health_score}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Hero */}
      <BIReportHero report={report} onGenerate={handleGenerate} generating={generating} />

      {/* Metrics Grid */}
      {report && <BIMetricsGrid report={report} />}

      {/* Automation Effectiveness */}
      {report && <AutomationEffectivenessPanel report={report} />}

      {/* Weekly Narrative */}
      {report && <WeeklyNarrativePanel report={report} />}

      {/* ROI by Workflow */}
      {report && <ROIWorkflowPanel report={report} />}

      {/* Continuous Improvement Loop */}
      <ImprovementLoopPanel reportPeriod={selectedPeriod} />

      {!report && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Brain size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No Business Intelligence report yet.</p>
          <p className="text-white/30 text-xs mt-1">Click "Generate Report" to analyze outcomes and create improvement actions.</p>
        </div>
      )}
    </div>
  );
}