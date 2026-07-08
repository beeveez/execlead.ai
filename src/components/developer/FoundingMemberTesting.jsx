import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { useFoundingMember } from "@/hooks/useFoundingMember";
import FoundingMemberBadge from "@/components/founding/FoundingMemberBadge";
import { FOUNDING_MEMBER_TIERS } from "@/lib/foundingMember";
import {
  Crown, Loader2, Power, Hash, ToggleLeft, ToggleRight, Award, Shield, Eye,
} from "lucide-react";

const TIERS = Object.entries(FOUNDING_MEMBER_TIERS);

export default function FoundingMemberTesting() {
  const { user } = useAuth();
  const { member, loading, reload } = useFoundingMember();
  const [busy, setBusy] = useState(false);
  const [number, setNumber] = useState("");
  const [tier, setTier] = useState("founding_member");
  const [cohort, setCohort] = useState("Batch #1");

  useEffect(() => {
    if (member) {
      setNumber(member.founding_member_number || "");
      setTier(member.founding_tier || "founding_member");
      setCohort(member.founding_batch || "Batch #1");
    }
  }, [member]);

  const today = new Date().toISOString().split("T")[0];

  const enable = async () => {
    setBusy(true);
    try {
      const count = await base44.entities.FoundingMember.list();
      const num = `FM-${String(count.length + 1).padStart(4, "0")}`;
      await base44.entities.FoundingMember.create({
        founding_member_number: num,
        user_id: user.id,
        full_name: user.full_name || user.email || "Developer",
        email: user.email,
        joined_date: today,
        founding_batch: "Batch #1",
        founding_tier: "founding_member",
        status: "active",
        subscription_plan: "professional",
        lifetime_discount_percentage: 25,
        lifetime_discount_enabled: true,
        protected_pricing: true,
        badge_status: "granted",
        badge_issued_date: today,
        early_access_enabled: true,
        early_access_modules: ["Leadership DNA", "AI Agents", "Board Simulator", "Executive Analytics"],
        community_access: true,
        beta_access: true,
        roadmap_voting: true,
        feedback_sessions: true,
        certificate_issued: false,
        founding_wallet: 100,
        referrals_count: 0,
        total_rewards: 200,
        lifetime_savings: 480,
      });
      await base44.entities.FoundingMemberAuditLog.create({
        founding_member_id: "dev-test",
        founding_member_number: num,
        user_id: user.id,
        member_name: user.full_name || "Developer",
        action: "benefit_granted",
        description: "Founding Member enabled via Developer Testing",
        performed_by: user.id,
        performed_by_name: "Developer",
      });
      toast({ title: "Founding Member enabled", description: `Founder number ${num} assigned.` });
      await reload();
    } catch (e) {
      toast({ title: "Failed to enable", variant: "destructive" });
    }
    setBusy(false);
  };

  const disable = async () => {
    if (!member) return;
    setBusy(true);
    try {
      await base44.entities.FoundingMember.delete(member.id);
      toast({ title: "Founding Member disabled" });
      await reload();
    } catch (e) {
      toast({ title: "Failed to disable", variant: "destructive" });
    }
    setBusy(false);
  };

  const assign = async () => {
    if (!member) return;
    setBusy(true);
    try {
      await base44.entities.FoundingMember.update(member.id, {
        founding_member_number: number,
        founding_tier: tier,
        founding_batch: cohort,
      });
      await base44.entities.FoundingMemberAuditLog.create({
        founding_member_id: member.id,
        founding_member_number: number,
        user_id: member.user_id,
        member_name: member.full_name,
        action: "founder_number_issued",
        description: `Developer assigned number ${number}, tier ${FOUNDING_MEMBER_TIERS[tier]}, cohort ${cohort}`,
        performed_by: user.id,
        performed_by_name: "Developer",
      });
      toast({ title: "Founder identity updated" });
      await reload();
    } catch (e) {
      toast({ title: "Update failed", variant: "destructive" });
    }
    setBusy(false);
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-amber-400" /></div>;
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Crown size={16} className="text-amber-400" />
        <h3 className="text-white font-semibold text-sm">Founding Member Testing</h3>
      </div>

      {!member ? (
        <div className="text-center py-4">
          <p className="text-white/40 text-sm mb-4">Founding Member is not enabled for your account.</p>
          <button
            onClick={enable}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 text-sm font-medium transition-colors disabled:opacity-40"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />} Enable Founding Member
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FoundingMemberBadge size={12} joinedDate={member.joined_date} />
              <span className="text-white/50 text-xs font-mono">#{member.founding_member_number}</span>
            </div>
            <button
              onClick={disable}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/5 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors disabled:opacity-40"
            >
              {busy ? <Loader2 size={12} className="animate-spin" /> : <ToggleRight size={14} />} Disable
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-white/30 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1"><Hash size={10} /> Founder Number</label>
              <input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
            <div>
              <label className="text-white/30 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1"><Crown size={10} /> Founder Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
              >
                {TIERS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/30 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1"><Award size={10} /> Founding Cohort</label>
              <input
                value={cohort}
                onChange={(e) => setCohort(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <button
            onClick={assign}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors disabled:opacity-40"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />} Assign Identity
          </button>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-white/30 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1"><Eye size={10} /> Badge Preview</div>
              <FoundingMemberBadge size={12} joinedDate={member.joined_date} />
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-white/30 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1"><Shield size={10} /> Benefits Preview</div>
              <div className="space-y-1 text-[10px] text-white/50">
                <div className="flex items-center gap-1"><ToggleRight size={10} className="text-emerald-400" /> Discount: {member.lifetime_discount_percentage || 25}%</div>
                <div className="flex items-center gap-1"><ToggleRight size={10} className="text-emerald-400" /> Early Access: {member.early_access_enabled ? "On" : "Off"}</div>
                <div className="flex items-center gap-1"><ToggleRight size={10} className="text-emerald-400" /> Community: {member.community_access ? "On" : "Off"}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}