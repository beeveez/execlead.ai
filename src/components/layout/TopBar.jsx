import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { PLANS, getPlan } from "@/lib/plans";
import { Bell, CreditCard } from "lucide-react";

export default function TopBar() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const profiles = await base44.entities.UserProfile.list();
        if (profiles.length > 0) setProfile(profiles[0]);
        const notifs = await base44.entities.Notification.list("-created_date", 10);
        setNotifications(notifs);
        setUnread(notifs.filter(n => !n.read).length);
      } catch (e) {}
    };
    load();
  }, []);

  const markAllRead = async () => {
    const unreadNotifs = notifications.filter(n => !n.read);
    for (const n of unreadNotifs) {
      await base44.entities.Notification.update(n.id, { read: true });
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  const plan = getPlan(profile);

  return (
    <div className="hidden lg:flex items-center justify-end gap-3 px-8 py-2.5 border-b border-white/5">
      <Link to="/billing" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
        <CreditCard size={14} className="text-white/40" />
        <span className="text-xs font-medium" style={{ color: plan.color }}>{plan.name}</span>
      </Link>
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