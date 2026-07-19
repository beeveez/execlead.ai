import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { Mail, Phone, KeyRound, AlertTriangle, ChevronRight } from "lucide-react";
import RecoveryEmailDrawer from "./recovery/RecoveryEmailDrawer";
import RecoveryPhoneDrawer from "./recovery/RecoveryPhoneDrawer";
import BackupCodesDrawer from "./recovery/BackupCodesDrawer";
import DeleteAccountDialog from "@/components/account/DeleteAccountDialog";

const STATUS_STYLES = {
  verified: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  not_set: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  available: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  configured: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  disabled: "text-white/40 bg-white/5 border-white/10",
};

function RecoveryCard({ icon: Icon, label, desc, status, statusLabel, onClick }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`Manage ${label}`}
      className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5
                 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-lg hover:shadow-black/20
                 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]"
    >
      <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/10 transition-colors">
        <Icon size={18} className="text-white/40 group-hover:text-indigo-400 transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-medium text-white/80">{label}</h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_STYLES[status] || STATUS_STYLES.disabled}`}>
            {statusLabel}
          </span>
        </div>
        <p className="text-[11px] text-white/30 mt-0.5 truncate">{desc}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-white/0 group-hover:text-indigo-400/60 transition-all hidden sm:inline">Manage</span>
        <ChevronRight size={16} className="text-white/10 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  );
}

export default function RecoverySection() {
  const { user } = useAuth();
  const { profile, refreshProfile } = useSubscription();
  const [activeDrawer, setActiveDrawer] = useState(null);

  const emailVerified = user?.email_verified ?? true;
  const hasPhone = !!profile?.mobile_number;

  const recoveryItems = [
    {
      icon: Mail,
      label: "Recovery Email",
      desc: user?.email || "Not set",
      status: emailVerified ? "verified" : "not_set",
      statusLabel: emailVerified ? "Verified" : "Not Verified",
      onClick: () => setActiveDrawer("email"),
    },
    {
      icon: Phone,
      label: "Recovery Phone",
      desc: hasPhone ? profile.mobile_number : "No recovery phone configured",
      status: hasPhone ? "configured" : "not_set",
      statusLabel: hasPhone ? "Configured" : "Not Set",
      onClick: () => setActiveDrawer("phone"),
    },
    {
      icon: KeyRound,
      label: "Backup Codes",
      desc: "Single-use codes for account recovery",
      status: "available",
      statusLabel: "Available",
      onClick: () => setActiveDrawer("backup"),
    },
    {
      icon: AlertTriangle,
      label: "Account Deletion",
      desc: "Permanently delete your account and data",
      status: "available",
      statusLabel: "Available",
      onClick: () => setActiveDrawer("delete"),
    },
  ];

  return (
    <>
      <div className="space-y-3">
        <div className="text-[11px] text-white/40 uppercase tracking-wider font-medium px-1 mb-1">
          Recovery Options
        </div>
        {recoveryItems.map(item => (
          <RecoveryCard key={item.label} {...item} />
        ))}
      </div>

      {activeDrawer === "email" && (
        <RecoveryEmailDrawer user={user} onClose={() => setActiveDrawer(null)} />
      )}
      {activeDrawer === "phone" && (
        <RecoveryPhoneDrawer user={user} profile={profile} onUpdated={refreshProfile} onClose={() => setActiveDrawer(null)} />
      )}
      {activeDrawer === "backup" && (
        <BackupCodesDrawer onClose={() => setActiveDrawer(null)} />
      )}
      {activeDrawer === "delete" && (
        <DeleteAccountDialog onClose={() => setActiveDrawer(null)} />
      )}
    </>
  );
}