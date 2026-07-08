import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Home, Users, MessageCircle, Target, GraduationCap,
  Calendar, Crown, Briefcase, Link2, Star,
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/network", label: "Home Feed", icon: Home, exact: true },
  { path: "/network/directory", label: "Directory", icon: Users },
  { path: "/network/discussions", label: "Discussions", icon: MessageCircle },
  { path: "/network/circles", label: "Circles", icon: Target },
  { path: "/network/mentorship", label: "Mentorship", icon: GraduationCap },
  { path: "/network/events", label: "Events", icon: Calendar },
  { path: "/network/founding-lounge", label: "Founding Lounge", icon: Crown },
  { path: "/network/careers", label: "Careers", icon: Briefcase },
  { path: "/network/partnerships", label: "Partnerships", icon: Link2 },
];

export default function NetworkLayout() {
  const location = useLocation();

  const isActive = (item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  return (
    <div className="flex gap-6">
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-20">
          <div className="px-3 py-2 mb-2 flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest">
            <Star size={12} className="text-indigo-400" />
            Executive Network
          </div>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                    active
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "text-white/40 hover:text-white/80 hover:bg-white/5"
                  }`}
                >
                  <item.icon size={16} className={active ? "text-indigo-400" : "text-white/30"} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="lg:hidden mb-4 overflow-x-auto -mx-4 px-4 pb-2 scrollbar-none">
          <div className="flex gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                    active ? "bg-indigo-500/10 text-indigo-400" : "text-white/40 bg-white/[0.02]"
                  }`}
                >
                  <item.icon size={13} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}