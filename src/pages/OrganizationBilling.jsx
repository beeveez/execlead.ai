import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSubscription } from "@/lib/SubscriptionContext";
import { formatCurrency } from "@/lib/payments";
import PaymentHistory from "@/components/billing/PaymentHistory";
import CompanyLogo from "@/components/companies/CompanyLogo";
import OrganizationDangerZone from "@/components/organization/OrganizationDangerZone";
import {
  Building2, CreditCard, Loader2, Users, DollarSign, Calendar,
  FileText, Plus, ArrowUpCircle, Cpu, HardDrive, Mail, ExternalLink,
} from "lucide-react";

function Field({ label, value, icon: Icon }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-1.5 text-white/30 text-xs mb-1.5">
        {Icon && <Icon size={11} />} {label}
      </div>
      <div className="text-white/80 text-sm font-medium break-all">{value || "—"}</div>
    </div>
  );
}

const STATUS_STYLES = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  suspended: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-white/5 text-white/40 border-white/10",
};

export default function OrganizationBilling() {
  const { profile } = useSubscription();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const reloadOrg = async () => {
    if (!profile?.organization_id) return;
    try {
      const orgData = await base44.entities.Organization.get(profile.organization_id);
      setOrg(orgData);
    } catch {}
  };

  useEffect(() => {
    if (!profile?.organization_id) { setLoading(false); return; }
    const load = async () => {
      try {
        const [orgData, invoiceData] = await Promise.all([
          base44.entities.Organization.get(profile.organization_id),
          base44.entities.Invoice.filter({ organization_id: profile.organization_id }, "-created_date", 50).catch(() => []),
        ]);
        setOrg(orgData);
        setInvoices(invoiceData);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, [profile?.organization_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="text-center py-20">
        <Building2 size={24} className="mx-auto text-white/20 mb-3" />
        <p className="text-white/50 text-sm font-medium">No organization subscription found.</p>
        <p className="text-white/30 text-xs mt-1">Contact your administrator or request an enterprise proposal.</p>
        <Link to="/cpq" className="mt-4 inline-block text-cyan-400 text-sm hover:text-cyan-300">Request Enterprise Proposal →</Link>
      </div>
    );
  }

  const seatsTotal = org.seats_total || 0;
  const seatsUsed = org.seats_used || 0;
  const seatsAvailable = Math.max(0, seatsTotal - seatsUsed);
  const seatsPct = seatsTotal ? Math.min(100, Math.round((seatsUsed / seatsTotal) * 100)) : 0;
  const status = org.plan_status || "pending";
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : "—";
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Building2 size={12} className="text-cyan-400" /> Organization Billing
        </div>
        <h1 className="text-2xl font-bold text-white">Enterprise Subscription</h1>
      </div>

      <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <CompanyLogo company={org} size="lg" />
            <div>
              <h2 className="text-xl font-bold text-white">{org.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Enterprise Plan</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>{statusLabel}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate("/enterprise")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors">
              <Plus size={12} /> Add Seats
            </button>
            <button onClick={() => navigate("/enterprise")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors">
              <ArrowUpCircle size={12} /> Upgrade Plan
            </button>
            {org.contract_url && (
              <a href={org.contract_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors">
                <FileText size={12} /> Contract <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-white/30 text-xs mb-1"><DollarSign size={11} /> Annual Contract Value</div>
          <div className="text-xl font-bold text-white">{formatCurrency(org.annual_value || org.grand_total || 0, org.currency || "USD")}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-white/30 text-xs mb-1"><Users size={11} /> Seats</div>
          <div className="text-xl font-bold text-white">{seatsUsed}<span className="text-sm text-white/30 font-normal"> / {seatsTotal}</span></div>
          <div className="text-xs text-white/30 mt-0.5">{seatsAvailable} available</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-white/30 text-xs mb-1"><Calendar size={11} /> Renewal Date</div>
          <div className="text-sm font-semibold text-white mt-1">{fmtDate(org.renewal_date)}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-white/30 text-xs mb-1"><Calendar size={11} /> Contract Term</div>
          <div className="text-sm font-semibold text-white mt-1">{org.contract_length_years || 1} year{(org.contract_length_years || 1) > 1 ? "s" : ""}</div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Contract & Billing Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Field label="Organization Name" value={org.name} icon={Building2} />
          <Field label="Organization ID" value={org.id} icon={Building2} />
          <Field label="Enterprise Plan" value="Enterprise" icon={CreditCard} />
          <Field label="Contract Status" value={statusLabel} icon={CreditCard} />
          <Field label="Billing Cycle" value="Annual" icon={Calendar} />
          <Field label="Contract Start" value={fmtDate(org.contract_start_date)} icon={Calendar} />
          <Field label="Contract End" value={fmtDate(org.contract_end_date)} icon={Calendar} />
          <Field label="Billing Contact" value={org.admin_email} icon={Mail} />
          <Field label="Payment Method" value="Invoice / Wire Transfer" icon={CreditCard} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Usage</h3>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-white/60 text-sm"><Users size={13} /> Seat Utilization</div>
              <span className="text-xs text-white/40">{seatsUsed} / {seatsTotal} ({seatsPct}%)</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all" style={{ width: `${seatsPct}%` }} />
            </div>
            <div className="text-xs text-white/30 mt-1">{seatsAvailable} seats available</div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div>
              <div className="flex items-center gap-1.5 text-white/60 text-sm mb-1"><Cpu size={13} /> AI Usage</div>
              <div className="text-xs text-white/40">Included in Enterprise plan</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-white/60 text-sm mb-1"><HardDrive size={13} /> Storage Usage</div>
              <div className="text-xs text-white/40">Included in Enterprise plan</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Invoice History</h3>
        <PaymentHistory invoices={invoices} profile={profile} />
      </div>

      <OrganizationDangerZone org={org} onUpdated={reloadOrg} />
    </div>
  );
}