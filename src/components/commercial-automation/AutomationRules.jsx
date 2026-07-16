import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ChevronDown, ChevronRight, Settings2, Zap, History, Clock } from "lucide-react";

const TRIGGER_LABELS = {
  new_executive_signup: "New Executive Signup",
  enterprise_inquiry: "Enterprise Inquiry",
  trial_expiring_3d: "Trial Expiring (3 days)",
  high_promotion_readiness: "High Promotion Readiness (90%+)",
  inactive_14d: "Inactive User (14 days)",
  dormant_executive: "Dormant Executive (21 days)",
  founding_member_purchased: "Founding Member Purchased",
  churn_risk: "Churn Risk",
  revenue_milestone: "Revenue Milestone",
  custom: "Custom",
};

const PRIORITY_STYLE = {
  critical: "text-red-400 bg-red-500/10 border-red-500/20",
  high: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  medium: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  low: "text-white/40 bg-white/5 border-white/10",
};

export default function AutomationRules() {
  const { toast } = useToast();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.AutomationRule.list("-created_date", 50);
      setRules(data);
    } catch (e) {
      console.error("Rules load error:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleRule = async (ruleId, currentEnabled) => {
    try {
      await base44.entities.AutomationRule.update(ruleId, { enabled: !currentEnabled });
      setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, enabled: !currentEnabled } : r)));
    } catch (e) {
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Automation Rules™</h2>
          <p className="text-xs text-white/40 mt-0.5">{rules.length} rule(s) • {rules.filter((r) => r.enabled).length} active</p>
        </div>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-white/[0.02] border border-white/5">
          <Settings2 className="w-8 h-8 text-white/20 mx-auto mb-2" />
          <p className="text-sm text-white/40">No automation rules yet. Click "Evaluate Rules" in the Task Queue to seed defaults.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => {
            const isOpen = expanded === rule.id;
            const history = (() => { try { return JSON.parse(rule.execution_history_json || "[]"); } catch { return []; } })();
            const actions = (() => { try { return JSON.parse(rule.actions_json || "[]"); } catch { return []; } })();
            return (
              <div key={rule.id} className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
                <div className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(isOpen ? null : rule.id)}>
                    {isOpen ? <ChevronDown size={14} className="text-white/40" /> : <ChevronRight size={14} className="text-white/40" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-white font-medium truncate">{rule.name}</span>
                        {rule.is_system && <span className="px-1 py-0.5 rounded text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">SYSTEM</span>}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${PRIORITY_STYLE[rule.priority] || PRIORITY_STYLE.medium}`}>{rule.priority}</span>
                      </div>
                      <p className="text-xs text-white/40 mt-0.5 truncate">{rule.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-white/60 font-semibold">{rule.execution_count || 0}</p>
                      <p className="text-[10px] text-white/30">executions</p>
                    </div>
                    <button onClick={() => toggleRule(rule.id, rule.enabled)} className={`relative w-10 h-5 rounded-full transition-colors ${rule.enabled ? "bg-emerald-500" : "bg-white/10"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${rule.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-white/5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
                      <Meta label="Trigger" value={TRIGGER_LABELS[rule.trigger] || rule.trigger} />
                      <Meta label="Cooldown" value={`${rule.cooldown_hours}h`} icon={Clock} />
                      <Meta label="Last Fired" value={rule.last_fired_date ? new Date(rule.last_fired_date).toLocaleDateString() : "Never"} />
                      <Meta label="Last Status" value={rule.last_execution_status || "—"} />
                    </div>

                    {actions.length > 0 && (
                      <div>
                        <p className="text-xs text-white/40 mb-1.5">Actions</p>
                        <div className="flex flex-wrap gap-1.5">
                          {actions.map((a, i) => <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{a}</span>)}
                        </div>
                      </div>
                    )}

                    {rule.last_execution_summary && (
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                        <p className="text-xs text-white/50"><span className="text-white/30">Last run:</span> {rule.last_execution_summary}</p>
                      </div>
                    )}

                    {history.length > 0 && (
                      <div>
                        <p className="text-xs text-white/40 mb-1.5 flex items-center gap-1"><History size={11} /> Execution History</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {history.slice(0, 10).map((h, i) => (
                            <div key={i} className="flex items-center justify-between text-[10px] text-white/40 px-2 py-1 rounded bg-white/[0.01]">
                              <span>{new Date(h.date).toLocaleString()}</span>
                              <span>{h.tasksCreated} created, {h.skipped} skipped</span>
                              <span className={h.status === "success" ? "text-emerald-400" : "text-white/30"}>{h.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Meta({ label, value, icon: Icon }) {
  return (
    <div>
      <p className="text-[10px] text-white/30 uppercase tracking-wide flex items-center gap-1">{Icon && <Icon size={9} />}{label}</p>
      <p className="text-xs text-white/70 font-medium mt-0.5">{value}</p>
    </div>
  );
}