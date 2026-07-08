import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ROLE_META } from "@/hooks/useCommunityMemberships";
import { Loader2, Trophy, Crown, Medal, Award } from "lucide-react";

const RANK_ICONS = [
  { icon: Crown, color: "text-amber-400", bg: "bg-amber-500/10" },
  { icon: Medal, color: "text-slate-300", bg: "bg-slate-400/10" },
  { icon: Award, color: "text-orange-400", bg: "bg-orange-500/10" },
];

export default function CommunityLeaderboard() {
  const { community } = useOutletContext();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await base44.entities.CommunityMembership.filter(
          { community_id: community.id, status: "active" }, "-reputation", 100
        );
        setMembers(all);
      } catch {}
      setLoading(false);
    };
    load();
  }, [community.id]);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Trophy size={18} className="text-amber-400" /> Leaderboard
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Top contributors in {community.name} ranked by reputation.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-indigo-400" />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">No members yet.</div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {members.length >= 3 && (
            <div className="grid grid-cols-3 gap-3">
              {[1, 0, 2].map((idx) => {
                const m = members[idx];
                const rank = idx + 1;
                const RankIcon = RANK_ICONS[idx]?.icon || Trophy;
                return (
                  <div
                    key={m.id}
                    className={`bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center ${idx === 0 ? "sm:scale-105" : ""}`}
                    style={{ order: idx }}
                  >
                    <div className={`w-12 h-12 rounded-full ${RANK_ICONS[idx]?.bg || "bg-white/5"} flex items-center justify-center mx-auto mb-2`}>
                      <RankIcon size={20} className={RANK_ICONS[idx]?.color || "text-white/40"} />
                    </div>
                    <p className="text-white font-medium text-sm truncate">{m.user_name}</p>
                    <p className="text-xs text-amber-400 font-bold mt-1">{m.reputation || 0}</p>
                    <p className="text-[10px] text-white/30">reputation</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Leaderboard */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl divide-y divide-white/5">
            {members.map((m, i) => {
              const roleMeta = ROLE_META[m.member_role] || ROLE_META.member;
              return (
                <div key={m.id} className="flex items-center gap-3 p-4">
                  <span className={`text-sm font-bold w-6 text-center ${i < 3 ? "text-amber-400" : "text-white/30"}`}>
                    {i + 1}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white/50 shrink-0">
                    {m.user_photo ? (
                      <img src={m.user_photo} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      (m.user_name || "?").charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm truncate">{m.user_name}</span>
                      <span className="text-[10px]" style={{ color: roleMeta.color }}>{roleMeta.icon}</span>
                    </div>
                    <p className="text-white/30 text-xs truncate">
                      {m.user_role}{m.user_company ? ` · ${m.user_company}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-amber-400 font-bold text-sm">{m.reputation || 0}</p>
                    <p className="text-[10px] text-white/30">{m.posts_count || 0} posts</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}