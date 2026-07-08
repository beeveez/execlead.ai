import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Crown, Users, TrendingUp, DollarSign, Clock, Download, Loader2,
} from "lucide-react";
import {
  FOUNDING_MEMBER_CONFIG,
  useFoundingMemberCountdown,
} from "@/lib/foundingMember";
import { PLANS } from "@/lib/plans";

export default function FoundingMemberAdmin() {
  const [members, setMembers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const { expired, days, hours, minutes } = useFoundingMemberCountdown();

  useEffect(() => {
    const load = async () => {
      try {
        const [founding, allUsers] = await Promise.all([
          base44.entities.UserProfile.filter({ founding_member: true }),
          base44.entities.UserProfile.list(),
        ]);
        setMembers(founding);
        setTotalUsers(allUsers.length);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const totalMembers = members.length;
  const remaining = Math.max(0, FOUNDING_MEMBER_CONFIG.maxMembers - totalMembers);
  const conversionRate = totalUsers > 0 ? ((totalMembers / totalUsers) * 100).toFixed(1) : 0;

  const revenueEstimate = members.reduce((sum, m) => {
    const plan = PLANS[m.subscription_plan];
    return sum + (plan?.monthlyPrice || 0);
  }, 0);

  const discountValue =
    revenueEstimate * (FOUNDING_MEMBER_CONFIG.discountPercent / 100) * 12 * 5;

  const exportCSV = () => {
    const headers = ["Name", "Plan", "Joined Date", "Discount %"];
    const rows = members.map((m) => [
      m.full_name || m.target_role || "Unknown",
      m.subscription_plan || "free",
      m.founding_member_since ? new Date(m.founding_member_since).toLocaleDateString() : "",
      FOUNDING_MEMBER_CONFIG.discountPercent,
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Founding Members" value={totalMembers} color="amber" />
        <StatCard icon={Crown} label="Remaining Availability" value={remaining} color="amber" />
        <StatCard icon={TrendingUp} label="Conversion Rate" value={`${conversionRate}%`} color="emerald" />
        <StatCard icon={DollarSign} label="Monthly Revenue" value={`$${revenueEstimate.toLocaleString()}`} color="emerald" />
        <StatCard
          icon={DollarSign}
          label="Lifetime Discount Value"
          value={`$${discountValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          color="amber"
        />
        <StatCard
          icon={Clock}
          label="Countdown Status"
          value={expired ? "Concluded" : `${days}d ${hours}h ${minutes}m`}
          color={expired ? "red" : "amber"}
        />
      </div>

      {/* Configuration */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Program Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <ConfigItem label="Status" value={expired ? "Concluded" : "Active"} />
          <ConfigItem
            label="End Date"
            value={new Date(FOUNDING_MEMBER_CONFIG.endDate).toLocaleDateString()}
          />
          <ConfigItem label="Discount" value={`${FOUNDING_MEMBER_CONFIG.discountPercent}%`} />
          <ConfigItem label="Max Members" value={FOUNDING_MEMBER_CONFIG.maxMembers} />
        </div>
      </div>

      {/* Member List */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Founding Members</h3>
        {members.length === 0 ? (
          <p className="text-white/30 text-sm py-8 text-center">No founding members yet.</p>
        ) : (
          <div className="space-y-2">
            {members.map((m, i) => (
              <div
                key={m.id}
                className="flex items-center gap-3 bg-white/[0.02] rounded-lg px-3 py-2"
              >
                <span className="text-amber-400/50 text-xs font-mono w-8">
                  #{String(i + 1).padStart(3, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-white/80 text-sm">
                    {m.full_name || m.target_role || "Unknown"}
                  </div>
                  <div className="text-white/30 text-xs">{m.subscription_plan || "free"}</div>
                </div>
                {m.founding_member_since && (
                  <span className="text-white/30 text-xs">
                    {new Date(m.founding_member_since).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
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