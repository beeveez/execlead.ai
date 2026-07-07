import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { DEFAULT_FEATURES } from "@/lib/featureCatalog";
import { runConsistencyCheck } from "@/lib/consistencyEngine";
import { Loader2, Plus, RefreshCw, Boxes, Activity, AlertTriangle, Route as RouteIcon, X, Code2, Copy, Check } from "lucide-react";
import FeatureEditor from "@/components/admin/FeatureEditor";
import HealthScoreDashboard from "@/components/admin/HealthScoreDashboard";
import FindingsPanel from "@/components/admin/FindingsPanel";
import RouteRegistryTable from "@/components/admin/RouteRegistryTable";
import DeploymentGate from "@/components/admin/DeploymentGate";

const TABS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "findings", label: "Findings", icon: AlertTriangle },
  { id: "registry", label: "Route Registry", icon: RouteIcon },
  { id: "features", label: "Features", icon: Boxes },
];

export default function FeatureManagement() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [user, setUser] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [tab, setTab] = useState("overview");
  const [report, setReport] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [runningActionId, setRunningActionId] = useState(null);
  const [doneActionIds, setDoneActionIds] = useState([]);
  const [applying, setApplying] = useState(false);
  const [preview, setPreview] = useState(null);
  const [undoLog, setUndoLog] = useState([]);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    loadFeatures();
  }, []);

  const runEngine = useCallback(async (liveFeatures) => {
    const r = runConsistencyCheck(liveFeatures);
    setReport(r);
    return r;
  }, []);

  const loadFeatures = async () => {
    setLoading(true);
    try {
      const records = await base44.entities.Feature.list("sort_order", 200);
      setFeatures(records);
      await runEngine(records);
    } catch (e) {
      await runEngine([]);
    }
    setLoading(false);
  };

  const initializeCatalog = async () => {
    setSaving("init");
    try {
      await base44.entities.Feature.bulkCreate(
        DEFAULT_FEATURES.map((f) => ({
          feature_id: f.id, name: f.name, description: f.description, category: f.category,
          icon: f.icon, minimum_plan: f.minimumPlan, is_enabled: f.isEnabled, sort_order: f.sortOrder,
          limit_label: f.limitLabel || "", status: "live", visibility: "public", coming_soon: false,
          nav_enabled: false, pricing_enabled: true,
        }))
      );
      await loadFeatures();
    } catch (e) { console.error(e); }
    setSaving(null);
  };

  const saveFeature = async (form) => {
    setSaving(form.feature_id);
    try {
      if (form.id) {
        await base44.entities.Feature.update(form.id, {
          name: form.name, description: form.description, category: form.category, module: form.module || "",
          icon: form.icon, minimum_plan: form.minimum_plan, required_role: form.required_role || "",
          status: form.status || "live", visibility: form.visibility || "public", coming_soon: form.coming_soon ?? false,
          nav_enabled: form.nav_enabled ?? false, pricing_enabled: form.pricing_enabled ?? true,
          route_path: form.route_path || "", nav_label: form.nav_label || "", expected_release: form.expected_release || "",
          is_enabled: form.is_enabled, sort_order: Number(form.sort_order), limit_label: form.limit_label || "",
        });
        setFeatures((prev) => prev.map((f) => (f.id === form.id ? { ...f, ...form } : f)));
      } else {
        const created = await base44.entities.Feature.create({
          feature_id: form.feature_id, name: form.name, description: form.description || "",
          category: form.category || "Platform", module: form.module || "", icon: form.icon || "Sparkles",
          minimum_plan: form.minimum_plan || "free", required_role: form.required_role || "", status: form.status || "live",
          visibility: form.visibility || "public", coming_soon: form.coming_soon ?? false, nav_enabled: form.nav_enabled ?? false,
          pricing_enabled: form.pricing_enabled ?? true, route_path: form.route_path || "", nav_label: form.nav_label || "",
          expected_release: form.expected_release || "", is_enabled: form.is_enabled !== false, sort_order: Number(form.sort_order) || 0,
          limit_label: form.limit_label || "",
        });
        setFeatures((prev) => [...prev, created]);
        setShowNew(false);
      }
      await runEngine(features);
    } catch (e) { console.error(e); }
    setSaving(null);
  };

  const deleteFeature = async (form) => {
    if (!form.id) return;
    if (!confirm(`Delete "${form.name}"?`)) return;
    try {
      await base44.entities.Feature.delete(form.id);
      setFeatures((prev) => prev.filter((f) => f.id !== form.id));
      await runEngine(features.filter((f) => f.id !== form.id));
    } catch (e) { console.error(e); }
  };

  /* ----------------------- self-heal execution ----------------------- */

  const snapshotFeature = (featureId) => {
    const rec = features.find((f) => f.feature_id === featureId);
    return rec ? { ...rec } : null;
  };

  const executeEntityAction = async (finding, action) => {
    const actionKey = `${finding.id}:${action.id}`;
    setRunningActionId(actionKey);
    try {
      const def = DEFAULT_FEATURES.find((f) => f.id === action.featureId);
      if (action.op === "create" && def) {
        const created = await base44.entities.Feature.create({
          feature_id: def.id, name: def.name, description: def.description, category: def.category,
          icon: def.icon, minimum_plan: def.minimumPlan, is_enabled: def.isEnabled, sort_order: def.sortOrder,
          limit_label: def.limitLabel || "", status: "live", visibility: "public", coming_soon: false,
          nav_enabled: false, pricing_enabled: true,
        });
        setFeatures((prev) => [...prev, created]);
        setUndoLog((prev) => [...prev, { type: "create", recordId: created.id }]);
      } else if (action.op === "delete" && action.recordId) {
        const prev = snapshotFeature(action.featureId);
        await base44.entities.Feature.delete(action.recordId);
        setFeatures((prev) => prev.filter((f) => f.id !== action.recordId));
        if (prev) setUndoLog((prev) => [...prev, { type: "delete", record: prev }]);
      } else if (action.op === "repair_route" && action.recordId) {
        const prev = snapshotFeature(action.featureId);
        await base44.entities.Feature.update(action.recordId, { route_path: action.expectedRoute });
        setFeatures((prev) => prev.map((f) => (f.id === action.recordId ? { ...f, route_path: action.expectedRoute } : f)));
        if (prev) setUndoLog((prev) => [...prev, { type: "update", recordId: action.recordId, prev: { route_path: prev.route_path } }]);
      } else if (action.op === "set_route" && def) {
        // No live record to update — create one with the correct route
        const created = await base44.entities.Feature.create({
          feature_id: def.id, name: def.name, description: def.description, category: def.category,
          icon: def.icon, minimum_plan: def.minimumPlan, is_enabled: def.isEnabled, sort_order: def.sortOrder,
          limit_label: def.limitLabel || "", status: "live", visibility: "public", coming_soon: false,
          nav_enabled: false, pricing_enabled: true,
        });
        setFeatures((prev) => [...prev, created]);
        setUndoLog((prev) => [...prev, { type: "create", recordId: created.id }]);
      }
      setDoneActionIds((prev) => [...prev, actionKey]);
      await runEngine(features);
    } catch (e) {
      console.error(e);
    }
    setRunningActionId(null);
  };

  const fixSelected = async () => {
    const targets = report.findings.filter((f) => selectedIds.includes(f.id));
    const entityActions = targets.flatMap((f) => f.actions.filter((a) => a.type === "entity").map((a) => ({ finding: f, action: a })));
    if (entityActions.length === 0) { setPreview({ title: "No auto-fixable actions", code: "// Selected findings only have code-level fixes. Apply them manually in src/App.jsx or src/lib/roles.js." }); return; }
    setApplying(true);
    for (const { finding, action } of entityActions) {
      await executeEntityAction(finding, action);
    }
    setApplying(false);
    setSelectedIds([]);
  };

  const fixAll = async () => {
    const entityActions = report.findings
      .filter((f) => f.severity !== "information")
      .flatMap((f) => f.actions.filter((a) => a.type === "entity" && !doneActionIds.includes(`${f.id}:${a.id}`)).map((a) => ({ finding: f, action: a })));
    if (entityActions.length === 0) { setPreview({ title: "No auto-fixable actions", code: "// All remaining issues require code-level changes. Review the code-preview actions on each finding." }); return; }
    setApplying(true);
    for (const { finding, action } of entityActions) {
      await executeEntityAction(finding, action);
    }
    setApplying(false);
  };

  const rollback = async () => {
    setApplying(true);
    const log = [...undoLog].reverse();
    for (const entry of log) {
      try {
        if (entry.type === "create") {
          await base44.entities.Feature.delete(entry.recordId);
        } else if (entry.type === "delete" && entry.record) {
          await base44.entities.Feature.create(entry.record);
        } else if (entry.type === "update") {
          await base44.entities.Feature.update(entry.recordId, entry.prev);
        }
      } catch (e) { console.error(e); }
    }
    setUndoLog([]);
    setDoneActionIds([]);
    await loadFeatures();
    setApplying(false);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  /* ----------------------------- render ----------------------------- */

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  if (user?.role !== "admin") return <div className="text-center text-white/40 py-20">Access denied. Admin role required.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Activity size={12} className="text-emerald-400" /> Configuration Control Center
          </div>
          <h1 className="text-2xl font-bold text-white">Feature Management</h1>
          <p className="text-white/40 text-sm mt-1">Validate, synchronize, and repair configuration across routes, navigation, permissions, and features.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadFeatures} disabled={applying} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white/60 transition-colors disabled:opacity-40">
            <RefreshCw size={14} className={applying ? "animate-spin" : ""} /> Re-run Scan
          </button>
          {features.length > 0 && (
            <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-sm text-white transition-colors">
              <Plus size={14} /> Add Feature
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-white/5 overflow-x-auto">
        {TABS.map((t) => {
          const badge = t.id === "findings" && report ? report.counts.critical + report.counts.warning : null;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? "border-indigo-500 text-white" : "border-transparent text-white/40 hover:text-white/70"}`}>
              <t.icon size={14} /> {t.label}
              {badge > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300">{badge}</span>}
            </button>
          );
        })}
      </div>

      {report && tab === "overview" && (
        <div className="space-y-6">
          <HealthScoreDashboard health={report.health} counts={report.counts} />
          <DeploymentGate report={report} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Routes", value: report.routeCount, icon: RouteIcon, color: "#06b6d4" },
              { label: "Nav Items", value: report.navCount, icon: AlertTriangle, color: "#6366f1" },
              { label: "Features", value: report.featureCount, icon: Boxes, color: "#f59e0b" },
              { label: "Findings", value: report.findings.length, icon: Activity, color: "#a855f7" },
            ].map((s, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <s.icon size={16} style={{ color: s.color }} />
                <div className="text-2xl font-bold text-white mt-2">{s.value}</div>
                <div className="text-xs text-white/40">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {report && tab === "findings" && (
        <FindingsPanel
          report={report}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onRunAction={executeEntityAction}
          onPreviewAction={(finding, action) => setPreview({ title: `${finding.title} → ${action.label}`, code: action.preview })}
          onFixSelected={fixSelected}
          onFixAll={fixAll}
          onRollback={rollback}
          runningActionId={runningActionId}
          doneActionIds={doneActionIds}
          applying={applying}
          canRollback={undoLog.length > 0}
        />
      )}

      {tab === "registry" && <RouteRegistryTable />}

      {tab === "features" && (
        <>
          {features.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
              <Boxes className="mx-auto text-white/20 mb-3" size={32} />
              <p className="text-white/40 mb-2">No features in the database yet.</p>
              <p className="text-white/30 text-sm mb-6">Initialize the catalog with {DEFAULT_FEATURES.length} default features, then edit as needed.</p>
              <button onClick={initializeCatalog} disabled={saving === "init"} className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white font-medium px-6 py-2.5 rounded-lg transition-colors">
                {saving === "init" ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Initialize Feature Catalog
              </button>
            </div>
          ) : (
            <>
              {showNew && (
                <FeatureEditor
                  feature={{ feature_id: "", name: "", description: "", category: "Platform", module: "", icon: "Sparkles", minimum_plan: "free", required_role: "", status: "live", visibility: "public", coming_soon: false, nav_enabled: false, pricing_enabled: true, route_path: "", nav_label: "", expected_release: "", is_enabled: true, sort_order: 99 }}
                  onSave={saveFeature}
                  onDelete={null}
                  saving={saving === ""}
                />
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {features.map((feature) => (
                  <FeatureEditor key={feature.id} feature={feature} onSave={saveFeature} onDelete={deleteFeature} saving={saving === feature.feature_id} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {preview && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-indigo-400" />
                <span className="text-sm font-semibold text-white">{preview.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { navigator.clipboard.writeText(preview.code); }} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs transition-colors">
                  <Copy size={12} /> Copy
                </button>
                <button onClick={() => setPreview(null)} className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 transition-colors">
                  <X size={15} />
                </button>
              </div>
            </div>
            <div className="overflow-auto p-5">
              <pre className="text-xs text-white/70 font-mono whitespace-pre-wrap leading-relaxed">{preview.code}</pre>
            </div>
            <div className="px-5 py-3 border-t border-white/10 text-xs text-white/40 flex items-center gap-2">
              <Check size={12} className="text-emerald-400" /> Code-level change — apply manually, then re-run the scan.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}