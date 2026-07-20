import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { getScopedNotifications, markNotificationRead } from "@/lib/notifications";
import { WORKSPACE_CATEGORIES, SEVERITY_STYLES, WORKSPACE_META, getCategoryMeta } from "@/lib/notificationCategories";
import { Bell, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Notifications() {
  const { user } = useAuth();
  const { activeWorkspace, availableWorkspaces, setActiveWorkspace } = useWorkspace();
  const [notifications, setNotifications] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async (workspace) => {
    try {
      let result = await getScopedNotifications(workspace);
      // Seed initial notifications for this workspace if it has none
      if (result.notifications.length === 0) {
        await seedInitialNotifications(user, workspace);
        result = await getScopedNotifications(workspace);
      }
      setNotifications(result.notifications);
      setUnreadCounts(result.unreadCounts);
    } catch (e) {}
    setLoading(false);
  }, [user?.id, availableWorkspaces]);

  useEffect(() => {
    if (!user?.id || !activeWorkspace) { setLoading(false); return; }
    setLoading(true);
    setCategoryFilter("all");
    loadNotifications(activeWorkspace);
  }, [user?.id, activeWorkspace]);

  const markRead = async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCounts((prev) => ({ ...prev, [activeWorkspace]: Math.max(0, (prev[activeWorkspace] || 0) - 1) }));
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const n of unread) await markNotificationRead(n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCounts((prev) => ({ ...prev, [activeWorkspace]: 0 }));
  };

  const handleWorkspaceSwitch = (ws) => {
    if (ws === activeWorkspace) return;
    setActiveWorkspace(ws);
  };

  const categories = activeWorkspace ? WORKSPACE_CATEGORIES[activeWorkspace] || [] : [];
  const filtered = categoryFilter === "all" ? notifications : notifications.filter((n) => n.category === categoryFilter);
  const activeUnread = unreadCounts[activeWorkspace] || 0;
  const wsMeta = activeWorkspace ? WORKSPACE_META[activeWorkspace] : null;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <Bell size={12} className="text-indigo-400" /> Notification Center
          </div>
          <h1 className="text-2xl font-bold text-white">
            {activeUnread} unread {wsMeta && <span className="text-white/30 text-base font-normal">in {wsMeta.label}</span>}
          </h1>
        </div>
        {activeUnread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/50 hover:text-white/80 transition-colors">
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Workspace Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {availableWorkspaces.map((ws) => {
          const meta = WORKSPACE_META[ws];
          const count = unreadCounts[ws] || 0;
          const isActive = ws === activeWorkspace;
          return (
            <button
              key={ws}
              onClick={() => handleWorkspaceSwitch(ws)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-white/10 text-white border-white/10"
                  : "bg-white/[0.02] text-white/40 border-transparent hover:text-white/70"
              }`}
              style={isActive ? { borderColor: meta?.color + "40" } : {}}
            >
              <span>{meta?.icon}</span>
              <span>{meta?.label}</span>
              {count > 0 && (
                <span
                  className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] flex items-center justify-center font-bold text-white"
                  style={{ backgroundColor: meta?.color }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              categoryFilter === "all" ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40 hover:text-white/70"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat.value ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40 hover:text-white/70"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Notification List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
            <Bell size={24} className="mx-auto text-white/20 mb-2" />
            <p className="text-white/30 text-sm">No notifications in {wsMeta?.label}</p>
            <p className="text-white/20 text-xs mt-1">Switch workspaces to see other notifications</p>
          </div>
        ) : (
          filtered.map((n, i) => {
            const sev = SEVERITY_STYLES[n.severity] || SEVERITY_STYLES.info;
            const catMeta = n.category ? getCategoryMeta(activeWorkspace, n.category) : null;
            return (
              <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link
                  to={n.action_url || "#"}
                  onClick={() => !n.read && markRead(n.id)}
                  aria-label={`${n.title}: ${n.message}`}
                  className={`block bg-white/[0.02] border border-white/5 rounded-xl border-l-2 transition-all duration-200 hover:bg-white/[0.04] hover:border-white/15 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${n.read ? "" : sev.border + " " + sev.bg.replace("/10", "/[0.03]")}`}
                >
                  <div className="flex items-start gap-3 px-4 py-3">
                    <span className="text-xl flex-shrink-0">{n.icon || catMeta?.icon || "🔔"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-white/80">{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />}
                        {catMeta && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-white/40 rounded-full">{catMeta.label}</span>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${sev.bg} ${sev.text}`}>{sev.label}</span>
                      </div>
                      <p className="text-xs text-white/40 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-white/20 mt-1">{new Date(n.created_date).toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ===================== SEEDING ===================== */
async function seedInitialNotifications(user, workspace) {
  const seeds = [];

  if (workspace === "executive") {
    seeds.push(
      { type: "system", category: "learning", title: "Welcome to EXECLEAD.AI", message: "Your executive leadership journey starts here. Complete your first challenge to earn XP!", icon: "🎉", severity: "info", action_url: "/dashboard", user_id: user.id, workspace: "executive", visibility: "private", read: false },
      { type: "daily_challenge", category: "learning", title: "Today's Challenge is Ready", message: "A new executive challenge awaits. Test your readiness!", icon: "⚔️", severity: "medium", action_url: "/challenge", user_id: user.id, workspace: "executive", visibility: "private", read: false },
      { type: "achievement", category: "achievements", title: "First Lesson Completed!", message: "You completed your first executive leadership lesson.", icon: "🏆", severity: "low", action_url: "/academy", user_id: user.id, workspace: "executive", visibility: "private", read: false },
      { type: "subscription", category: "wallet", title: "Wallet Credited", message: "$150.00 referral commission credited to your Executive Wallet.", icon: "💰", severity: "medium", action_url: "/wallet", user_id: user.id, workspace: "executive", visibility: "private", read: false },
      { type: "subscription", category: "referrals", title: "New Referral Conversion", message: "Your referral just converted to a paid subscription!", icon: "🎁", severity: "low", action_url: "/referrals", user_id: user.id, workspace: "executive", visibility: "private", read: false },
    );
  }
  if (workspace === "developer") {
    seeds.push(
      { type: "developer", category: "deployments", title: "Deployment Successful", message: "Production deployment v2.4.1 completed successfully.", icon: "🚀", severity: "low", action_url: "/developer/deployments", user_id: user.id, workspace: "developer", visibility: "private", read: false },
      { type: "developer", category: "system_health", title: "All Systems Operational", message: "All services are running normally. Uptime: 99.98%", icon: "✅", severity: "info", action_url: "/developer/system-health", user_id: user.id, workspace: "developer", visibility: "private", read: false },
      { type: "developer", category: "security_alerts", title: "Security Alert: Failed Login Attempts", message: "5 failed login attempts detected from IP 192.168.1.x in the last hour.", icon: "🛡️", severity: "high", action_url: "/developer/audit-logs", user_id: user.id, workspace: "developer", visibility: "private", read: false },
      { type: "developer", category: "audit_events", title: "API Key Generated", message: "A new API key was generated for your developer account.", icon: "📝", severity: "medium", action_url: "/developer/api-keys", user_id: user.id, workspace: "developer", visibility: "private", read: false },
    );
  }
  if (workspace === "enterprise") {
    seeds.push(
      { type: "enterprise", category: "team_invitations", title: "New Team Member Joined", message: "Sarah Chen has accepted your team invitation.", icon: "👥", severity: "info", action_url: "/organization/users", user_id: user.id, workspace: "enterprise", visibility: "private", read: false },
      { type: "enterprise", category: "organization_billing", title: "Invoice Generated", message: "Your monthly enterprise invoice for $2,400 is ready for review.", icon: "🏢", severity: "medium", action_url: "/organization/billing", user_id: user.id, workspace: "enterprise", visibility: "private", read: false },
    );
  }
  if (workspace === "platform") {
    seeds.push(
      { type: "platform", category: "user_management", title: "New User Registrations", message: "12 new users registered in the last 24 hours.", icon: "👥", severity: "info", action_url: "/admin", user_id: user.id, workspace: "platform", visibility: "private", read: false },
      { type: "platform", category: "revenue", title: "Daily Revenue Report", message: "Today's revenue: $4,250 from 18 transactions.", icon: "💰", severity: "low", action_url: "/billing-admin", user_id: user.id, workspace: "platform", visibility: "private", read: false },
    );
  }

  if (seeds.length > 0) {
    await base44.entities.Notification.bulkCreate(seeds);
  }
}