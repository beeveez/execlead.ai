import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  Crown, Users, DollarSign, Clock, Download, Loader2,
  Search, Award, Ban, CheckCircle2, Hash, Activity, CreditCard,
} from "lucide-react";
import {
  FOUNDING_MEMBER_CONFIG,
  useFoundingMemberCountdown,
} from "@/lib/foundingMember";
import { toast } from "@/components/ui/use-toast";

const STATUS_STYLES = {
  pending: "bg-amber-500/10 text-amber-400",
  verified: "bg-blue-500/10 text-blue-400",
  active: "bg-emerald-500/10 text-emerald-400",
  suspended: "bg-red-500/10 text-red-400",
  expired: "bg-gray-500/10 text-gray-400",
  legacy: "bg-violet-500/10 text-violet-400",
  lifetime: "bg-amber-500/10 text-amber-400",
};

const TIER_LABELS = {
  founding_member: "Founding Member",
  investor_member: "Investor Member",
  enterprise_founder: "Enterprise Founder",
  advisory_council: "Advisory Council",
  ambassador: "Ambassador",
  partner_founder: "Partner Founder",
};

export default function FoundingMemberAdmin() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("");
  const { expired, days, hours, minutes } = useFoundingMemberCountdown();

  const load = async () => {
    try {
      const [founding, logs] = await Promise.all([
        base44.entities.FoundingMember.list("-created_date", 500),
        base44.entities.FoundingMemberAuditLog.list("-created_date", 50),
      ]);
      setMembers(founding);
      setAuditLogs(logs);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = members.filter((m) => {
    if (fStatus && m.status !== fStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.full_name?.toLowerCase().includes(q) ||
        m.founding_member_number?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const logAction = async (member, action, description) => {
    try {
      await base44.entities.FoundingMemberAuditLog.create({
        founding_member_id: member.id,
        founding_member_number: member.founding_member_number,
        user_id: member.user_id,
        member_name: member.full_name,
        action,
        description,
        performed_by: user?.id,
        performed_by_name: user?.email || "Admin",
      });
    } catch (e) {}
  };

  const updateMember = async (member, updates, action, description) => {
    try {
      await base44.entities.FoundingMember.update(member.id, updates);
      await logAction(member, action, description);
      toast({ title: "Action completed", description });
      load();
    } catch (e) {
      toast({ title: "Action failed", variant: "destructive" });
    }
  };

  const handleSuspend = (m) => updateMember(m, { status: "suspended" }, "member_suspended", `${m.full_name} suspended by administrator`);
  const handleActivate = (m) => updateMember(m, { status: "active" }, "member_restored", `${m.full_name} restored to active status`);
  const handleIssueCert = (m) => updateMember(m, { certificate_issued: true, certificate_issued_date: new Date().toISOString().split("T")[0] }, "certificate_issued", `Certificate issued to ${m.full_name}`);

  const handleIssueNumber = (m) => {
    const number = prompt("Enter founding member number:", `FM-${String(members.length + 1).padStart(4, "0")}`);
    if (!number) return;
    updateMember(m, { founding_member_number: number }, "founder_number_issued", `Founder number ${number} assigned to ${m.full_name}`);
  };

  const handleUpgrade = (m, tier) => {
    if (tier === m.founding_tier) return;
    updateMember(m, { founding_tier: tier }, "member_upgraded", `${m.full_name} upgraded to ${TIER_LABELS[tier]}`);
  };

  const exportCSV = () => {
    const headers = ["Number", "Name", "Email", "Tier", "Status", "Plan", "Joined", "Discount %", "Lifetime Savings", "Certificate", "Referrals", "Wallet"];
    const rows = members.map((m) => [
      m.founding_member_number || "", m.full_name || "Unknown", m.email || "",
      TIER_LABELS[m.founding_tier] || m.founding_tier, m.status || "active",
      m.subscription_plan || "free",
      m.joined_date ? new Date(m.joined_date).toLocaleDateString() : "",
      m.lifetime_discount_percentage || 25, m.lifetime_savings || 0,
      m.certificate_issued ? "Yes" : "No", m.referrals_count || 0, m.founding_wallet || 0,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "founding-members.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalSavings = members.reduce((s, m) => s + (m.lifetime_savings || 0), 0);
  const totalWallet = members.reduce((s, m) => s + (m.founding_wallet || 0), 0);
  const activeCount = members.filter((m) => m.status === "active").length;
  const certCount = members.filter((m) => m.certificate_issued).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Crown size={12} className="text-amber-400" /> Founding Member Administration
          </div>
          <h1 className="text-2xl font-bold text-white">Founding Member Program</h1>
        </div>
        <button
          onClick={exportCSV}
          disabled={members.length === 0}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-30"
        >
          <Download size={16} /> Export
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Members" value={members.length} color="amber" />
        <StatCard icon={CheckCircle2} label="Active" value={activeCount} color="emerald" />
        <StatCard icon={Award} label="Certificates Issued" value={certCount} color="amber" />
        <StatCard icon={DollarSign} label="Lifetime Savings" value={`$${totalSavings.toLocaleString()}`} color="emerald" />
        <StatCard icon={CreditCard} label="Founding Wallet" value={`$${totalWallet.toLocaleString()}`} color="amber" />
        <StatCard
          icon={Clock}
          label="Countdown"
          value={expired ? "Concluded" : `${days}d ${hours}h ${minutes}m`}
          color={expired ? "red" : "amber"}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, number, or email..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
        </div>
        <select
          value={fStatus}
          onChange={(e) => setFStatus(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="lifetime">Lifetime</option>
          <option value="legacy">Legacy</option>
        </select>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Founding Members ({filtered.length})</h3>
        {filtered.length === 0 ? (
          <p className="text-white/30 text-sm py-8 text-center">No founding members found.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((m) => (
              <div key={m.id} className="flex items-center gap-3 bg-white/[0.02] rounded-lg px-3 py-3 flex-wrap">
                <span className="text-amber-400/50 text-xs font-mono w-16 shrink-0">
                  #{m.founding_member_number || "—"}
                </span>
                <div className="flex-1 min-w-[120px]">
                  <div className="text-white/80 text-sm">{m.full_name || "Unknown"}</div>
                  <div className="text-white/30 text-xs">
                    {TIER_LABELS[m.founding_tier] || m.founding_tier} · {m.subscription_plan || "free"}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_STYLES[m.status] || STATUS_STYLES.active}`}>
                  {m.status}
                </span>
                {m.certificate_issued && <Award size={14} className="text-amber-400" />}
                <div className="flex items-center gap-1 ml-auto">
                  {m.status === "active" ? (
                    <button
                      onClick={() => handleSuspend(m)}
                      title="Suspend"
                      className="p-1.5 rounded-lg bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Ban size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(m)}
                      title="Activate"
                      className="p-1.5 rounded-lg bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    >
                      <CheckCircle2 size={14} />
                    </button>
                  )}
                  {!m.certificate_issued && (
                    <button
                      onClick={() => handleIssueCert(m)}
                      title="Issue Certificate"
                      className="p-1.5 rounded-lg bg-amber-500/5 text-amber-400 hover:bg-amber-500/10 transition-colors"
                    >
                      <Award size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleIssueNumber(m)}
                    title="Issue Number"
                    className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
                  >
                    <Hash size={14} />
                  </button>
                  <select
                    value={m.founding_tier}
                    onChange={(e) => handleUpgrade(m, e.target.value)}
                    title="Change Tier"
                    className="bg-white/5 border border-white/10 rounded-lg px-1 py-1 text-[10px] text-white/40 focus:outline-none"
                  >
                    {Object.entries(TIER_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="flex items-center gap-2 text-white font-semibold text-sm mb-4">
          <Activity size={14} className="text-amber-400" /> Audit Log
        </h3>
        {auditLogs.length === 0 ? (
          <p className="text-white/30 text-sm py-6 text-center">No audit entries yet.</p>
        ) : (
          <div className="space-y-2">
            {auditLogs.slice(0, 20).map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/40 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-white/70">{log.description}</span>
                  <span className="text-white/30 ml-2">· {log.member_name || "Unknown"}</span>
                  <div className="text-white/20 text-[10px]">
                    {new Date(log.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    {log.performed_by_name && ` · by ${log.performed_by_name}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Program Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <ConfigItem label="Status" value={expired ? "Concluded" : "Active"} />
          <ConfigItem label="End Date" value={new Date(FOUNDING_MEMBER_CONFIG.endDate).toLocaleDateString()} />
          <ConfigItem label="Discount" value={`${FOUNDING_MEMBER_CONFIG.discountPercent}%`} />
          <ConfigItem label="Max Members" value={FOUNDING_MEMBER_CONFIG.maxMembers} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    amber: "text-amber-400 bg-amber-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    red: "text-red-400 bg-red-500/10",
  };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon size={16} />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-white/30 text-xs mt-1">{label}</div>
    </div>
  );
}

function ConfigItem({ label, value }) {
  return (
    <div>
      <div className="text-white/30 text-xs uppercase tracking-wider mb-1">{label}</div>
      <div className="text-white/80">{value}</div>
    </div>
  );
}