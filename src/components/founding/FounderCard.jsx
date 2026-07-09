import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Trophy, Globe, Building2, Linkedin, Calendar, Crown, Award, Sparkles } from "lucide-react";

const PLAN_LABELS = { professional: "Professional", executive: "Executive", founding_member: "Founding Member", enterprise: "Enterprise" };
const STATUS_STYLES = {
  reserved: "bg-blue-500/10 text-blue-400",
  approved: "bg-amber-500/10 text-amber-400",
  invited: "bg-purple-500/10 text-purple-400",
  activated: "bg-emerald-500/10 text-emerald-400",
};
const ACHIEVEMENT_LABELS = {
  first_10: { label: "First 10", icon: Crown, color: "text-amber-400" },
  first_50: { label: "First 50", icon: Crown, color: "text-amber-400" },
  first_100: { label: "First 100", icon: Crown, color: "text-amber-400" },
  first_500: { label: "First 500", icon: Award, color: "text-indigo-400" },
  original_beta_tester: { label: "Beta Tester", icon: Sparkles, color: "text-purple-400" },
  product_advisor: { label: "Advisor", icon: Award, color: "text-cyan-400" },
  community_champion: { label: "Champion", icon: Trophy, color: "text-emerald-400" },
  top_referrer: { label: "Top Referrer", icon: Award, color: "text-pink-400" },
};

function countryFlag(code) {
  if (!code || code.length !== 2) return "🌍";
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
}

function countryName(code, countries) {
  if (!code) return "—";
  return countries?.find((c) => c.code === code)?.name || code;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function yearsSince(dateStr) {
  if (!dateStr) return 0;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)));
}

export default function FounderCard({ founder, countries, featured }) {
  const isPublic = founder.display_preference === "public";
  const isAnonymous = founder.display_preference === "anonymous";
  const achievements = founder.founder_achievements || [];
  const years = yearsSince(founder.reservation_date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative bg-gradient-to-br from-amber-500/[0.03] to-transparent border rounded-xl p-5 transition-all hover:border-amber-500/30 group ${
        featured || founder.featured ? "border-amber-500/30 gold-glow" : "border-amber-500/10"
      }`}
    >
      {/* Featured star */}
      {founder.featured && (
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
          <Crown size={12} className="text-amber-400" />
        </div>
      )}

      {/* Header: badge + number + status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Trophy size={16} className="text-amber-400" />
          </div>
          <div>
            <p className="text-amber-400/60 text-[10px] uppercase tracking-wider">Founder</p>
            <p className="text-amber-400 font-mono text-sm font-bold">{founder.founding_member_number}</p>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium capitalize ${STATUS_STYLES[founder.status] || "bg-white/5 text-white/40"}`}>
          {founder.activated ? "Activated" : founder.status}
        </span>
      </div>

      {/* Photo + Name */}
      <div className="flex items-center gap-3 mb-3">
        {isPublic && founder.photo ? (
          <img src={founder.photo} alt={founder.full_name} className="w-12 h-12 rounded-full object-cover border border-amber-500/20" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg">
            {isAnonymous ? "🕶️" : (founder.full_name?.charAt(0) || "F")}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-white font-semibold text-sm truncate">{founder.full_name || "Anonymous Founder"}</h3>
          {isPublic && founder.profession && (
            <p className="text-white/40 text-xs truncate">{founder.profession}</p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-xs mb-3">
        <div className="flex items-center gap-1.5 text-white/50">
          <span className="text-base">{countryFlag(founder.country)}</span>
          <span>{isPublic ? countryName(founder.country, countries) : founder.country || "—"}</span>
        </div>
        {isPublic && founder.company && (
          <div className="flex items-center gap-1.5 text-white/40">
            <Building2 size={11} /> <span className="truncate">{founder.company}</span>
          </div>
        )}
        {isPublic && founder.executive_score > 0 && (
          <div className="flex items-center gap-1.5 text-white/40">
            <Trophy size={11} /> Executive Score: <span className="text-amber-400 font-medium">{founder.executive_score}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-white/30">
          <Calendar size={11} /> Joined {formatDate(founder.reservation_date)}
          {years > 0 && <span className="text-amber-400/50">· {years} yr{years !== 1 ? "s" : ""}</span>}
        </div>
      </div>

      {/* Plan badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/50 text-[10px] font-medium">
          {PLAN_LABELS[founder.preferred_plan] || founder.preferred_plan}
        </span>
        {founder.activated && (
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-medium">
            Lifetime Founder
          </span>
        )}
      </div>

      {/* Achievement badges */}
      {achievements.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {achievements.slice(0, 4).map((a) => {
            const ach = ACHIEVEMENT_LABELS[a];
            if (!ach) return null;
            const Icon = ach.icon;
            return (
              <span key={a} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-medium ${ach.color}`}>
                <Icon size={9} /> {ach.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Story preview */}
      {isPublic && founder.founder_story && (
        <p className="text-white/40 text-xs italic line-clamp-2 mb-3 border-l-2 border-amber-500/20 pl-2">
          "{founder.founder_story}"
        </p>
      )}

      {/* LinkedIn */}
      {isPublic && founder.linkedin && (
        <a href={founder.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs transition-colors">
          <Linkedin size={12} /> Connect
        </a>
      )}
    </motion.div>
  );
}