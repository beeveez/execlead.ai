import React, { useState, useEffect, useMemo } from "react";
import { FileText, Loader2, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import ReportDetailCard from "@/components/developer/reports/ReportDetailCard";
import ReportCompareView from "@/components/developer/reports/ReportCompareView";
import { buildPlatformValidationReport } from "@/lib/reports/platformValidationReport";
import { downloadPDF } from "@/lib/reports/enterpriseReportEngine";

export default function ReportRegistry() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const [compareAId, setCompareAId] = useState(null);
  const [compareBId, setCompareBId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.EnterpriseReport.list("-generated_date", 100);
      setReports(data);
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    } catch (e) {
      console.error("Failed to load reports:", e);
    } finally {
      setLoading(false);
    }
  };

  const grouped = useMemo(() => {
    const map = {};
    reports.forEach((r) => {
      if (!map[r.report_name]) map[r.report_name] = [];
      map[r.report_name].push(r);
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => b.version - a.version));
    return map;
  }, [reports]);

  const selectedReport = reports.find((r) => r.id === selectedId);
  const selectedGroup = selectedReport ? grouped[selectedReport.report_name] || [] : [];

  const handleCompare = () => {
    if (selectedGroup.length < 2) {
      toast({ title: "Not enough versions", description: "Need at least 2 versions to compare.", variant: "destructive" });
      return;
    }
    const idx = selectedGroup.findIndex((r) => r.id === selectedId);
    setCompareAId(selectedGroup[Math.min(idx + 1, selectedGroup.length - 1)].id);
    setCompareBId(selectedId);
    setShowCompare(true);
  };

  const handleExportAgain = async () => {
    if (!selectedReport) return;
    setActionLoading("export");
    try {
      const reportDef = await buildPlatformValidationReport("full_engineering", user);
      await downloadPDF(reportDef);
      await base44.entities.EnterpriseReport.update(selectedReport.id, { downloads: (selectedReport.downloads || 0) + 1 });
      await loadReports();
      toast({ title: "Report exported", description: "Platform Validation™ report downloaded." });
    } catch (e) {
      toast({ title: "Export failed", description: e?.message || "Could not generate report.", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async () => {
    if (!selectedReport) return;
    setActionLoading("archive");
    try {
      await base44.entities.EnterpriseReport.update(selectedReport.id, { status: "archived" });
      await loadReports();
      toast({ title: "Report archived", description: `${selectedReport.report_name} v${selectedReport.version} archived.` });
    } catch (e) {
      toast({ title: "Archive failed", description: e?.message || "Could not archive report.", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const compareA = reports.find((r) => r.id === compareAId);
  const compareB = reports.find((r) => r.id === compareBId);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-400" size={24} />
      </div>
    );
  }

  const selectClass = "bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white outline-none cursor-pointer";

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <FileText size={12} className="text-indigo-400" /> Developer
        </div>
        <h1 className="text-2xl font-bold text-white">Enterprise Report Registry™</h1>
        <p className="text-white/40 text-sm mt-1">Versioned registry of every enterprise report generated across the platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-2">
          <div className="text-white/40 text-xs uppercase tracking-wider px-1 mb-2">Reports</div>
          {reports.length === 0 && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
              <p className="text-white/30 text-xs">No reports yet.</p>
            </div>
          )}
          {Object.entries(grouped).map(([name, versions]) => {
            const latest = versions[0];
            const isActive = selectedReport?.report_name === name;
            return (
              <button key={name} onClick={() => setSelectedId(latest.id)} className={`w-full text-left p-3 rounded-xl border transition-colors ${isActive ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/[0.02] border-white/5 hover:bg-white/5"}`}>
                <div className="text-white text-sm font-medium truncate">{name}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-white/30 text-xs">v{latest.version} · {versions.length} versions</span>
                  <ChevronRight size={12} className={isActive ? "text-indigo-400" : "text-white/20"} />
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-3 space-y-4">
          <ReportDetailCard
            report={selectedReport}
            versionGroup={selectedGroup}
            onSelectVersion={setSelectedId}
            onExportAgain={handleExportAgain}
            onArchive={handleArchive}
            onCompare={handleCompare}
            loading={actionLoading}
          />

          {showCompare && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <select value={compareAId || ""} onChange={(e) => setCompareAId(e.target.value)} className={selectClass}>
                  {selectedGroup.map((r) => <option key={r.id} value={r.id}>v{r.version} — {new Date(r.generated_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</option>)}
                </select>
                <span className="text-white/30 text-xs">vs</span>
                <select value={compareBId || ""} onChange={(e) => setCompareBId(e.target.value)} className={selectClass}>
                  {selectedGroup.map((r) => <option key={r.id} value={r.id}>v{r.version} — {new Date(r.generated_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</option>)}
                </select>
              </div>
              <ReportCompareView reportA={compareA} reportB={compareB} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}