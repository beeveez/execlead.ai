import React, { useState } from "react";
import { User, Mail, Building2, CreditCard, Activity, Award, Shield, Lock, BarChart3, Clock, X, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { ScoreRing, StatusBadge, SectionCard, EmptyState, STAGE_COLORS } from "./Shared";
import { LIFECYCLE_STAGES } from "@/lib/customerLifecycleEngine";

function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-white/30 text-xs">{label}</span>
      <span className="text-white/80 text-sm">{value || "—"}</span>
    </div>
  );
}

export default function Customer360({ customer, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  if (!customer) return <EmptyState message="Select a customer to view their 360 profile" />;

  const c = customer;
  const stageInfo = LIFECYCLE_STAGES.find((s) => s.id === c.lifecycleStage);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center text-white font-bold">
            {(c.fullName || c.email || "?")[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{c.fullName || c.email}</h2>
            <p className="text-white/40 text-xs">{c.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={c.lifecycleStage} color={stageInfo?.id} />
              <StatusBadge status={c.health.riskLevel} color={c.health.riskLevel} />
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b border-white/5 overflow-x-auto">
        {["overview", "engagement", "privacy", "security", "timeline"].map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap capitalize ${activeTab === t ? "border-indigo-400 text-indigo-400" : "border-transparent text-white/40 hover:text-white/60"}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid md:grid-cols-3 gap-4">
          <SectionCard title="Health Score" icon={Activity}>
            <div className="flex items-center justify-center py-2">
              <ScoreRing score={c.health.total} label="Health" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Field label="Engagement" value={`${c.health.engagement}/40`} />
              <Field label="Learning" value={`${c.health.learning}/25`} />
              <Field label="Leadership" value={`${c.health.leadership}/20`} />
              <Field label="AI Usage" value={`${c.health.aiUsage}/15`} />
            </div>
          </SectionCard>

          <SectionCard title="Profile" icon={User}>
            <div className="space-y-3">
              <Field label="Full Name" value={c.fullName} />
              <Field label="Email" value={c.email} />
              <Field label="User ID" value={c.userId ? c.userId.slice(0, 12) + "…" : null} />
              <Field label="Leadership Level" value={c.application?.leadership_level?.replace(/_/g, " ")} />
              <Field label="Country" value={c.application?.country} />
              <Field label="Company" value={c.application?.company} />
            </div>
          </SectionCard>

          <SectionCard title="Subscription & Beta" icon={CreditCard}>
            <div className="space-y-3">
              <Field label="Beta Tier" value={c.betaTier?.replace(/_/g, " ")} />
              <Field label="Beta Status" value={c.betaStatus} />
              <Field label="Active Beta User" value={c.isActiveBetaUser ? "Yes" : "No"} />
              <Field label="Plan" value={c.subscription?.plan} />
              <Field label="Sub Status" value={c.subscription?.status} />
              <Field label="Billing Cycle" value={c.subscription?.billing_cycle} />
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === "engagement" && (
        <div className="grid md:grid-cols-2 gap-4">
          <SectionCard title="Engagement Metrics" icon={BarChart3}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Telemetry Events" value={c.telemetryCount} />
              <Field label="Sessions" value={c.sessionCount} />
              <Field label="AI Usage Logs" value={c.usageCount} />
              <Field label="Simulations" value={c.simulations?.length} />
              <Field label="Lessons" value={c.lessonProgress?.length} />
              <Field label="Certificates" value={c.certificateCount} />
              <Field label="Referrals" value={c.referralCount} />
              <Field label="Feedback" value={c.feedback?.length} />
            </div>
          </SectionCard>
          <SectionCard title="Leadership & Reputation" icon={Award}>
            <div className="space-y-3">
              <Field label="Reputation Score" value={c.reputation?.reputation_score} />
              <Field label="Reputation Tier" value={c.reputation?.reputation_tier?.replace(/_/g, " ")} />
              <Field label="Total Letters" value={c.reputation?.total_letters} />
              <Field label="Featured" value={c.reputation?.featured_contributions} />
              <Field label="NPS Score" value={c.npsScore} />
              <Field label="Product Value" value={c.productInsights?.find((pi) => pi.product_value_rating)?.product_value_rating} />
            </div>
            <Link to="/reputation" className="inline-flex items-center gap-1 text-indigo-400 text-xs mt-3 hover:underline">
              View Reputation <ExternalLink size={12} />
            </Link>
          </SectionCard>
        </div>
      )}

      {activeTab === "privacy" && (
        <SectionCard title="Privacy & Consent" icon={Lock}>
          <div className="space-y-3">
            <Field label="Consent Records" value={c.consentRecords?.length} />
            {c.consentRecords?.map((cr, i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 rounded px-3 py-2">
                <span className="text-white/60 text-xs capitalize">{cr.consent_type?.replace(/_/g, " ")}</span>
                <StatusBadge status={cr.granted ? "granted" : "withdrawn"} color={cr.granted ? "healthy" : "critical"} />
              </div>
            ))}
            <Field label="Data Subject Requests" value={c.application?.email ? "—" : "—"} />
          </div>
        </SectionCard>
      )}

      {activeTab === "security" && (
        <SectionCard title="Security Events" icon={Shield}>
          {c.securityEvents?.length ? (
            <div className="space-y-2">
              {c.securityEvents.map((se, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded px-3 py-2">
                  <span className="text-white/60 text-xs">{se.event_type || se.type || "Event"}</span>
                  <StatusBadge status={se.severity || "info"} color={se.severity} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No security events" />
          )}
        </SectionCard>
      )}

      {activeTab === "timeline" && (
        <SectionCard title="Activity Timeline" icon={Clock}>
          {c.timeline?.length ? (
            <div className="space-y-3">
              {c.timeline.map((event, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-white/70 text-sm">{event.label}</p>
                    <p className="text-white/30 text-xs">{event.date ? new Date(event.date).toLocaleDateString() : ""} {event.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No timeline events" />
          )}
        </SectionCard>
      )}
    </div>
  );
}