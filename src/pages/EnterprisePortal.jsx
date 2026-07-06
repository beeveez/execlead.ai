import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import {
  Loader2, ArrowLeft, Building2, Users, Calendar, DollarSign,
  FileText, Download, CreditCard, UserPlus, RefreshCw, CheckCircle2,
  Mail, Settings, TrendingUp
} from "lucide-react";

export default function EnterprisePortal() {
  const { quoteId } = useParams();
  const [quote, setQuote] = useState(null);
  const [org, setOrg] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const q = await base44.entities.CPQQuote.get(quoteId);
        setQuote(q);
        if (q.organization_id) {
          try {
            const o = await base44.entities.Organization.get(q.organization_id);
            setOrg(o);
          } catch (e) {}
        }
        if (q.invoice_id) {
          try {
            const inv = await base44.entities.Invoice.get(q.invoice_id);
            setInvoice(inv);
          } catch (e) {}
        }
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, [quoteId]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || inviting) return;
    setInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail.trim(), "user");
      if (org) {
        await base44.entities.Organization.update(org.id, { seats_used: (org.seats_used || 0) + 1 });
        setOrg({ ...org, seats_used: (org.seats_used || 0) + 1 });
      }
      setInviteEmail("");
      toast({ title: "Invitation Sent", description: `${inviteEmail} has been invited to your organization.` });
    } catch (e) {
      toast({ title: "Invite Failed", description: e.message || "Could not send invitation.", variant: "destructive" });
    }
    setInviting(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  if (!quote) return (
    <div className="text-center py-12">
      <p className="text-white/40">Portal not found</p>
      <Link to="/dashboard" className="text-indigo-400 text-sm mt-2 inline-block">Back to Dashboard</Link>
    </div>
  );

  if (!org && quote.status !== "active") {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Building2 size={48} className="text-white/20 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Subscription Not Yet Active</h2>
        <p className="text-white/40 text-sm mb-6">Your enterprise subscription is still being processed. Complete the activation workflow to access the portal.</p>
        <Link to={`/cpq/quote/${quote.id}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
          Go to Proposal <ArrowLeft size={14} className="rotate-180" />
        </Link>
      </div>
    );
  }

  const seatsTotal = org?.seats_total || quote.expected_active_users || 0;
  const seatsUsed = org?.seats_used || 1;
  const seatPct = seatsTotal > 0 ? Math.round((seatsUsed / seatsTotal) * 100) : 0;
  const contractEnd = org?.contract_end_date || quote.valid_until;
  const annualValue = org?.annual_value || quote.annual_value || 0;

  const stats = [
    { icon: Users, label: "Seats", value: `${seatsUsed} / ${seatsTotal}`, sub: `${seatPct}% used` },
    { icon: Calendar, label: "Renewal Date", value: org?.renewal_date ? new Date(org.renewal_date).toLocaleDateString() : "—", sub: `${quote.contract_length_years || 1}yr contract` },
    { icon: DollarSign, label: "Annual Value", value: `${quote.currency} ${annualValue.toLocaleString()}`, sub: "per year" },
    { icon: CreditCard, label: "Payment Status", value: quote.payment_status || "—", sub: quote.payment_method?.replace(/_/g, " ") || "" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/dashboard" className="flex items-center gap-2 text-white/40 hover:text-white/60 text-sm transition-colors">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-emerald-500/5 border border-white/5 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center">
              <Building2 size={28} className="text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
                <CheckCircle2 size={10} className="text-emerald-400" /> Enterprise Customer Portal
              </div>
              <h1 className="text-2xl font-bold text-white">{org?.name || quote.organization_name}</h1>
              <p className="text-white/40 text-sm">{quote.proposal_number} · {quote.industry} · {quote.country}</p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} className="text-white/30" />
              <span className="text-[10px] text-white/30 uppercase tracking-wider">{s.label}</span>
            </div>
            <div className="text-lg font-bold text-white capitalize">{s.value}</div>
            <div className="text-xs text-white/30 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Proposal & Contract */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} className="text-indigo-400" />
            <h3 className="text-sm font-medium text-white/70">Proposal & Contract</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-white/30" />
                <span className="text-sm text-white/60">Proposal {quote.proposal_number}</span>
              </div>
              {quote.pdf_url && (
                <a href={quote.pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-400 text-xs hover:text-indigo-300">
                  <Download size={12} /> Download
                </a>
              )}
            </div>
            <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-white/30" />
                <span className="text-sm text-white/60">Contract (MSA + Subscription)</span>
              </div>
              {quote.contract_url && (
                <a href={quote.contract_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-400 text-xs hover:text-indigo-300">
                  <Download size={12} /> Download
                </a>
              )}
            </div>
            <Link to={`/cpq/quote/${quote.id}`} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg hover:bg-white/5 transition-colors">
              <span className="text-sm text-white/60">View Full Proposal</span>
              <ArrowLeft size={14} className="text-white/30 rotate-180" />
            </Link>
          </div>
        </div>

        {/* Invoice & Payment */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-emerald-400" />
            <h3 className="text-sm font-medium text-white/70">Invoice & Payment</h3>
          </div>
          <div className="space-y-2">
            {invoice && (
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-white/30" />
                  <span className="text-sm text-white/60">Invoice {invoice.invoice_number}</span>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${invoice.status === "paid" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                  {invoice.status}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
              <span className="text-sm text-white/60">Total Contract Value</span>
              <span className="text-sm font-medium text-white/80">{quote.currency} {(quote.grand_total || 0).toLocaleString()}</span>
            </div>
            {quote.payment_transaction_id && (
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                <span className="text-sm text-white/60">Transaction ID</span>
                <span className="text-xs text-white/40 font-mono">{quote.payment_transaction_id}</span>
              </div>
            )}
            {quote.paid_at && (
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                <span className="text-sm text-white/60">Paid On</span>
                <span className="text-sm text-white/60">{new Date(quote.paid_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Seat Management */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-indigo-400" />
            <h3 className="text-sm font-medium text-white/70">Seat Management</h3>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-white/40 mb-1.5">
              <span>{seatsUsed} of {seatsTotal} seats used</span>
              <span>{seatPct}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${seatPct >= 90 ? "bg-red-500" : seatPct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${seatPct}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={inviting}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50"
                placeholder="colleague@company.com"
              />
              <button
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || inviting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white text-sm font-medium transition-colors"
              >
                {inviting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                Invite
              </button>
            </div>
            {seatPct >= 80 && (
              <p className="text-xs text-amber-400/70">Running low on seats. Contact sales to add more.</p>
            )}
          </div>
        </div>

        {/* Subscription & Renewal */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw size={16} className="text-emerald-400" />
            <h3 className="text-sm font-medium text-white/70">Subscription & Renewal</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
              <span className="text-sm text-white/60">Plan</span>
              <span className="text-sm font-medium text-white/80 capitalize">{org?.plan || "Enterprise"}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
              <span className="text-sm text-white/60">Billing Cycle</span>
              <span className="text-sm text-white/60">Annual</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
              <span className="text-sm text-white/60">Contract Start</span>
              <span className="text-sm text-white/60">{org?.contract_start_date ? new Date(org.contract_start_date).toLocaleDateString() : "—"}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
              <span className="text-sm text-white/60">Renewal Date</span>
              <span className="text-sm text-white/60">{contractEnd ? new Date(contractEnd).toLocaleDateString() : "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <a href="mailto:sales@execlead.ai" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">
          <Mail size={14} /> Contact Sales
        </a>
        <a href="mailto:support@execlead.ai" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">
          <Settings size={14} /> Support
        </a>
        <Link to="/enterprise" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">
          <TrendingUp size={14} /> Organization Dashboard
        </Link>
      </div>
    </div>
  );
}