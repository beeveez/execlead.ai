import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Crown, Briefcase, Award, Mail, Globe, Code, ExternalLink, BadgeCheck, TrendingUp, Brain, Target } from "lucide-react";
import { computeExecutiveScore, getLeadershipLevel } from "@/lib/socialShare";
import Logo from "@/components/layout/Logo";

function parseJson(json, fallback) {
  try { return JSON.parse(json) || fallback; } catch { return fallback; }
}

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const results = await base44.entities.UserProfile.filter({ public_username: username, public_profile_enabled: true });
        if (results && results.length > 0) {
          setProfile(results[0]);
        } else {
          setNotFound(true);
        }
      } catch (e) {
        setNotFound(true);
      }
      setLoading(false);
    };
    load();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080d] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-[#08080d] text-white flex items-center justify-center p-4">
        <div className="text-center">
          <Crown size={32} className="mx-auto text-white/20 mb-3" />
          <h1 className="text-xl font-bold text-white mb-2">Profile Not Found</h1>
          <p className="text-white/40 text-sm mb-6">This executive profile is not available or has not been made public.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
            Visit EXECLEAD.AI <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const execScore = computeExecutiveScore(profile);
  const level = getLeadershipLevel(execScore);
  const skills = profile.skills || [];
  const experience = parseJson(profile.experience_json, []);
  const education = parseJson(profile.education_json, []);
  const certifications = parseJson(profile.certifications_json, []);
  const metrics = [
    { label: "Promotion Readiness", value: profile.promotion_readiness || 0, suffix: "%", icon: TrendingUp, color: "#06b6d4" },
    { label: "Leadership DNA", value: profile.leadership_maturity || 0, suffix: "%", icon: Brain, color: "#a855f7" },
    { label: "Executive Score", value: execScore, suffix: "/100", icon: Crown, color: "#6366f1" },
    { label: "Leadership Level", value: level, icon: Award, color: "#f59e0b" },
  ];

  return (
    <div className="min-h-screen bg-[#08080d] text-white">
      <nav className="border-b border-white/5 sticky top-0 z-40 bg-[#08080d]/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/"><Logo aiTagClass="ml-1" /></Link>
          <Link to="/register" className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Start Your Journey
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/10 rounded-2xl p-6">
          <div className="flex items-start gap-5 flex-wrap">
            <div className="relative">
              {profile.profile_photo ? (
                <img src={profile.profile_photo} alt={profile.full_name} className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500/30" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/10 flex items-center justify-center text-3xl font-bold border-2 border-indigo-500/30">
                  {(profile.full_name || "?").charAt(0)}
                </div>
              )}
              {profile.verified_executive && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#08080d] flex items-center justify-center border-2 border-emerald-500/30">
                  <BadgeCheck size={14} className="text-emerald-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white">{profile.full_name}</h1>
              <p className="text-white/50 text-sm mt-0.5">{profile.professional_headline || profile.current_role}</p>
              {profile.current_company && <p className="text-white/30 text-sm">{profile.current_company}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{level}</span>
                {profile.target_role && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/40 border border-white/10">
                    <Target size={9} /> {profile.target_role}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map((m, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <m.icon size={16} style={{ color: m.color }} />
              {typeof m.value === "number" ? (
                <div className="flex items-baseline gap-0.5 mt-2">
                  <span className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</span>
                  <span className="text-xs text-white/30">{m.suffix}</span>
                </div>
              ) : (
                <div className="text-sm font-semibold mt-2" style={{ color: m.color }}>{m.value}</div>
              )}
              <div className="text-white/30 text-xs mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>

        {profile.bio && (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-2">Biography</h2>
            <p className="text-sm text-white/70 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {skills.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, i) => <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{s}</span>)}
            </div>
          </div>
        )}

        {experience.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Career Timeline</h2>
            <div className="space-y-4">
              {experience.map((exp, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-1 bg-indigo-500/20 rounded-full shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-white/80">{exp.title || exp.role}</div>
                    <div className="text-xs text-white/40">{exp.company}</div>
                    {exp.description && <p className="text-xs text-white/50 mt-1">{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {education.length > 0 && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Education</h2>
              <div className="space-y-3">
                {education.map((edu, i) => (
                  <div key={i}>
                    <div className="text-sm text-white/80 font-medium">{edu.degree}</div>
                    <div className="text-xs text-white/40">{edu.institution || edu.school}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {certifications.length > 0 && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Certifications</h2>
              <div className="space-y-2">
                {certifications.map((cert, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Award size={12} className="text-amber-400 shrink-0" />
                    <span className="text-sm text-white/70">{typeof cert === "string" ? cert : cert.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Connect</h2>
          <div className="flex flex-wrap gap-3">
            {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors"><Briefcase size={14} /> LinkedIn</a>}
            {profile.github_url && <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors"><Code size={14} /> GitHub</a>}
            {profile.website_url && <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors"><Globe size={14} /> Website</a>}
            {profile.portfolio_url && <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors"><ExternalLink size={14} /> Portfolio</a>}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-xl p-6 text-center">
          <h3 className="text-white font-semibold">Advance your executive career with EXECLEAD.AI</h3>
          <p className="text-white/40 text-sm mt-1">Join thousands of leaders transforming into the executives their organizations need.</p>
          <Link to="/register" className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
            Start Free <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}