import React from "react";
import { Clock, AlertTriangle, CheckCircle2, CalendarClock } from "lucide-react";
import { calculateExpirationStatus } from "@/lib/verificationExpirationEngine";

const STATUS_ICONS = {
  not_applicable: Clock,
  active: CheckCircle2,
  upcoming_renewal_30: CalendarClock,
  upcoming_renewal_14: CalendarClock,
  upcoming_renewal_7: AlertTriangle,
  expired: AlertTriangle,
  grace_period: AlertTriangle,
  suspended: AlertTriangle,
  renewed: CheckCircle2,
  archived: Clock,
};

const STATUS_COLORS = {
  not_applicable: "text-white/40 bg-white/5 border-white/10",
  active: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  upcoming_renewal_30: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  upcoming_renewal_14: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  upcoming_renewal_7: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  expired: "text-red-400 bg-red-500/10 border-red-500/20",
  grace_period: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  suspended: "text-red-400 bg-red-500/10 border-red-500/20",
  renewed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  archived: "text-white/40 bg-white/5 border-white/10",
};

export default function VerificationExpirationStatus({ verification }) {
  if (!verification) return null;
  const expiration = calculateExpirationStatus(verification);
  const Icon = STATUS_ICONS[expiration.status] || Clock;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <CalendarClock size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white/80">Verification Expiration™</h3>
      </div>

      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${STATUS_COLORS[expiration.status]}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-white/80">{expiration.label}</div>
          <div className="text-[11px] text-white/40 mt-0.5">{expiration.desc}</div>
        </div>
        {expiration.daysRemaining !== null && expiration.daysRemaining >= 0 && (
          <div className="text-right">
            <div className="text-2xl font-bold text-white/80">{expiration.daysRemaining}</div>
            <div className="text-[9px] text-white/30 uppercase tracking-wider">Days Left</div>
          </div>
        )}
      </div>

      {verification.expiration_date && (
        <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-3">
          <div>
            <div className="text-[9px] text-white/30 uppercase tracking-wider">Expiration Date</div>
            <div className="text-xs text-white/60 mt-0.5">{new Date(verification.expiration_date).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-[9px] text-white/30 uppercase tracking-wider">Renewal Date</div>
            <div className="text-xs text-white/60 mt-0.5">
              {verification.renewal_date ? new Date(verification.renewal_date).toLocaleDateString() : "—"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}