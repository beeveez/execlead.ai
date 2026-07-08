import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getScopedNotifications, createNotification, markNotificationRead } from "@/lib/notifications";
import { Bell, Check, Loader2, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const TYPE_FILTERS = ["all", "system", "daily_challenge", "achievement", "subscription", "learning_reminder", "enterprise", "platform", "developer"];

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) { setLoading(false); return; }
      try {
        let notifs = await getScopedNotifications();
        if (notifs.length === 0) {
          await base44.entities.Notification.bulkCreate([
            { type: "system", title: "Welcome to EXECLEAD.AI", message: "Your executive leadership journey starts here. Complete your first challenge to earn XP!", icon: "🎉", read: false, action_url: "/challenge", user_id: user.id, organization_id: "", workspace: "executive", visibility: "private", role_scope: "" },
            { type: "daily_challenge", title: "Today's Challenge is Ready", message: "A new executive challenge awaits. Test your readiness!", icon: "⚔️", read: false, action_url: "/challenge", user_id: user.id, organization_id: "", workspace: "executive", visibility: "private", role_scope: "" },
            { type: "learning_reminder", title: "Daily Lesson Available", message: "Continue your executive learning journey with today's lesson.", icon: "📚", read: false, action_url: "/academy", user_id: user.id, organization_id: "", workspace: "executive", visibility: "private", role_scope: "" },
          ]);
          notifs = await getScopedNotifications();
        }
        setNotifications(notifs);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const markRead = async (id) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) await markNotificationRead(n.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filtered = filter === "all" ? notifications : notifications.filter(n => n.type === filter);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Bell size={12} className="text-indigo-400" /> Notifications
          </div>
          <h1 className="text-2xl font-bold text-white">{notifications.filter(n => !n.read).length} unread</h1>
        </div>
        {notifications.some(n => !n.read) && (
          <button onClick={markAllRead} className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/50 hover:text-white/80 transition-colors">
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter size={14} className="text-white/20 flex-shrink-0" />
        {TYPE_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all capitalize ${filter === f ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40 hover:text-white/70"}`}>
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
            <Bell size={24} className="mx-auto text-white/20 mb-2" />
            <p className="text-white/30 text-sm">No notifications</p>
          </div>
        ) : (
          filtered.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link to={n.action_url || "#"} onClick={() => !n.read && markRead(n.id)} className={`block bg-white/[0.02] border rounded-xl px-4 py-3 transition-all hover:bg-white/[0.04] ${n.read ? "border-white/5" : "border-indigo-500/15 bg-indigo-500/[0.03]"}`}>
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{n.icon || "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white/80">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-white/20 mt-1">{new Date(n.created_date).toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}