import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Target, Users, Lock, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const safeParse = (json, fallback) => {
  try { return JSON.parse(json) || fallback; } catch { return fallback; }
};

export default function NetworkCircles() {
  const { user } = useAuth();
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setCircles(await base44.entities.NetworkCircle.list("name", 100));
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const isMember = (circle) => {
    const members = safeParse(circle.members_json, []);
    return members.some((m) => m.id === user?.id);
  };

  const handleToggleJoin = async (circle) => {
    const members = safeParse(circle.members_json, []);
    const isJoined = members.some((m) => m.id === user?.id);
    const newMembers = isJoined
      ? members.filter((m) => m.id !== user?.id)
      : [...members, { id: user?.id, joined_at: new Date().toISOString() }];
    try {
      await base44.entities.NetworkCircle.update(circle.id, {
        members_json: JSON.stringify(newMembers),
        member_count: newMembers.length,
      });
      setCircles((prev) =>
        prev.map((c) =>
          c.id === circle.id
            ? { ...c, members_json: JSON.stringify(newMembers), member_count: newMembers.length }
            : c
        )
      );
      toast({
        title: isJoined ? "Left circle" : "Joined circle",
        description: `${circle.name}${isJoined ? " — you've left this circle." : " — you're now a member."}`,
      });
    } catch (e) {}
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
          <Target size={12} className="text-indigo-400" /> Executive Circles
        </div>
        <h1 className="text-xl font-bold text-white">Private Communities</h1>
        <p className="text-white/40 text-sm mt-1">
          Join role-based and industry-specific executive circles.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-indigo-400" />
        </div>
      ) : circles.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">No circles available yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {circles.map((circle) => {
            const joined = isMember(circle);
            return (
              <div
                key={circle.id}
                className="bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${circle.color || "#6366f1"}15`, color: circle.color || "#6366f1" }}
                  >
                    {circle.icon || "🎯"}
                  </div>
                  {circle.is_private && (
                    <Lock size={14} className="text-white/20" />
                  )}
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{circle.name}</h3>
                <p className="text-white/40 text-xs leading-relaxed mb-3 line-clamp-2">{circle.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-white/30">
                    <Users size={12} /> {circle.member_count || 0} members
                  </div>
                  <button
                    onClick={() => handleToggleJoin(circle)}
                    disabled={circle.join_type === "invite" && !joined}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      joined
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-indigo-500 hover:bg-indigo-600 text-white"
                    } disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    {joined ? <><Check size={12} /> Joined</> : <><Users size={12} /> Join</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}