import React, { useState } from "react";
import { X, Building2, Mail, Phone, Globe, MapPin, FileText, ShieldCheck, AlertTriangle, Star, TrendingUp } from "lucide-react";
import { formatCurrency, getStatusBadge, getRiskBadge, getPerformanceTierBadge, getCategoryLabel, getTypeLabel, parseScorecard, parseRiskFlags, COMPLIANCE_STATUS, SECURITY_ASSESSMENT_STATUS } from "@/lib/vendorEngine";

export default function VendorDetail({ vendor, onClose, onUpdate }) {
  if (!vendor) return null;
  const status = getStatusBadge(vendor.status);
  const risk = getRiskBadge(vendor.risk_level);
  const tier = getPerformanceTierBadge(vendor.performance_tier);
  const scorecard = parseScorecard(vendor);
  const riskFlags = parseRiskFlags(vendor);
  const compliance = COMPLIANCE_STATUS.find((c) => c.id === vendor.compliance_status);
  const security = SECURITY_ASSESSMENT_STATUS.find((s) => s.id === vendor.security_assessment_status);

  const scorecardDimensions = [
    { key: "quality", label: "Quality", score: scorecard.quality || 0 },
    { key: "delivery", label: "Delivery", score: scorecard.delivery || 0 },
    { key: "cost", label: "Cost", score: scorecard.cost || 0 },
    { key: "service", label: "Service", score: scorecard.service || 0 },
    { key: "innovation", label: "Innovation", score: scorecard.innovation || 0 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0d0d14] border-l border-white/10 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-[#0d0d14]/95 backdrop-blur border-b border-white/5 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-indigo-400" />
            <h3 className="text-sm font-medium text-white truncate">{vendor.vendor_name}</h3>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/80"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${status.badge}`}>{status.label}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${risk.badge}`}>Risk: {risk.label}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tier.badge}`}>{tier.label}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">{getTypeLabel(vendor.vendor_type)}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">{getCategoryLabel(vendor.category)}</span>
          </div>

          {vendor.contact_name || vendor.contact_email || vendor.contact_phone ? (
            <Section title="Contact">
              {vendor.contact_name && <DetailRow icon={Building2} label="Contact" value={vendor.contact_name} />}
              {vendor.contact_email && <DetailRow icon={Mail} label="Email" value={vendor.contact_email} />}
              {vendor.contact_phone && <DetailRow icon={Phone} label="Phone" value={vendor.contact_phone} />}
              {vendor.website && <DetailRow icon={Globe} label="Website" value={vendor.website} />}
              {vendor.address && <DetailRow icon={MapPin} label="Address" value={vendor.address} />}
            </Section>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total Spend" value={formatCurrency(vendor.total_spend)} icon={TrendingUp} />
            <StatCard label="Contract Value" value={formatCurrency(vendor.contract_value)} icon={FileText} />
            <StatCard label="Active Contracts" value={vendor.active_contracts || 0} icon={FileText} />
            <StatCard label="Performance" value={vendor.performance_score || 0} icon={Star} />
          </div>

          {vendor.contract_start_date || vendor.contract_end_date ? (
            <Section title="Contract">
              {vendor.contract_start_date && <DetailRow label="Start Date" value={vendor.contract_start_date} />}
              {vendor.contract_end_date && <DetailRow label="End Date" value={vendor.contract_end_date} />}
              {vendor.payment_terms && <DetailRow label="Payment Terms" value={vendor.payment_terms} />}
              {vendor.tax_id && <DetailRow label="Tax ID" value={vendor.tax_id} />}
            </Section>
          ) : null}

          <Section title="Risk & Compliance">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
                <div className="text-[9px] text-white/30 uppercase tracking-wider">Compliance</div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${compliance?.badge || ""} inline-block mt-1`}>{compliance?.label || "—"}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
                <div className="text-[9px] text-white/30 uppercase tracking-wider">Security Assessment</div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${security?.badge || ""} inline-block mt-1`}>{security?.label || "—"}</span>
              </div>
            </div>
            {vendor.security_assessment_date && (
              <DetailRow icon={ShieldCheck} label="Last Assessment" value={vendor.security_assessment_date} />
            )}
            {vendor.trust_center_integrated && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 mt-2">
                <ShieldCheck size={12} /> Trust Center Integrated
              </div>
            )}
          </Section>

          {riskFlags.length > 0 && (
            <Section title="Risk Flags">
              <div className="flex flex-wrap gap-1.5">
                {riskFlags.map((flag, i) => (
                  <span key={i} className="text-[10px] px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                    <AlertTriangle size={10} /> {flag}
                  </span>
                ))}
              </div>
            </Section>
          )}

          <Section title="Performance Scorecard">
            <div className="space-y-2">
              {scorecardDimensions.map((d) => (
                <div key={d.key}>
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-white/50">{d.label}</span>
                    <span className={d.score >= 80 ? "text-emerald-400" : d.score >= 60 ? "text-amber-400" : "text-red-400"}>{d.score}/100</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${d.score >= 80 ? "bg-emerald-500" : d.score >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${d.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {vendor.notes && (
            <Section title="Notes">
              <p className="text-xs text-white/50 bg-white/[0.02] border border-white/5 rounded-lg p-3">{vendor.notes}</p>
            </Section>
          )}

          {onUpdate && vendor.status === "onboarding" && (
            <button onClick={() => onUpdate(vendor, { status: "active", onboarding_status: "completed", onboarding_date: new Date().toISOString().split("T")[0] })} className="w-full flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/20 text-emerald-300 rounded-lg px-3 py-2 text-xs transition-colors">
              <ShieldCheck size={14} /> Approve & Activate Vendor
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {Icon && <Icon size={12} className="text-white/30 shrink-0" />}
      <span className="text-white/30 w-24">{label}</span>
      <span className="text-white/70 truncate">{value}</span>
    </div>
  );
}
function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon size={10} className="text-white/30" />}
        <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
      </div>
      <div className="text-sm text-white/80 font-medium">{value}</div>
    </div>
  );
}