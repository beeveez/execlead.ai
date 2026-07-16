import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Save, Loader2, Check } from "lucide-react";

export default function DeletionPolicyConfigPanel() {
  const [policies, setPolicies] = useState(null);
  const [defaults, setDefaults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke("accountDeletion", { action: "admin_get_policies" });
        setPolicies(res.data.policies);
        setDefaults(res.data.defaults);
      } catch (e) {
        setError(e.response?.data?.error || "Failed to load policies.");
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await base44.functions.invoke("accountDeletion", {
        action: "admin_update_policies",
        free_days: Number(policies.free_days),
        professional_days: Number(policies.professional_days),
        executive_days: Number(policies.executive_days),
        enterprise_default_days: Number(policies.enterprise_default_days),
        enterprise_min_days: Number(policies.enterprise_min_days),
        enterprise_max_days: Number(policies.enterprise_max_days),
      });
      setPolicies(res.data.policies);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to save policies.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={20} className="animate-spin text-white/40" />
      </div>
    );
  }

  const fields = [
    { key: "free_days", label: "Free Plan", desc: "Grace period (days)" },
    { key: "professional_days", label: "Professional Plan", desc: "Grace period (days)" },
    { key: "executive_days", label: "Executive Plan", desc: "Grace period (days)" },
    { key: "enterprise_default_days", label: "Enterprise Default", desc: "Default if org has no custom config" },
    { key: "enterprise_min_days", label: "Enterprise Min", desc: "Minimum an org can set" },
    { key: "enterprise_max_days", label: "Enterprise Max", desc: "Maximum an org can set" },
  ];

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <div className="bg-white/[0.02] px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-indigo-400" />
          <h3 className="text-white font-medium text-sm">Deletion Grace Period Policies</h3>
        </div>
        <p className="text-white/40 text-xs mt-1">Configure default grace periods (in days) by subscription plan. Enterprise orgs can set their own within the min/max bounds.</p>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="text-white/60 text-xs font-medium block mb-1">{f.label}</label>
              <p className="text-white/30 text-[10px] mb-1.5">{f.desc}</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={policies[f.key] ?? 0}
                  onChange={e => setPolicies({ ...policies, [f.key]: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                />
                <span className="text-white/30 text-xs whitespace-nowrap">days</span>
              </div>
              {defaults && (
                <p className="text-white/20 text-[10px] mt-0.5">Default: {defaults[f.key]}</p>
              )}
            </div>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? "Saved" : "Save Policies"}
          </button>
        </div>
      </div>
    </div>
  );
}