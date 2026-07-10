import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { useDeveloper } from "@/lib/DeveloperContext";
import { usePricingCatalog } from "@/hooks/usePricingCatalog";
import { getUserEntitlements } from "@/lib/entitlementService";
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw } from "lucide-react";

export default function SubscriptionDiagnostics() {
  const { user } = useAuth();
  const { profile, subscription, entitlements, loading } = useSubscription();
  const { activeWorkspace, plan: workspacePlan } = useWorkspace();
  const { simulation, getEffectivePlan } = useDeveloper();
  const { getPlanById } = usePricingCatalog();
  const [stripeStatus, setStripeStatus] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [configVersion, setConfigVersion] = useState(null);

  const loadDiagnostics = async () => {
    setRefreshing(true);
    try {
      const settings = await base44.entities.PaymentSettings.filter({}, "-created_date", 1).catch(() => []);
      const ps = settings[0];
      setStripeStatus(ps ? { provider: ps.provider, status: ps.status, connected: ps.status === "connected" } : null);

      if (profile?.id) {
        const invoices = await base44.entities.Invoice.filter({ owner_user_id: user.id }, "-created_date", 1).catch(() => []);
        setLastSync(invoices[0]?.created_date || profile?.updated_date || null);
      }

      const configRes = await base44.functions.invoke("manageConfig", {}).catch(() => ({ data: {} }));
      setConfigVersion(configRes.data?.configVersion || null);
    } catch (e) {}
    setRefreshing(false);
  };

  useEffect(() => {
    if (user?.id) loadDiagnostics();
  }, [user?.id, profile?.id]);

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="text-white/30 text-sm">Loading subscription diagnostics…</div>
      </div>
    );
  }

  const billingPlanId = subscription?.planTier || "free";
  const billingPlan = getPlanById(billingPlanId);
  const navPlanName = subscription?.planName || "—";
  const rawDbPlan = profile?.subscription_plan || "free";
  const effectivePlan = getEffectivePlan(rawDbPlan);
  const workspacePlanId = workspacePlan || "—";
  const entitlementPlan = entitlements?.planTier || billingPlanId;

  // Consistency check — all sources must agree
  const checks = [
    { label: "Nav Plan === Subscription Plan", pass: navPlanName === (billingPlan?.name || subscription?.planName) },
    { label: "Subscription Plan === Workspace Plan", pass: billingPlanId === workspacePlanId || (billingPlanId === "developer_unlimited" && workspacePlanId === "developer") },
    { label: "Subscription Plan === Entitlements Plan", pass: billingPlanId === entitlementPlan },
    { label: "Raw DB Plan → Effective Plan matches Subscription", pass: effectivePlan === billingPlanId },
  ];
  const allConsistent = checks.every(c => c.pass);

  const Row = ({ label, value, mono }) => (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-white/40 text-xs">{label}</span>
      <span className={`text-white/80 text-xs font-medium ${mono ? "font-mono" : ""}`}>{value || "—"}</span>
    </div>
  );

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold text-sm">Subscription Diagnostics</h3>
          {allConsistent ? (
            <span className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle2 size={12} /> Consistent</span>
          ) : (
            <span className="flex items-center gap-1 text-red-400 text-xs"><AlertTriangle size={12} /> Inconsistency Detected</span>
          )}
        </div>
        <button onClick={loadDiagnostics} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" disabled={refreshing}>
          <RefreshCw size={14} className={`text-white/40 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Consistency Checks */}
      <div className="mb-4 space-y-1">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {c.pass ? <CheckCircle2 size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-red-400" />}
            <span className={c.pass ? "text-white/50" : "text-red-400"}>{c.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <div>
          <div className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Identity</div>
          <Row label="Authenticated User" value={user?.full_name || user?.email || user?.id} />
          <Row label="User ID" value={user?.id} mono />
          <Row label="Profile Owner ID" value={profile?.created_by_id} mono />
          <Row label="Profile Match" value={profile?.created_by_id === user?.id ? "✓ Match" : "✗ MISMATCH"} />
        </div>
        <div>
          <div className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Subscription</div>
          <Row label="Plan Name (Nav)" value={navPlanName} />
          <Row label="Plan Tier (Subscription)" value={billingPlanId} mono />
          <Row label="Raw DB Plan" value={rawDbPlan} mono />
          <Row label="Effective Plan (Dev)" value={effectivePlan} mono />
          <Row label="Status" value={subscription?.status} />
          <Row label="Billing Cycle" value={subscription?.billingCycle} />
          <Row label="Renewal Date" value={subscription?.renewalDate ? new Date(subscription.renewalDate).toLocaleDateString() : null} />
          <Row label="Is Simulated" value={subscription?.isSimulated ? "Yes" : "No"} />
        </div>
        <div>
          <div className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Workspace & Entitlements</div>
          <Row label="Active Workspace" value={activeWorkspace} />
          <Row label="Workspace Plan" value={workspacePlanId} mono />
          <Row label="Entitlements Plan" value={entitlementPlan} mono />
          <Row label="Founder Portal Enabled" value={entitlements?.founderPortalEnabled ? "Yes" : "No"} />
          <Row label="Purchase Verified" value={entitlements?.purchaseVerified ? "Yes" : "No"} />
        </div>
        <div>
          <div className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Stripe & Sync</div>
          <Row label="Provider" value={stripeStatus?.provider} />
          <Row label="Stripe Status" value={stripeStatus?.status} />
          <Row label="Connected" value={stripeStatus?.connected ? "Yes" : "No"} />
          <Row label="Last Sync" value={lastSync ? new Date(lastSync).toLocaleString() : null} />
          <Row label="Source" value={subscription?.isSimulated ? "Developer Simulation" : "Database"} />
          <Row label="Config Version" value={configVersion} mono />
        </div>
      </div>

      {!allConsistent && (
        <div className="mt-4 bg-red-500/5 border border-red-500/15 rounded-lg p-3">
          <p className="text-red-400 text-xs font-medium mb-1">⚠ Inconsistency Detected</p>
          <p className="text-white/40 text-xs">
            Navigation, Billing, Workspace, and Entitlements plans do not all match. This indicates a subscription source-of-truth issue.
            {!subscription?.isSimulated && " Check that profile.subscription_plan matches the active Stripe subscription."}
          </p>
        </div>
      )}
    </div>
  );
}