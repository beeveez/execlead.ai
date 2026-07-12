import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke("getScopedNotifications", { action: "list", limit: 4 })
      .then((res) => {
        const data = res.data || res;
        setNotifications(data?.notifications || data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-indigo-400" />
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Notifications</h2>
        </div>
        <Link to="/notifications" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
          View All <ArrowRight size={10} />
        </Link>
      </div>
      {loading ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-white/30 text-sm">Loading...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 text-center">
          <Bell size={18} className="mx-auto text-white/10 mb-2" />
          <p className="text-white/30 text-sm">You're all caught up</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-2.5 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2.5">
              {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-white/70 text-sm truncate">{n.title || n.message}</p>
                {n.body && <p className="text-white/30 text-xs truncate">{n.body}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}