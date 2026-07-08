import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { getScopedNotifications, markNotificationRead } from "@/lib/notifications";
import AccountMenu from "@/components/layout/AccountMenu";
import WorkspaceSwitcher from "@/components/layout/WorkspaceSwitcher";
import ShareButton from "@/components/social/ShareButton";
import { Bell, CreditCard, Crown } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function TopBar() {
  const { subscription, membership, loading } = useSubscription();
  const { activeWorkspace } = useWorkspace();
  const billingPath = activeWorkspace === "enterprise" ? "/organization/billing" : "/billing";
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!activeWorkspace) return;
      try {
        const { notifications: notifs, unreadCounts } = await getScopedNotifications(activeWorkspace);
        const recent = notifs.slice(0, 10);
        setNotifications(recent);
        setUnread(unreadCounts[activeWorkspace] || 0);
      } catch (e) {}
    };
    load();
  }, [activeWorkspace]);

  const markAllRead = async () => {
    const unreadNotifs = notifications.filter(n => !n.read);
    for (const n of unreadNotifs) {
      await markNotificationRead(n.id);
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  return (
    <div className="hidden lg:flex items-center justify-end gap-3 px-8 py-2.5 border-b border-white/5">
      <WorkspaceSwitcher />
      <Link to="/brand-center" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs text-white/60 hover:text-white/80">
        <Crown size={14} className="text-amber-400" /> Brand Center
      </Link>
      <ShareButton variant="icon" shareType="landing" iconSize={15} />
      <AccountMenu />
      {membership && (
        <Link to={membership.type === "founding_member" ? "/founder" : "/billing"} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors" style={{ background: `${membership.color}1a` }}>
          <span className="text-xs">{membership.icon}</span>
          <span className="text-xs font-medium" style={{ color: membership.color }}>{membership.name}</span>
        </Link>
      )}
      <Link to={billingPath} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
        <CreditCard size={14} className="text-white/40" />
        {loading ? (
          <span className="text-xs text-white/20">···</span>
        ) : activeWorkspace === "enterprise" ? (
          <span className="text-xs font-medium text-cyan-400">Enterprise</span>
        ) : (
          <span className="text-xs font-medium flex items-center gap-1">
            <span>{subscription.icon}</span>
            <span style={{ color: subscription.color }}>{subscription.planName}</span>
          </span>
        )}
      </Link>
      <ThemeToggle />
      <div className="relative">
        <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Bell size={16} className="text-white/40" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">{unread}</span>
          )}
        </button>
        {showNotifs && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#0d0d14] border border-white/10 rounded-xl shadow-2xl z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="text-sm font-medium text-white">Notifications</span>
                {unread > 0 && <button onClick={markAllRead} className="text-xs text-indigo-400 hover:text-indigo-300">Mark all read</button>}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-white/30 text-sm">No notifications yet</div>
                ) : (
                  notifications.map(n => (
                    <Link key={n.id} to={n.action_url || "/notifications"} onClick={() => setShowNotifs(false)} className={`block px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 ${!n.read ? "bg-indigo-500/5" : ""}`}>
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{n.icon || "🔔"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white/80">{n.title}</p>
                          <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              <Link to="/notifications" onClick={() => setShowNotifs(false)} className="block px-4 py-2.5 text-center text-xs text-indigo-400 hover:text-indigo-300 border-t border-white/5">
                View all notifications
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}