import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Outlet, Link, NavLink } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ROLE_META, getOnlineCount, canModerate } from "@/hooks/useCommunityMemberships";
import {
  Loader2, ArrowLeft, Search, Home, MessageSquare, Megaphone,
  Users, Calendar, BookOpen, BarChart2, Trophy, Shield, Plus, Circle,
} from "lucide-react";

const NAV_ITEMS = [
  { path: "", label: "Home", icon: Home, end: true },
  { path: "discussions", label: "Discussions", icon: MessageSquare },
  { path: "announcements", label: "Announcements", icon: Megaphone },
  { path: "members", label: "Members", icon: Users },
  { path: "events", label: "Events", icon: Calendar },
  { path: "resources", label: "Resources", icon: BookOpen },
  { path: "polls", label: "Polls", icon: BarChart2 },
  { path: "leaderboard", label: "Leaderboard", icon: Trophy },
];

const MODERATION_ITEM = { path: "moderation", label: "Moderation", icon: Shield };

export default function CommunityWorkspace() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!communityId) return;
      try {
        const c = await base44.entities.NetworkCircle.get(communityId);
        setCommunity(c);
        if (user?.id) {
          const mems = await base44.entities.CommunityMembership.filter({
            user_id: user.id,
            community_id: communityId,
            status: "active",
          });
          setMembership(mems[0] || null);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [communityId, user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="text-center py-16">
        <p className="text-white/30 text-sm">Community not found.</p>
        <Link to="/network/circles" className="mt-3 inline-block text-indigo-400 text-sm hover:text-indigo-300">
          ← Back to Communities
        </Link>
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
          style={{ backgroundColor: `${community.color || "#6366f1"}15`, color: community.color || "#6366f1" }}
        >
          {community.icon || "🎯"}
        </div>
        <h2 className="text-white font-semibold text-lg mb-2">{community.name}</h2>
        <p className="text-white/40 text-sm mb-5">{community.description}</p>
        <Link
          to="/network/circles"
          className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          <ArrowLeft size={14} /> Back to Join
        </Link>
      </div>
    );
  }

  const userCanModerate = canModerate(membership.member_role);
  const onlineCount = getOnlineCount(community.member_count);
  const roleMeta = ROLE_META[membership.member_role] || ROLE_META.member;
  const navItems = userCanModerate ? [...NAV_ITEMS, MODERATION_ITEM] : NAV_ITEMS;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/network/c/${communityId}/discussions?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex gap-6">
      <aside className="hidden lg:block w-60 shrink-0">
        <div className="sticky top-20">
          <Link to="/network/circles" className="flex items-center gap-2 text-white/30 text-xs hover:text-white/60 mb-3 transition-colors">
            <ArrowLeft size={12} /> All Communities
          </Link>

          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{ backgroundColor: `${community.color || "#6366f1"}15`, color: community.color || "#6366f1" }}
            >
              {community.icon || "🎯"}
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-semibold text-sm truncate">{community.name}</h2>
              <div className="flex items-center gap-1.5 text-xs text-white/30">
                <Circle size={6} className="fill-emerald-400 text-emerald-400" />
                {onlineCount.toLocaleString()} online
              </div>
            </div>
          </div>

          <form onSubmit={handleSearch} className="mb-3 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search community..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
          </form>

          <nav className="space-y-0.5 mb-4">
            {navItems.map((item) => {
              const to = `/network/c/${communityId}${item.path ? "/" + item.path : ""}`;
              return (
                <NavLink
                  key={item.path}
                  to={to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? "bg-indigo-500/10 text-indigo-400"
                        : "text-white/40 hover:text-white/80 hover:bg-white/5"
                    }`
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <Link
            to={`/network/c/${communityId}/discussions?create=1`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 text-sm font-medium hover:bg-indigo-500/20 transition-colors"
          >
            <Plus size={16} /> Create Post
          </Link>

          <div className="mt-4 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2 text-xs">
              <span>{roleMeta.icon}</span>
              <span className="text-white/40">Your role:</span>
              <span className="font-medium" style={{ color: roleMeta.color }}>{roleMeta.label}</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="lg:hidden mb-4 overflow-x-auto -mx-4 px-4 pb-2 scrollbar-none">
          <div className="flex gap-1">
            {navItems.map((item) => {
              const to = `/network/c/${communityId}${item.path ? "/" + item.path : ""}`;
              return (
                <NavLink
                  key={item.path}
                  to={to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                      isActive ? "bg-indigo-500/10 text-indigo-400" : "text-white/40 bg-white/[0.02]"
                    }`
                  }
                >
                  <item.icon size={13} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>

        <Outlet context={{ community, membership, canModerate: userCanModerate, onlineCount }} />
      </div>
    </div>
  );
}