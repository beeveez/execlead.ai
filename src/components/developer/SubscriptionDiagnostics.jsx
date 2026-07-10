import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { useDeveloper } from "@/lib/DeveloperContext";
import { usePricingCatalog } from "@/hooks/usePricingCatalog";
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, Shield } from "lucide-react";

export default function SubscriptionDiagnostics() {
  const { user } = useAuth();
  const { profile, subscription, canonicalSubscription, entitlements, loading } = useSubscription();
  const { activeWorkspace, plan: workspacePlan } = useWorkspace();
  const { simulation, getEffectivePlan } = useDeveloper();
  const { getPlanById } = usePricingCatalog();
  const [refreshing, setRefreshing] = useState(false);
  const [stripeStatus, setStripeStatus] = useState(null);

  const loadStripeStatus = async () => {
    setRefreshing(true);
    try {
      const settings = await base44.entities.PaymentSettings.filter({}, "-created_date", 1).catch(() => []);
      const ps = settings[0];
      setStripeStatus(ps ? { provider: ps.provider, status: ps.status, connected: ps.status === "connected" } : null);
    } catch (e) {}
    setRefreshing(false);
  };

  useEffect(() => {
    if (user?.id) loadStripeStatus();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="text-white/30 text-sm">Loading subscription diagnostics…</div>
      </div>
    );
  }

  const sub = subscription || {};
  const billingPlan = getPlanById(sub.planTier);
  const rawDbPlan = profile?.subscription_plan || "free";
  const effectivePlan = getEffectivePlan(rawDbPlan);
  const consistency = sub.consistency;
  const allConsistent = consistency?.allMatch ?? true;

  // Cross-source consistency checks
  const checks = [
    { label: "Nav Plan === Subscription Plan", pass: sub.planName === (billingPlan?.name || sub.planName) },
    { label: "Subscription Plan === Workspace Plan", pass: sub.planTier === workspacePlan || (sub.planTier === "developer_unlimited" && workspacePlan === "developer") },
    { label: "Raw DB Plan → Effective Plan matches Subscription", pass: effectivePlan === sub.planTier },
    ...(consistency?.checks || []),
  ];
  const allMatch = allConsistent && checks.every(c => c.pass);

  const Row = ({ label, value, mono }) => (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-white/40 text-xs">{label}</span>
      <span className={`text-white/80 text-xs font-medium ${mono ? "font-mono" : ""}`}>{value || "—"}</span>
    </div>
  );

  const fm = sub.foundingMember || {};

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-indigo-400" />
          <h3 className="text-white font-semibold text-sm">Subscription Diagnostics</h3>
          {allMatch ? (
            <span className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle2 size={12} /> All Systems Match</span>
          ) : (
            <span className="flex items-center gap-1 text-red-400 text-xs"><AlertTriangle size={12} /> Subscription Mismatch</span>
          )}
        </div>
        <button onClick={loadStripeStatus} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" disabled={refreshing}>
          <RefreshCw size={14} className={`text-white/40 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Source Badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${sub.source === "backend" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
          {sub.source === "backend" ? "Backend Resolved" : "Frontend Fallback"}
        </span>
        {sub.isSimulated && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/10 text-purple-400 ml-1">
            Developer Simulation Active
          </span>
        )}
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
        {/* Identity */}
        <div>
          <div className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Identity</div>
          <Row label="Authenticated User" value={user?.full_name || user?.email || user?.id} />
          <Row label="User ID" value={sub.userId || user?.id} mono />
          <Row label="Profile Owner ID" value={profile?.created_by_id} mono />
          <Row label="Profile Match" value={profile?.created_by_id === user?.id ? "✓ Match" : "✗ MISMATCH"} />
        </div>

        {/* Subscription */}
        <div>
          <div className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Subscription</div>
          <Row label="Current Plan" value={sub.planName} />
          <Row label="Plan Tier" value={sub.planTier} mono />
          <Row label="Raw DB Plan" value={rawDbPlan} mono />
          <Row label="Status" value={sub.status} />
          <Row label="Billing Cycle" value={sub.billingCycle} />
          <Row label="Workspace" value={sub.workspace || activeWorkspace} />
          <Row label="Renewal Date" value={sub.renewalDate ? new Date(sub.renewalDate).toLocaleDateString() : null} />
          <Row label="Trial Ends" value={sub.trialEndsAt ? new Date(sub.trialEndsAt).toLocaleDateString() : null} />
          <Row label="Cancel at Period End" value={sub.cancelAtPeriodEnd ? "Yes" : "No"} />
        </div>

        {/* Stripe & Payment */}
        <div>
          <div className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Stripe & Payment</div>
          <Row label="Payment Provider" value={sub.paymentProvider} />
          <Row label="Stripe Customer ID" value={sub.stripeCustomerId} mono />
          <Row label="Stripe Subscription ID" value={sub.stripeSubscriptionId} mono />
          <Row label="Payment Settings Status" value={stripeStatus?.status} />
          <Row label="Payment Connected" value={stripeStatus?.connected ? "Yes" : "No"} />
          <Row label="Next Invoice Amount" value={sub.nextInvoice ? `${sub.nextInvoice.currency} ${sub.nextInvoice.amount}` : null} />
          <Row label="Next Invoice Period End" value={sub.nextInvoice?.periodEnd ? new Date(sub.nextInvoice.periodEnd).toLocaleDateString() : null} />
        </div>

        {/* Founder Status */}
        <div>
          <div className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Founder Status</div>
          <Row label="Is Founding Member" value={fm.isFoundingMember ? "Yes" : "No"} />
          <Row label="Founder Portal Enabled" value={fm.founderPortalEnabled ? "Yes" : "No"} />
          <Row label="Purchase Verified" value={fm.purchaseVerified ? "Yes" : "No"} />
          <Row label="Founder Number" value={fm.founderNumber} mono />
          <Row label="Founder Tier" value={fm.founderTier} />
          <Row label="Founder Since" value={fm.founderSince ? new Date(fm.founderSince).toLocaleDateString() : null} />
          <Row label="Lifetime Discount" value={`${fm.lifetimeDiscount || 0}%`} />
          <Row label="Price Protection" value={fm.priceProtection ? "Yes" : "No"} />
        </div>

        {/* Enterprise Seat */}
        <div>
          <div className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Enterprise Seat</div>
          <Row label="Organization ID" value={sub.enterpriseOrganizationId} mono />
          <Row label="Organization Name" value={sub.enterpriseOrganizationName} />
          <Row label="Seat ID" value={sub.enterpriseSeatId} mono />
          <Row label="Seat Role" value={sub.seatRole} />
        </div>

        {/* Sync & Config */}
        <div>
          <div className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Sync & Config</div>
          <Row label="Source" value={sub.source} />
          <Row label="Last Synced" value={sub.lastSynced ? new Date(sub.lastSynced).toLocaleString() : null} />
          <Row label="Config Version" value={sub.configVersion} mono />
          <Row label="Feature Entitlements Count" value={sub.featureEntitlements?.length || 0} />
          <Row label="Entitlement Source" value={entitlements?.entitlementSource} />
          <Row label="Is Simulated" value={sub.isSimulated ? "Yes" : "No"} />
        </div>
      </div>

      {!allMatch && (
        <div className="mt-4 bg-red-500/5 border border-red-500/15 rounded-lg p-3">
          <p className="text-red-400 text-xs font-medium mb-1">⚠ Subscription Mismatch Detected</p>
          <p className="text-white/40 text-xs">
            Navigation, Billing, Workspace, Entitlements, and Stripe data do not all match. This indicates a subscription source-of-truth issue.
            {sub.source === "frontend_fallback" && " Backend resolveSubscription is unavailable — using frontend fallback. Check function deployment."}
          </p>
        </div>
      )}
    </div>
  );
}