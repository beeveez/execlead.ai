import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Crown, Clock, Target } from "lucide-react";

/**
 * ProfileHeader — Executive Intelligence Profile™ header.
 * Displays photo, name, journey level, archetype, readiness, reputation, trust,
 * verification, career goal, organization, experience, last assessment, completion.
 */
export default function ProfileHeader({ profile, journey, readiness, trust, reputation }) {
  const level = journey?.level?.current;
  const completion = calcCompletion(profile);

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent border border-indigo-500/15 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row items-start gap-5">
        {/* Photo */}
        <div className="relative flex-shrink-0">
          {profile?.profile_photo ? (
            <img src={profile.profile_photo} alt="" className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/30" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-indigo-500/20 border-2 border-indigo-500/30 flex items-center justify-center text-2xl font-bold text-indigo-300">
              {(profile?.full_name || "E").charAt(0)}
            </div>
          )}
          {level && <span className="absolute -bottom-2 -right-2 text-2xl">{level.icon}</span>}
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-white">{profile?.full_name || "Executive"}</h1>
            {profile?.identity_verified && <ShieldCheck size={16} className="text-emerald-400" />}
            {profile?.founding_member && <Crown size={14} className="text-amber-400" />}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-white/40">
            <span className="font-medium text-indigo-400">{level?.title || "Seed"}</span>
            <span>·</span>
            <span>{profile?.current_company || "Independent"}</span>
            <span>·</span>
            <span>{profile?.years_experience || 0} yrs exp</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-white/50">
            <Target size={11} className="text-cyan-400" />
            <span>Target: <span className="text-white/70 font-medium">{profile?.target_role || "—"}</span> at {profile?.target_company || "—"}</span>
          </div>
        </div>

        {/* KPI strip */}
        <div className="flex gap-4 sm:flex-col sm:items-end">
          <KPI label="Readiness" value={`${readiness?.overallScore || 0}%`} color="text-indigo-400" />
          <KPI label="Reputation" value={reputation?.reputation_score || 0} color="text-amber-400" />
          <KPI label="Trust" value={trust?.totalScore || 0} color="text-emerald-400" />
        </div>
      </div>

      {/* Footer strip */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5 text-xs">
        <div className="flex items-center gap-4 text-white/40">
          <span className="flex items-center gap-1"><Clock size={11} /> {journey?.computedAt ? new Date(journey.computedAt).toLocaleDateString() : "—"}</span>
          <Link to="/executive-readiness" className="text-indigo-400 hover:text-indigo-300">View Readiness →</Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/30">Profile Completion</span>
          <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" style={{ width: `${completion}%` }} />
          </div>
          <span className="text-white/60 font-medium">{completion}%</span>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, color }) {
  return (
    <div className="text-center sm:text-right">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-white/30 text-[10px] uppercase tracking-wider">{label}</div>
    </div>
  );
}

function calcCompletion(p) {
  if (!p) return 0;
  const fields = ["full_name", "country", "target_role", "target_company", "industry", "bio", "skills", "resume_url", "profile_photo"];
  const filled = fields.filter((f) => p[f] && (Array.isArray(p[f]) ? p[f].length > 0 : true)).length;
  return Math.round((filled / fields.length) * 100);
}