import React from "react";
import { Activity, Globe, ShieldAlert, TrendingDown, Brain } from "lucide-react";
import { RISK_FACTORS, RISK_LEVELS, calculateLoginRisk } from "@/lib/zeroTrustEngine";
import { SectionCard } from "@/components/security/SecuritySection";

function RiskLevelBar({ level, data }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 text-xs font-medium" style={{ color: data.color }}>{data.label}</div>
      <div className="flex-1 h-8 rounded-lg bg-white/5 overflow-hidden flex items-center px-3">
        <span className="text-[10px] text-white/40">Score: {level === "low" ? "0-20" : level === "medium" ? "21-50" : level === "high" ? "51-75" : "76-100"}</span>
      </div>
      <div className="w-32 text-xs text-white/50 text-right">{data.action}</div>
    </div>
  );
}

export default function RiskIntelligence() {
  // Example: calculate risk for a sample high-risk login
  const sampleRisk = calculateLoginRisk(["new_device", "impossible_travel", "vpn_detection"]);

  return (
    <div className="space-y-4">
      {/* Risk Engine Overview */}
      <SectionCard icon={Brain} title="Login Risk Engine" description="Every login is automatically scored in real time. Risk-based access controls require additional verification when risk increases.">
        <div className="space-y-2 mb-4">
          {Object.entries(RISK_LEVELS).map(([level, data]) => <RiskLevelBar key={level} level={level} data={data} />)}
        </div>
      </SectionCard>

      {/* Sample Risk Calculation */}
      <SectionCard icon={ShieldAlert} title="Risk Scoring Example" description="When multiple risk factors are detected, scores compound. High-risk logins are blocked or require step-up authentication.">
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
          <div className="text-xs text-white/40 mb-3">Example: Login from new device + impossible travel + VPN detected</div>
          <div className="space-y-2 mb-4">
            {sampleRisk.factors.map((f, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-white/60">{f.label}</span>
                <span className="font-mono text-white/40">+{f.weight}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-sm text-white/80 font-medium">Total Risk Score</span>
              <span className="font-mono font-bold" style={{ color: RISK_LEVELS[sampleRisk.level].color }}>{sampleRisk.score}/100</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: `${RISK_LEVELS[sampleRisk.level].color}10`, border: `1px solid ${RISK_LEVELS[sampleRisk.level].color}30` }}>
            <ShieldAlert size={16} style={{ color: RISK_LEVELS[sampleRisk.level].color }} />
            <span className="text-sm font-medium" style={{ color: RISK_LEVELS[sampleRisk.level].color }}>
              {RISK_LEVELS[sampleRisk.level].label} Risk — Action: {sampleRisk.action}
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Executive Trust Integration */}
      <SectionCard icon={Activity} title="Executive Trust Integration" description="Identity verification automatically feeds the Risk Engine, Security Dashboard, and Fraud Detection systems.">
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            { label: "Executive Trust Score", desc: "Feeds risk-based access decisions" },
            { label: "Risk Engine", desc: "Identity level modifies login risk baseline" },
            { label: "Security Dashboard", desc: "Verified users counted in health score" },
            { label: "Fraud Detection", desc: "Unverified identities flagged for review" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <TrendingDown size={14} className="text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm text-white/80">{item.label}</div>
                <div className="text-[10px] text-white/30 mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Founder Security */}
      <SectionCard icon={Globe} title="Founding Member Security" description="Founder benefits are protected against fraud. Identity verification is required before permanent Founder status is granted.">
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            "Referral Fraud Prevention", "Discount Abuse Detection", "Duplicate Founder Account Prevention",
            "Identity Sharing Prevention", "Coupon Abuse Detection", "Identity Verification Required",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
              <ShieldAlert size={12} className="text-amber-400 flex-shrink-0" />
              <span className="text-xs text-white/60">{item}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Admin Security */}
      <SectionCard icon={ShieldAlert} title="Admin Security" description="All administrative actions require MFA, audit logging, and permission validation. High-risk operations require step-up authentication.">
        <div className="space-y-2">
          {[
            "MFA required for all admin actions",
            "Every admin action is audit logged",
            "Permission validation before execution",
            "High-risk operations require step-up authentication",
            "Identity Review permission required for document access",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-white/60">
              <ShieldAlert size={12} className="text-red-400 flex-shrink-0 mt-1" /> {item}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}