import React from "react";
import { Link } from "react-router-dom";
import {
  UserCircle, Briefcase, Target, FileText, Building2,
  GraduationCap, Award, Sparkles, Link2, Shield, Settings as SettingsIcon, Database, Globe, Crown
} from "lucide-react";

const SECTIONS = [
  { group: "Identity", items: [
    { id: "personal", label: "Personal Info", icon: UserCircle },
    { id: "executive", label: "Executive Profile", icon: Briefcase },
    { id: "target", label: "Target Career", icon: Target },
  ]},
  { group: "Professional", items: [
    { id: "resume", label: "Resume", icon: FileText },
    { id: "experience", label: "Experience", icon: Building2 },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "certifications", label: "Certifications", icon: Award },
    { id: "skills", label: "Skills", icon: Sparkles },
  ]},
  { group: "Settings", items: [
    { id: "social", label: "Social Links", icon: Link2 },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "public", label: "Public Profile", icon: Globe },
    { id: "account", label: "Account", icon: SettingsIcon },
    { id: "data", label: "Data Management", icon: Database },
  ]},
];

export default function ProfileSidebar({ active, onSelect }) {
  return (
    <>
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <nav className="space-y-6 sticky top-20">
          {SECTIONS.map(group => (
            <div key={group.group}>
              <div className="px-3 text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-2">{group.group}</div>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <button key={item.id} onClick={() => onSelect(item.id)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${active === item.id ? "bg-indigo-500/10 text-indigo-400" : "text-white/40 hover:text-white/80 hover:bg-white/5"}`}>
                    <item.icon size={16} className={active === item.id ? "text-indigo-400" : "text-white/30"} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <Link to="/founder" className="mt-4 flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/15 transition-all border border-amber-500/15">
          <Crown size={16} /> ⭐ Founding Member
        </Link>
      </aside>
      <div className="lg:hidden mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {SECTIONS.flatMap(g => g.items).map(item => (
            <button key={item.id} onClick={() => onSelect(item.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${active === item.id ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40"}`}>
              <item.icon size={14} />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}