import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { safeParse } from "@/components/profile/FormFields";
import { computeExecutiveScore, getLeadershipLevel, getPublicProfileUrl, getQrUrl } from "@/lib/socialShare";
import {
  Crown, Briefcase, Award, Globe, Code, ExternalLink, BadgeCheck,
  TrendingUp, Brain, Target, Lock, UserX, Download, QrCode, Eye,
} from "lucide-react";
import Logo from "@/components/layout/Logo";

function updateMetaTag(name, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(name.startsWith("og:") ? "property" : "name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [state, setState] = useState("loading");

  useEffect(() => {
    const load = async () => {
      try {
        const results = await base44.entities.UserProfile.filter({ public_username: username });
        if (results && results.length > 0) {
          const p = results[0];
          const isPublic = p.public_profile_enabled && (p.public_visibility || "public") === "public";
          if (isPublic) {
            setProfile(p);
            setState("published");
            document.title = `${p.full_name} — Executive Profile | EXECLEAD.AI`;
            updateMetaTag("og:title", `${p.full_name} — Executive Profile`);
            updateMetaTag("og:description", p.professional_headline || p.bio || "");
            updateMetaTag("og:type", "profile");
            if (p.profile_photo) updateMetaTag("og:image", p.profile_photo);
            if (!p.allow_search_indexing) updateMetaTag("robots", "noindex, nofollow");
          } else {
            // Owner can preview their own unpublished profile
            try {
              const me = await base44.auth.me();
              if (me && me.id === p.created_by_id) {
                setProfile(p);
                setState("draft_preview");
              } else {
                setState("private");
              }
            } catch {
              setState("private");
            }
          }
        } else {
          setState("not_found");
        }
      } catch (e) {
        setState("not_found");
      }
    };
    load();
  }, [username]);

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-[#08080d] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (state === "not_found") {
    return (
      <div className="min-h-screen bg-[#08080d] text-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <UserX size={28} className="text-white/30" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">This Profile Does Not Exist</h1>
          <p className="text-white/40 text-sm mb-6">No executive profile was found for this username. Check the link and try again.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
            Visit EXECLEAD.AI <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    );
  }

  if (state === "private") {
    return (
      <div className="min-h-screen bg-[#08080d] text-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Lock size={28} className="text-white/30" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">This Executive Profile is Currently Private</h1>
          <p className="text-white/40 text-sm mb-6">The owner has not published this profile yet. Please check back later.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
            Visit EXECLEAD.AI <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const p = profile;
  const execScore = computeExecutiveScore(p);
  const level = getLeadershipLevel(execScore);
  const skills = p.skills || [];
  const experience = safeParse(p.experience_json, []);
  const education = safeParse(p.education_json, []);
  const certifications = safeParse(p.certifications_json, []);
  const content = safeParse(p.public_content_json, {});
  const show = (key) => content[key] !== false;
  const publicUrl = getPublicProfileUrl(p.public_username);
  const qrUrl = getQrUrl(publicUrl);

  const metrics = [
    { key: "promotion_readiness", label: "Promotion Readiness", value: p.promotion_readiness || 0, suffix: "%", icon: TrendingUp, color: "#06b6d4" },
    { key: "leadership_dna", label: "Leadership DNA", value: p.leadership_maturity || 0, suffix: "%", icon: Brain, color: "#a855f7" },
    { key: "executive_score", label: "Executive Score", value: execScore, suffix: "/100", icon: Crown, color: "#6366f1" },
    { key: "level", label: "Leadership Level", value: level, icon: Award, color: "#f59e0b" },
  ].filter(m => show(m.key));

  const isDraftPreview = state === "draft_preview";

  return (
    <div className="min-h-screen bg-[#08080d] text-white">
      {isDraftPreview && (
        <div className="sticky top-0 z-50 bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto px-4 md:px-8 h-12 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-medium">
              <Eye size={13} /> Draft Preview — This is how your profile will look once published.
            </div>
            <Link to="/brand-center" className="text-amber-400 hover:text-amber-300 text-xs font-medium underline">
              Edit & Publish
            </Link>
          </div>
        </div>
      )}
      <nav className="border-b border-white/5 sticky top-0 z-40 bg-[#08080d]/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/"><Logo aiTagClass="ml-1" /></Link>
          <Link to="/register" className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Start Your Journey
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/10 rounded-2xl p-6">
          <div className="flex items-start gap-5 flex-wrap">
            <div className="relative">
              {p.profile_photo ? (
                <img src={p.profile_photo} alt={p.full_name} className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500/30" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/10 flex items-center justify-center text-3xl font-bold border-2 border-indigo-500/30">
                  {(p.full_name || "?").charAt(0)}
                </div>
              )}
              {p.verified_executive && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#08080d] flex items-center justify-center border-2 border-emerald-500/30">
                  <BadgeCheck size={14} className="text-emerald-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white">{p.full_name}</h1>
              {show("executive_summary") && (p.professional_headline || p.current_role) && (
                <p className="text-white/50 text-sm mt-0.5">{p.professional_headline || p.current_role}</p>
              )}
              {p.current_company && <p className="text-white/30 text-sm">{p.current_company}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{level}</span>
                {p.target_role && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/40 border border-white/10">
                    <Target size={9} /> {p.target_role}
                  </span>
                )}
              </div>
            </div>
            {/* QR Code */}
            <div className="flex flex-col items-center gap-1">
              <img src={qrUrl} alt="QR Code" className="w-20 h-20 rounded-lg bg-white p-1.5" />
              <span className="text-[9px] text-white/30 flex items-center gap-0.5"><QrCode size={8} /> Scan to view</span>
            </div>
          </div>
        </div>

        {/* Metrics */}
        {metrics.length > 0 && (
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
        )}

        {/* Executive Summary */}
        {show("executive_summary") && p.bio && (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-2">Executive Biography</h2>
            <p className="text-sm text-white/70 leading-relaxed">{p.bio}</p>
          </div>
        )}

        {/* Skills */}
        {show("skills") && skills.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, i) => <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{s}</span>)}
            </div>
          </div>
        )}

        {/* Experience / Career Timeline */}
        {show("experience") && experience.length > 0 && (
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

        {/* Education & Certifications */}
        <div className="grid md:grid-cols-2 gap-4">
          {show("education") && education.length > 0 && (
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
          {show("certifications") && certifications.length > 0 && (
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

        {/* Resume Download */}
        {show("resume") && p.resume_url && !p.public_hide_resume && (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Resume</h2>
            <a href={p.resume_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors">
              <Download size={14} /> Download Resume
            </a>
          </div>
        )}

        {/* Connect / Social Links */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Connect</h2>
          <div className="flex flex-wrap gap-3">
            {p.linkedin_url && <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors"><Briefcase size={14} /> LinkedIn</a>}
            {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors"><Code size={14} /> GitHub</a>}
            {p.website_url && <a href={p.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors"><Globe size={14} /> Website</a>}
            {p.portfolio_url && <a href={p.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors"><ExternalLink size={14} /> Portfolio</a>}
          </div>
        </div>

        {/* EXECLEAD CTA */}
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