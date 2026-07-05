import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DEFAULT_FEATURES } from "@/lib/featureCatalog";
import { Loader2, Plus, RefreshCw, Boxes, Sparkles } from "lucide-react";
import FeatureEditor from "@/components/admin/FeatureEditor";

export default function FeatureManagement() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [user, setUser] = useState(null);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    setLoading(true);
    try {
      const records = await base44.entities.Feature.list("sort_order", 100);
      setFeatures(records);
    } catch (e) {}
    setLoading(false);
  };

  const initializeCatalog = async () => {
    setSaving("init");
    try {
      await base44.entities.Feature.bulkCreate(
        DEFAULT_FEATURES.map(f => ({
          feature_id: f.id,
          name: f.name,
          description: f.description,
          category: f.category,
          icon: f.icon,
          minimum_plan: f.minimumPlan,
          is_enabled: f.isEnabled,
          sort_order: f.sortOrder,
          limit_label: f.limitLabel || ""
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
          name: form.name,
          description: form.description,
          category: form.category,
          icon: form.icon,
          minimum_plan: form.minimum_plan,
          is_enabled: form.is_enabled,
          sort_order: Number(form.sort_order),
          limit_label: form.limit_label || ""
        });
        setFeatures(prev => prev.map(f => f.id === form.id ? { ...f, ...form } : f));
      } else {
        const created = await base44.entities.Feature.create({
          feature_id: form.feature_id,
          name: form.name,
          description: form.description || "",
          category: form.category || "Platform",
          icon: form.icon || "Sparkles",
          minimum_plan: form.minimum_plan || "free",
          is_enabled: form.is_enabled !== false,
          sort_order: Number(form.sort_order) || 0,
          limit_label: form.limit_label || ""
        });
        setFeatures(prev => [...prev, created]);
        setShowNew(false);
      }
    } catch (e) { console.error(e); }
    setSaving(null);
  };

  const deleteFeature = async (form) => {
    if (!form.id) return;
    if (!confirm(`Delete "${form.name}"?`)) return;
    try {
      await base44.entities.Feature.delete(form.id);
      setFeatures(prev => prev.filter(f => f.id !== form.id));
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  if (user?.role !== "admin") return <div className="text-center text-white/40 py-20">Access denied. Admin role required.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Boxes size={12} className="text-emerald-400" /> Configuration
          </div>
          <h1 className="text-2xl font-bold text-white">Feature Management</h1>
          <p className="text-white/40 text-sm mt-1">Manage feature catalog, plan assignments, and visibility.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadFeatures} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white/60 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
          {features.length > 0 && (
            <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-sm text-white transition-colors">
              <Plus size={14} /> Add Feature
            </button>
          )}
        </div>
      </div>

      {features.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Sparkles className="mx-auto text-white/20 mb-3" size={32} />
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
              feature={{ feature_id: "", name: "", description: "", category: "Platform", icon: "Sparkles", minimum_plan: "free", is_enabled: true, sort_order: 99 }}
              onSave={saveFeature}
              onDelete={null}
              saving={saving === ""}
            />
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {features.map(feature => (
              <FeatureEditor key={feature.id} feature={feature} onSave={saveFeature} onDelete={deleteFeature} saving={saving === feature.feature_id} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}