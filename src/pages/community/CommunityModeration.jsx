import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ROLE_META } from "@/hooks/useCommunityMemberships";
import { Loader2, Shield, Users, MessageSquare, Pin, Trash2, Ban, CheckCircle } from "lucide-react";

export default function CommunityModeration() {
  const { community, canModerate } = useOutletContext();
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("members");

  const load = async () => {
    setLoading(true);
    try {
      const [allMembers, allPosts] = await Promise.all([
        base44.entities.CommunityMembership.filter(
          { community_id: community.id }, "-joined_at", 200
        ),
        base44.entities.NetworkPost.filter(
          { community_id: community.id }, "-created_date", 50
        ),
      ]);
      setMembers(allMembers);
      setPosts(allPosts);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [community.id]);

  const toggleMemberStatus = async (member) => {
    const newStatus = member.status === "active" ? "suspended" : "active";
    try {
      await base44.entities.CommunityMembership.update(member.id, { status: newStatus });
      setMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, status: newStatus } : m));
    } catch {}
  };

  const updateMemberRole = async (member, newRole) => {
    try {
      await base44.entities.CommunityMembership.update(member.id, { member_role: newRole });
      setMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, member_role: newRole } : m));
    } catch {}
  };

  const togglePin = async (post) => {
    try {
      await base44.entities.NetworkPost.update(post.id, { pinned: !post.pinned });
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, pinned: !p.pinned } : p));
    } catch {}
  };

  const deletePost = async (post) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await base44.entities.NetworkPost.delete(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch {}
  };

  if (!canModerate) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <Shield size={32} className="mx-auto text-white/10 mb-3" />
        <p className="text-white/30 text-sm">You don't have moderation permissions in this community.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield size={18} className="text-red-400" /> Moderation
        </h1>
        <p className="text-white/40 text-sm mt-1">Manage members and content in {community.name}.</p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setTab("members")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            tab === "members" ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"
          }`}
        >
          <Users size={13} /> Members ({members.length})
        </button>
        <button
          onClick={() => setTab("posts")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            tab === "posts" ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"
          }`}
        >
          <MessageSquare size={13} /> Posts ({posts.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-red-400" />
        </div>
      ) : tab === "members" ? (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl divide-y divide-white/5">
          {members.map((m) => {
            const roleMeta = ROLE_META[m.member_role] || ROLE_META.member;
            const isSuspended = m.status === "suspended";
            return (
              <div key={m.id} className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white/50 shrink-0">
                  {(m.user_name || "?").charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm truncate">{m.user_name}</span>
                    {isSuspended && <span className="text-[10px] text-red-400 font-medium">SUSPENDED</span>}
                  </div>
                  <p className="text-white/30 text-xs">Joined {new Date(m.joined_at).toLocaleDateString()}</p>
                </div>
                <select
                  value={m.member_role}
                  onChange={(e) => updateMemberRole(m, e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                >
                  {Object.entries(ROLE_META).map(([key, meta]) => (
                    <option key={key} value={key}>{meta.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => toggleMemberStatus(m)}
                  className={`p-2 rounded-lg transition-colors ${
                    isSuspended ? "text-emerald-400 hover:bg-emerald-500/10" : "text-red-400 hover:bg-red-500/10"
                  }`}
                  title={isSuspended ? "Reactivate" : "Suspend"}
                >
                  {isSuspended ? <CheckCircle size={14} /> : <Ban size={14} />}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">No posts to moderate.</p>
          ) : (
            posts.map((p) => (
              <div key={p.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-sm font-medium">{p.author_name}</span>
                      {p.pinned && <span className="text-[10px] text-amber-400">📌 Pinned</span>}
                      <span className="text-[10px] text-white/30 capitalize">{p.post_type}</span>
                    </div>
                    <p className="text-white/50 text-xs line-clamp-2">{p.content}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => togglePin(p)}
                      className={`p-2 rounded-lg transition-colors ${p.pinned ? "text-amber-400 bg-amber-500/10" : "text-white/30 hover:text-amber-400 hover:bg-amber-500/10"}`}
                      title={p.pinned ? "Unpin" : "Pin"}
                    >
                      <Pin size={14} />
                    </button>
                    <button
                      onClick={() => deletePost(p)}
                      className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}