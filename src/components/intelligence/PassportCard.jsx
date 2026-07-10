import React, { useState } from "react";
import { motion } from "framer-motion";
import { QrCode, Download, Share2, Eye, Lock, Globe, Briefcase } from "lucide-react";

const SHARE_VIEWS = [
  { id: 'public', label: 'Public Profile', icon: Globe, desc: 'Visible to everyone' },
  { id: 'recruiter', label: 'Recruiter View', icon: Eye, desc: 'Recruiters see career details' },
  { id: 'private', label: 'Private View', icon: Lock, desc: 'Only you can see this' },
];

/**
 * PassportCard — the Executive Passport with all content sections,
 * sharing controls (public/recruiter/private views, PDF export, QR code, shareable URL),
 * and data ownership messaging.
 */
export default function PassportCard({ passport }) {
  const [view, setView] = useState('public');

  if (!passport) return null;
  const { profile, journey, readiness, trust, reputation, letters, forecast } = passport;

  return (
    <div className="space-y-5">
      {/* Passport header */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-500/5 border border-indigo-500/20 rounded-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Executive Passport™</p>
              <h2 className="text-white font-bold text-xl">{profile?.full_name || "Executive"}</h2>
              <p className="text-white/50 text-sm">{profile?.professional_headline || profile?.current_role || "Executive Leader"}</p>
            </div>
            <div className="flex items-center gap-2">
              {profile?.identity_verified && <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✅ Verified</span>}
              {profile?.founding_member && <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">👑 Founder</span>}
            </div>
          </div>

          {/* Key metrics row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <Metric label="Journey Level" value={journey?.level?.current?.title || "Seed"} icon={journey?.level?.current?.icon || "🌱"} />
            <Metric label="Readiness" value={`${readiness?.overallScore || 0}%`} icon="📊" />
            <Metric label="Trust Score" value={`${trust?.totalScore || 0}/100`} icon="🛡️" />
            <Metric label="Reputation" value={`${reputation?.score || 0}`} icon="⭐" />
          </div>
        </div>

        {/* Passport footer strip */}
        <div className="bg-black/20 border-t border-white/5 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <Briefcase size={12} />
            {profile?.organization_id ? "Enterprise Member" : "Independent Executive"}
          </div>
          <div className="text-white/20 text-[10px] font-mono">EXEC-PASSPORT-{(profile?.public_username || "EXEC").toUpperCase().slice(0, 8)}</div>
        </div>
      </div>

      {/* Sharing controls */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <h4 className="text-white/40 text-xs uppercase tracking-wider mb-3">Sharing & Views</h4>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {SHARE_VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                view === v.id ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-white/[0.02] border-white/5 text-white/40"
              }`}
            >
              <v.icon size={16} />
              <span className="text-[10px] font-medium text-center">{v.label}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors">
            <QrCode size={12} /> QR Code
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors">
            <Download size={12} /> PDF Export
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium transition-colors">
            <Share2 size={12} /> Shareable URL
          </button>
        </div>
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard title="Career Goals" icon="🎯">
          <p className="text-white/60 text-sm">Target: <span className="text-white/80 font-medium">{profile?.target_role || "—"}</span></p>
          <p className="text-white/60 text-sm">at <span className="text-white/80 font-medium">{profile?.target_company || "—"}</span></p>
          {forecast && (
            <div className="mt-2 pt-2 border-t border-white/5">
              <p className="text-white/40 text-xs">Promotion Forecast: <span className="text-emerald-400 font-medium">{forecast.probability}%</span></p>
            </div>
          )}
        </InfoCard>

        <InfoCard title="Verification Status" icon="✅">
          <div className="flex flex-wrap gap-1.5">
            {trust?.levels?.filter((l) => l.unlocked).map((l) => (
              <span key={l.id} className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400">{l.icon} {l.label}</span>
            ))}
          </div>
        </InfoCard>

        <InfoCard title="Leadership DNA™" icon="🧬">
          {journey?.dnaCompleted ? (
            <p className="text-emerald-400 text-sm">✓ Assessment Completed</p>
          ) : (
            <p className="text-white/40 text-sm">Not yet completed</p>
          )}
        </InfoCard>

        <InfoCard title="Published Letters" icon="✍️">
          <p className="text-white/60 text-sm">{letters?.length || 0} Leadership Letters published</p>
          {letters?.slice(0, 2).map((l, i) => (
            <p key={i} className="text-white/40 text-xs truncate mt-1">• {l.title}</p>
          ))}
        </InfoCard>
      </div>

      {/* Data ownership notice */}
      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-4">
        <p className="text-white/50 text-xs leading-relaxed">
          <strong className="text-white/70">Data Ownership:</strong> Your Executive Passport always belongs to you. Organizations never own your Passport.
          When leaving an employer, you keep your Journey, Readiness, Trust, Legacy, Reputation, Achievements, Learning, and Letters.
          Only organization-specific analytics remain with the employer.
        </p>
      </div>
    </div>
  );
}

function Metric({ label, value, icon }) {
  return (
    <div className="bg-white/[0.03] rounded-lg p-3 text-center">
      <div className="text-lg mb-0.5">{icon}</div>
      <div className="text-white font-bold text-sm">{value}</div>
      <div className="text-white/30 text-[10px]">{label}</div>
    </div>
  );
}

function InfoCard({ title, icon, children }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <h4 className="text-white/40 text-xs uppercase tracking-wider">{title}</h4>
      </div>
      {children}
    </div>
  );
}