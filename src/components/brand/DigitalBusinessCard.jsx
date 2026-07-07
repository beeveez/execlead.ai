import React, { useRef, useState } from "react";
import { Download, Printer, Mail, Globe, Briefcase, ExternalLink } from "lucide-react";
import { getQrUrl, getPublicProfileUrl, getExecutiveSlug } from "@/lib/socialShare";

export default function DigitalBusinessCard({ profile, user }) {
  const cardRef = useRef(null);
  const [flipped, setFlipped] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const slug = getExecutiveSlug(profile);
  const publicUrl = getPublicProfileUrl(slug);
  const email = user?.email;

  const downloadPng = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { backgroundColor: "#0d0d14", useCORS: true, scale: 3 });
      const link = document.createElement("a");
      link.download = `execlead-card-${slug || "profile"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {}
    setDownloading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Executive Digital Business Card</h3>
        <button onClick={() => setFlipped(!flipped)} className="text-xs text-indigo-400 hover:text-indigo-300">
          {flipped ? "Show Front" : "Show Back"}
        </button>
      </div>

      <div ref={cardRef} className="relative bg-gradient-to-br from-[#11111a] to-[#0d0d14] border border-white/10 rounded-2xl p-6 overflow-hidden" style={{ minHeight: 200 }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />

        {!flipped ? (
          <div className="relative flex items-center gap-4 h-full">
            <div className="shrink-0">
              {profile?.profile_photo ? (
                <img src={profile.profile_photo} alt={profile.full_name} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/30" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-xl font-bold text-white border-2 border-indigo-500/30">
                  {(profile?.full_name || "?").charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] text-white/30 uppercase tracking-widest mb-0.5">EXECLEAD.AI</div>
              <h3 className="text-base font-bold text-white truncate">{profile?.full_name || "Executive"}</h3>
              <p className="text-xs text-white/50 truncate">{profile?.current_role || "Executive Leader"}</p>
              {profile?.current_company && <p className="text-xs text-white/30 truncate">{profile.current_company}</p>}
            </div>
            <div className="shrink-0">
              <img src={getQrUrl(publicUrl)} alt="QR" crossOrigin="anonymous" className="w-14 h-14 rounded-lg" />
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col justify-center gap-3 h-full">
            <div className="text-[9px] text-white/30 uppercase tracking-widest mb-1">EXECLEAD.AI · Executive Card</div>
            {email && (
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Mail size={12} className="text-indigo-400 shrink-0" /> <span className="truncate">{email}</span>
              </div>
            )}
            {profile?.linkedin_url && (
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Briefcase size={12} className="text-indigo-400 shrink-0" /> <span className="truncate">LinkedIn Profile</span>
              </div>
            )}
            {profile?.website_url && (
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Globe size={12} className="text-indigo-400 shrink-0" /> <span className="truncate">{profile.website_url}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-white/60">
              <ExternalLink size={12} className="text-indigo-400 shrink-0" /> <span className="truncate">EXECLEAD Profile</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <button onClick={downloadPng} disabled={downloading} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium transition-colors disabled:opacity-40">
          {downloading ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={13} />}
          Download PNG
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors">
          <Printer size={13} /> Print
        </button>
      </div>
    </div>
  );
}