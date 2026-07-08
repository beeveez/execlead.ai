import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useCommunityMemberships, getOnlineCount } from "@/hooks/useCommunityMemberships";
import { toast } from "@/components/ui/use-toast";
import {
  Loader2, Target, Users, Lock, Crown, Check, ArrowRight, Circle,
  Shield, Sparkles,
} from "lucide-react";

export default function NetworkCircles() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { memberships, loading: loadingMems, reload, isMemberOf } = useCommunityMemberships();
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const load = async () => {
    try {
      setCircles(await base44.entities.NetworkCircle.list("name", 100));
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(circles.map((c) => c.category).filter(Boolean))];
    return ["all", ...cats];
  }, [circles]);

  const filtered = categoryFilter === "all" ? circles : circles.filter((c) => c.category === categoryFilter);

  const handleJoin = async (circle) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setJoining(circle.id);
    try {
      const response = await base44.functions.invoke("joinCommunity", { communityId: circle.id });
      const result = response.data || response;
      if (result.success) {
        toast({
          title: result.welcomeMessage || `Welcome to the ${circle.name}!`,
          description: "Redirecting to your community workspace...",
        });
        await reload();
        navigate(`/network/c/${circle.id}`);
      } else {
        handleError(result, circle);
      }
    } catch (err) {
      const errorData = err?.response?.data || err?.data || { error: "Failed to join community. Please try again." };
      handleError(errorData, circle);
    }
    setJoining(null);
  };

  const handleError = (error, circle) => {
    const code = error.code;
    if (code === "AUTH_REQUIRED") {
      toast({ title: "Sign In Required", description: error.error, variant: "destructive" });
      navigate("/login");
      return;
    }
    if (code === "SUBSCRIPTION_REQUIRED") {
      toast({
        title: `${error.requiredPlan?.charAt(0).toUpperCase() + error.requiredPlan?.slice(1)} Plan Required`,
        description: `${error.error} Visit Billing to upgrade.`,
        variant: "destructive",
      });
      return;
    }
    if (code === "FOUNDER_REQUIRED") {
      toast({
        title: "Founding Member Exclusive",
        description: `${error.error} Visit Billing to learn more.`,
        variant: "destructive",
      });
      return;
    }
    if (code === "CAPACITY_REACHED") {
      toast({ title: "Community Full", description: error.error, variant: "destructive" });
      return;
    }
    toast({ title: "Cannot Join", description: error.error || "Something went wrong.", variant: "destructive" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
          <Target size={12} className="text-indigo-400" /> Executive Communities
        </div>
        <h1 className="text-xl font-bold text-white">Private Communities</h1>
        <p className="text-white/40 text-sm mt-1">
          Join role-based and industry-specific executive communities with persistent memberships, discussions, and collaboration.
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 2 && (
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap capitalize transition-colors ${
                categoryFilter === cat ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"
              }`}
            >
              {cat === "all" ? "All Communities" : cat}
            </button>
          ))}
        </div>
      )}

      {loading || loadingMems ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-indigo-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">No communities available yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((circle) => {
            const joined = isMemberOf(circle.id);
            const onlineCount = getOnlineCount(circle.member_count);
            const isJoining = joining === circle.id;
            const needsPlan = circle.required_plan && circle.required_plan !== "free";
            return (
              <div
                key={circle.id}
                className="bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${circle.color || "#6366f1"}15`, color: circle.color || "#6366f1" }}
                  >
                    {circle.icon || "🎯"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {circle.is_private && (
                      <span className="flex items-center gap-1 text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                        <Lock size={9} /> Private
                      </span>
                    )}
                    {needsPlan && (
                      <span className="flex items-center gap-1 text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full capitalize">
                        <Sparkles size={9} /> {circle.required_plan}+
                      </span>
                    )}
                    {circle.requires_founding_member && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        <Crown size={9} /> Founder
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-white font-semibold text-sm mb-1">{circle.name}</h3>
                <p className="text-white/40 text-xs leading-relaxed mb-3 line-clamp-2 flex-1">{circle.description}</p>

                {/* Member Count + Online Presence */}
                <div className="flex items-center gap-3 mb-3 text-xs">
                  <span className="flex items-center gap-1 text-white/40">
                    <Users size={11} /> {(circle.member_count || 0).toLocaleString()} Members
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400/60">
                    <Circle size={5} className="fill-emerald-400 text-emerald-400" /> {onlineCount.toLocaleString()} Online
                  </span>
                </div>

                {/* Join / Open Community Button */}
                {joined ? (
                  <button
                    onClick={() => navigate(`/network/c/${circle.id}`)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium transition-colors w-full"
                  >
                    <Check size={12} /> Open Community <ArrowRight size={12} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoin(circle)}
                    disabled={isJoining}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-medium transition-colors w-full"
                  >
                    {isJoining ? (
                      <><Loader2 size={12} className="animate-spin" /> Joining...</>
                    ) : (
                      <><Users size={12} /> Join Community</>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Joined Communities Summary */}
      {memberships.length > 0 && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <Shield size={14} className="text-emerald-400" /> Your Communities ({memberships.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {memberships.map((m) => (
              <button
                key={m.id}
                onClick={() => navigate(`/network/c/${m.community_id}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/60 hover:text-white transition-colors"
              >
                <Check size={11} className="text-emerald-400" /> {m.community_name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}