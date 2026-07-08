import React from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { useFoundingMember } from "@/hooks/useFoundingMember";
import {
  LayoutDashboard, Shield, Users, Calendar, Vote, UserPlus,
  Gift, Award, Activity, Settings as SettingsIcon, Crown, Loader2,
} from "lucide-react";

const SECTIONS = [
  { to: "/founder", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/founder/benefits", label: "Benefits", icon: Shield },
  { to: "/founder/community", label: "Community", icon: Users },
  { to: "/founder/events", label: "Events", icon: Calendar },
  { to: "/founder/roadmap", label: "Roadmap Voting", icon: Vote },
  { to: "/founder/referrals", label: "Referrals", icon: UserPlus },
  { to: "/founder/rewards", label: "Rewards", icon: Gift },
  { to: "/founder/certificates", label: "Certificates", icon: Award },
  { to: "/founder/timeline", label: "Timeline", icon: Activity },
  { to: "/founder/settings", label: "Settings", icon: SettingsIcon },
];

export default function FounderPortalLayout() {
  const { member, loading } = useFoundingMember();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
          <Crown size={28} className="text-amber-400" />
        </div>
        <h2 className="text-white font-semibold text-lg mb-2">Founder Portal</h2>
        <p className="text-white/40 text-sm leading-relaxed mb-6">
          The Founder Portal is a permanent entitlement for Founding Members. Become a Founding Member to unlock lifetime benefits, exclusive discounts, and permanent entitlements.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition-all">
          <Crown size={16} /> Become a Founding Member
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 text-amber-400/60 text-xs uppercase tracking-widest mb-4">
        <Crown size={12} /> Founder Portal
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-56 flex-shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible lg:sticky lg:top-20 pb-2 lg:pb-0">
            {SECTIONS.map((s) => (
              <NavLink
                key={s.to}
                to={s.to}
                end={s.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
                    isActive
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/15"
                      : "text-white/40 hover:text-white/80 hover:bg-white/5 border-transparent"
                  }`
                }
              >
                <s.icon size={16} /> {s.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}