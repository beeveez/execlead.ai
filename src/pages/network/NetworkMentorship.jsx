import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, GraduationCap, Star, Clock, Globe, MessageSquare, Search,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const AVAILABILITY_STYLES = {
  available: "bg-emerald-500/10 text-emerald-400",
  limited: "bg-amber-500/10 text-amber-400",
  unavailable: "bg-red-500/10 text-red-400",
};

export default function NetworkMentorship() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fArea, setFArea] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setMentors(await base44.entities.MentorProfile.list("-rating", 100));
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const allAreas = [...new Set(mentors.flatMap((m) => m.mentoring_areas || []))].sort();

  const filtered = mentors.filter((m) => {
    if (fArea && !m.mentoring_areas?.includes(fArea)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.full_name?.toLowerCase().includes(q) ||
        m.current_company?.toLowerCase().includes(q) ||
        m.industry?.toLowerCase().includes(q) ||
        m.mentoring_areas?.some((a) => a.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleRequest = (mentor) => {
    toast({
      title: "Mentorship request sent",
      description: `Your request has been sent to ${mentor.full_name}.`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
          <GraduationCap size={12} className="text-indigo-400" /> Mentorship
        </div>
        <h1 className="text-xl font-bold text-white">Executive Mentors</h1>
        <p className="text-white/40 text-sm mt-1">
          Connect with experienced executives for personalized guidance.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, or expertise..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>
        <select
          value={fArea}
          onChange={(e) => setFArea(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
        >
          <option value="">All Areas</option>
          {allAreas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-indigo-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">No mentors found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((m) => (
            <div key={m.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-base font-bold text-indigo-400 overflow-hidden shrink-0">
                  {m.profile_photo ? (
                    <img src={m.profile_photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (m.full_name || "?").charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm truncate">{m.full_name}</h3>
                  <div className="text-white/40 text-xs truncate">
                    {m.current_role}{m.current_company ? ` · ${m.current_company}` : ""}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-amber-400 text-xs">
                      <Star size={11} className="fill-current" /> {m.rating?.toFixed(1) || "New"}
                    </span>
                    <span className="text-white/30 text-xs">{m.sessions_completed || 0} sessions</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${AVAILABILITY_STYLES[m.availability] || AVAILABILITY_STYLES.available}`}>
                  {m.availability || "available"}
                </span>
              </div>
              {m.bio && <p className="text-white/40 text-xs leading-relaxed mb-3 line-clamp-2">{m.bio}</p>}
              {m.mentoring_areas?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {m.mentoring_areas.slice(0, 4).map((area, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-xs bg-indigo-500/10 text-indigo-300">{area}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-white/30 mb-3">
                {m.years_experience && <span>{m.years_experience} yrs exp</span>}
                {m.timezone && <span className="flex items-center gap-1"><Globe size={10} /> {m.timezone}</span>}
                {m.languages?.length > 0 && <span>{m.languages.join(", ")}</span>}
              </div>
              <button
                onClick={() => handleRequest(m)}
                disabled={m.availability === "unavailable"}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white text-xs font-medium transition-colors"
              >
                <MessageSquare size={12} /> Request Mentor
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}