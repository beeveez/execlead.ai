import React, { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { ROLE_META, getOnlineCount } from "@/hooks/useCommunityMemberships";
import PostCard from "@/components/network/PostCard";
import { Loader2, Users, Circle, MessageSquare, Calendar, Trophy, ArrowRight, Megaphone } from "lucide-react";

export default function CommunityHome() {
  const { community, membership, onlineCount } = useOutletContext();
  const { user } = useAuth();
  const { profile } = useSubscription();
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [topMembers, setTopMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [recentPosts, upcomingEvents, members] = await Promise.all([
          base44.entities.NetworkPost.filter({ community_id: community.id }, "-created_date", 5),
          base44.entities.NetworkEvent.filter({ community_id: community.id }, "start_date", 5),
          base44.entities.CommunityMembership.filter(
            { community_id: community.id, status: "active" }, "-reputation", 5
          ),
        ]);
        setPosts(recentPosts);
        setEvents(upcomingEvents.filter((e) => new Date(e.start_date) >= new Date(Date.now() - 86400000)));
        setTopMembers(members);
      } catch {}
      setLoading(false);
    };
    load();
  }, [community.id]);

  const announcements = posts.filter((p) => p.post_type === "announcement");
  const discussions = posts.filter((p) => p.post_type !== "announcement");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Community Banner */}
      <div
        className="rounded-2xl p-6 border"
        style={{
          background: `linear-gradient(135deg, ${community.color || "#6366f1"}10, transparent)`,
          borderColor: `${community.color || "#6366f1"}20`,
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: `${community.color || "#6366f1"}15`, color: community.color || "#6366f1" }}
          >
            {community.icon || "🎯"}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white">{community.name}</h1>
            <p className="text-white/50 text-sm mt-1 leading-relaxed">{community.description}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <Users size={13} /> {(community.member_count || 0).toLocaleString()} Members
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <Circle size={6} className="fill-emerald-400 text-emerald-400" /> {onlineCount.toLocaleString()} Online
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <MessageSquare size={13} /> {posts.length} Posts
              </div>
            </div>
          </div>
        </div>
        {community.rules && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-white/30 mb-1">Community Rules</p>
            <p className="text-xs text-white/50 leading-relaxed">{community.rules}</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-indigo-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Announcements */}
            {announcements.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Megaphone size={14} className="text-amber-400" /> Announcements
                  </h2>
                  <Link to="announcements" className="text-xs text-indigo-400 hover:text-indigo-300">
                    View all
                  </Link>
                </div>
                <div className="space-y-3">
                  {announcements.slice(0, 2).map((p) => (
                    <PostCard key={p.id} post={p} currentUserId={user?.id} authorName={profile?.full_name} />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Discussions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <MessageSquare size={14} className="text-indigo-400" /> Recent Discussions
                </h2>
                <Link to="discussions" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  View all <ArrowRight size={10} />
                </Link>
              </div>
              {discussions.length === 0 ? (
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-8 text-center">
                  <p className="text-white/30 text-sm">No discussions yet. Be the first to start a conversation!</p>
                  <Link
                    to="discussions?create=1"
                    className="mt-3 inline-flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <MessageSquare size={12} /> Start a Discussion
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {discussions.slice(0, 3).map((p) => (
                    <PostCard key={p.id} post={p} currentUserId={user?.id} authorName={profile?.full_name} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Calendar size={14} className="text-cyan-400" /> Upcoming
                </h3>
                <Link to="events" className="text-xs text-indigo-400 hover:text-indigo-300">View all</Link>
              </div>
              {events.length === 0 ? (
                <p className="text-white/30 text-xs py-3">No upcoming events.</p>
              ) : (
                <div className="space-y-2">
                  {events.slice(0, 3).map((e) => (
                    <div key={e.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] text-cyan-400 font-bold uppercase">
                          {new Date(e.start_date).toLocaleDateString("en", { month: "short" })}
                        </span>
                        <span className="text-xs text-white font-bold">
                          {new Date(e.start_date).getDate()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-white/70 font-medium truncate">{e.title}</p>
                        <p className="text-[10px] text-white/30">{e.event_type.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Members */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Trophy size={14} className="text-amber-400" /> Top Members
                </h3>
                <Link to="leaderboard" className="text-xs text-indigo-400 hover:text-indigo-300">View all</Link>
              </div>
              <div className="space-y-2">
                {topMembers.map((m, i) => {
                  const roleMeta = ROLE_META[m.member_role] || ROLE_META.member;
                  return (
                    <div key={m.id} className="flex items-center gap-2">
                      <span className={`text-xs font-bold w-5 ${i === 0 ? "text-amber-400" : "text-white/30"}`}>
                        #{i + 1}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white/50 shrink-0">
                        {(m.user_name || "?").charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/70 truncate">{m.user_name}</p>
                        <p className="text-[10px]" style={{ color: roleMeta.color }}>{roleMeta.label}</p>
                      </div>
                      <span className="text-xs text-amber-400 font-medium">{m.reputation || 0}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-semibold text-white mb-2">Quick Actions</h3>
              <Link to="discussions?create=1" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/60 hover:text-white transition-colors">
                <MessageSquare size={14} /> New Discussion
              </Link>
              <Link to="members" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/60 hover:text-white transition-colors">
                <Users size={14} /> Browse Members
              </Link>
              <Link to="events" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/60 hover:text-white transition-colors">
                <Calendar size={14} /> View Events
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}