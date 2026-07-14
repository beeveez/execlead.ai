import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { computeFlagSummary, computeAnalytics } from "@/lib/featureFlagEngine";
import { StatCard, Spinner } from "@/components/feature-flags/Shared";
import FlagRegistry from "@/components/feature-flags/FlagRegistry";
import FlagDetailDrawer from "@/components/feature-flags/FlagDetailDrawer";
import FlagForm from "@/components/feature-flags/FlagForm";
import AuditTrail from "@/components/feature-flags/AuditTrail";
import FlagAnalytics from "@/components/feature-flags/FlagAnalytics";
import { Flag as FlagIcon, History, BarChart3, Zap } from "lucide-react";

const TABS = [
  { id: "registry", label: "Registry", icon: FlagIcon },
  { id: "audit", label: "Audit Trail", icon: History },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function FeatureFlagCenter() {
  const [activeTab, setActiveTab] = useState("registry");
  const [flags, setFlags] = useState([]);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFlag, setEditingFlag] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [flagData, auditData, userData] = await Promise.all([
        base44.entities.FeatureFlag.list("-created_date", 100),
        base44.entities.FeatureFlagAudit.list("-created_date", 50),
        base44.auth.me().catch(() => null),
      ]);
      setFlags(flagData || []);
      setAudits(auditData || []);
      setUser(userData);
    } catch {
      setFlags([]);
      setAudits([]);
    } finally {
      setLoading(false);
    }
  }

  const summary = computeFlagSummary(flags);

  function handleFlagUpdated(updatedFlag) {
    setFlags((prev) => prev.map((f) => (f.id === updatedFlag.id ? updatedFlag : f)));
    setSelectedFlag(updatedFlag);
    base44.entities.FeatureFlagAudit.list("-created_date", 50).then(setAudits);
  }

  function handleFlagSaved() {
    setShowForm(false);
    setEditingFlag(null);
    loadData();
  }

  async function handleRollback(audit) {
    if (!confirm(`Rollback this change?\n\n${audit.flag_name}: ${audit.action}`)) return;
    const flag = flags.find((f) => f.flag_key === audit.flag_key);
    if (!flag) return;
    const changes = {};
    if (audit.previous_state) changes.status = audit.previous_state;
    if (audit.previous_percentage != null) changes.rollout_percentage = audit.previous_percentage;
    const updated = await base44.entities.FeatureFlag.update(flag.id, changes);
    await base44.entities.FeatureFlagAudit.create({
      flag_key: flag.flag_key,
      flag_name: flag.name,
      action: "status_changed",
      previous_state: flag.status,
      new_state: audit.previous_state || flag.status,
      reason: `Rollback of ${audit.action}`,
      changed_by_id: user?.id || "",
      changed_by_name: user?.full_name || "System",
      rollback_available: false,
    });
    handleFlagUpdated(updated);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <FlagIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Feature Flag Center™</h1>
              <p className="text-xs text-white/40">Safely enable, disable, target, and roll back any capability without code deployment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {loading ? (
            <Spinner label="Loading feature flags..." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <StatCard label="Total Flags" value={summary.total} color="indigo" />
              <StatCard label="Active" value={summary.active} sublabel="Enabled + Beta + Internal" color="emerald" />
              <StatCard label="Disabled" value={summary.disabled} color="red" />
              <StatCard label="Beta" value={summary.beta} color="amber" />
              <StatCard label="Kill Switched" value={summary.killed} color="orange" />
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
                    activeTab === tab.id ? "border-indigo-500 text-indigo-400" : "border-transparent text-white/40 hover:text-white/70"
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
        {activeTab === "registry" && (
          <FlagRegistry
            flags={flags}
            loading={loading}
            onSelectFlag={setSelectedFlag}
            onAddFlag={() => { setEditingFlag(null); setShowForm(true); }}
            onEditFlag={(flag) => { setEditingFlag(flag); setShowForm(true); }}
          />
        )}
        {activeTab === "audit" && <AuditTrail audits={audits} loading={loading} onRollback={handleRollback} />}
        {activeTab === "analytics" && <FlagAnalytics flags={flags} />}
      </div>

      {/* Drawer */}
      {selectedFlag && (
        <FlagDetailDrawer
          flag={selectedFlag}
          user={user}
          onClose={() => setSelectedFlag(null)}
          onUpdated={handleFlagUpdated}
        />
      )}

      {/* Form */}
      {showForm && (
        <FlagForm flag={editingFlag} onClose={() => { setShowForm(false); setEditingFlag(null); }} onSaved={handleFlagSaved} />
      )}
    </div>
  );
}