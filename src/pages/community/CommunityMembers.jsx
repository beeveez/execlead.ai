import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ROLE_META } from "@/hooks/useCommunityMemberships";
import { Loader2, Search, Users, Circle } from "lucide-react";

export default function CommunityMembers() {
  const { community, onlineCount } = useOutletContext();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const all = await base44.entities.CommunityMembership.filter(
          { community_id: community.id, status: "active" }, "-joined_at", 200
        );
        setMembers(all);
      } catch {}
      setLoading(false);
    };
    load();
  }, [community.id]);

  const filtered = members.filter((m) => {
    if (roleFilter !== "all" && m.member_role !== roleFilter) return false;
    if (search && !m.user_name?.toLowerCase().includes(search.toLowerCase()) &&
        !m.user_company?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const roleCounts = members.reduce((acc, m) => {
    acc[m.member_role] = (acc[m.member_role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Users size={18} className="text-indigo-400" /> Members
        </h1>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-xs text-white/40">{members.length} total</span>
          <span className="flex items-center gap-1 text-xs text-white/40">
            <Circle size={6} className="fill-emerald-400 text-emerald-400" /> {onlineCount} online
          </span>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members by name or company..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
        >
          <option value="all">All Roles ({members.length})</option>
          {Object.entries(ROLE_META).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.label} ({roleCounts[key] || 0})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-indigo-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">No members found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((m) => {
            const roleMeta = ROLE_META[m.member_role] || ROLE_META.member;
            return (
              <div
                key={m.id}
                className="bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-sm font-bold text-indigo-400 overflow-hidden shrink-0">
                    {m.user_photo ? (
                      <img src={m.user_photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (m.user_name || "?").charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm truncate">{m.user_name}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${roleMeta.bg}`}
                        style={{ color: roleMeta.color }}
                      >
                        {roleMeta.icon} {roleMeta.label}
                      </span>
                    </div>
                    {m.user_role && (
                      <p className="text-white/40 text-xs truncate mt-0.5">
                        {m.user_role}{m.user_company ? ` · ${m.user_company}` : ""}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                      <span>Joined {new Date(m.joined_at).toLocaleDateString()}</span>
                      <span className="text-amber-400/60">⭐ {m.reputation || 0} rep</span>
                      {m.posts_count > 0 && <span>{m.posts_count} posts</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}