import React from "react";
import { Link } from "react-router-dom";
import { KeyRound, Fingerprint, ShieldCheck, CreditCard, User, Activity, Clock } from "lucide-react";

const CATEGORY_ICONS = {
  authentication: KeyRound,
  identity: Fingerprint,
  security: ShieldCheck,
  billing: CreditCard,
  subscription: CreditCard,
  user_management: User,
};

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function RecentActivity({ activities, loading }) {
  if (loading) {
    return (
      <div>
        <div className="text-[11px] text-white/40 uppercase tracking-wider font-medium mb-3">Recent Account Activity</div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 rounded-lg bg-white/[0.02] border border-white/5 shimmer-bg" />
          ))}
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div>
        <div className="text-[11px] text-white/40 uppercase tracking-wider font-medium mb-3">Recent Account Activity</div>
        <div className="text-center py-8 text-white/30 text-sm border border-white/5 rounded-xl bg-white/[0.01]">
          <Activity size={20} className="mx-auto mb-2 text-white/20" />
          No recent activity to show.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Recent Account Activity</div>
        <Link to="/platform/activity" className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors">View All</Link>
      </div>
      <div className="space-y-1.5">
        {activities.map((act, i) => {
          const Icon = CATEGORY_ICONS[act.category] || Activity;
          return (
            <Link
              key={act.id || i}
              to="/security"
              className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                <Icon size={12} className="text-white/40 group-hover:text-indigo-400 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/70 truncate">{act.action || act.description || "Account activity"}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock size={9} className="text-white/20" />
                  <span className="text-[10px] text-white/30">{timeAgo(act.created_date)}</span>
                  {act.category && (
                    <span className="text-[10px] text-white/20">· {act.category.replace(/_/g, " ")}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}