import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Link2, MapPin, Building2, Search, ArrowUpRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const PARTNERSHIP_LABELS = {
  advisor: "Advisor", consultant: "Consultant", mentor: "Mentor", speaker: "Speaker",
  board_member: "Board Member", fractional_cio: "Fractional CIO", fractional_cto: "Fractional CTO",
  strategic_partner: "Strategic Partner",
};

export default function NetworkPartnerships() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fType, setFType] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setListings(await base44.entities.PartnershipListing.list("-created_date", 100));
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const filtered = listings.filter((l) => {
    if (fType && l.partnership_type !== fType) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        l.title?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.industry?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleContact = (listing) => {
    toast({
      title: "Interest expressed",
      description: `Your interest in "${listing.title}" has been noted.`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
          <Link2 size={12} className="text-indigo-400" /> Partnerships
        </div>
        <h1 className="text-xl font-bold text-white">Collaboration Marketplace</h1>
        <p className="text-white/40 text-sm mt-1">
          Find advisors, consultants, speakers, board members, and strategic partners.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search partnerships..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>
        <select value={fType} onChange={(e) => setFType(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
          <option value="">All Types</option>
          {Object.entries(PARTNERSHIP_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-indigo-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">No partnership listings found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((l) => (
            <div key={l.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-white font-semibold text-sm">{l.title}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-300 shrink-0">
                  {PARTNERSHIP_LABELS[l.partnership_type] || l.partnership_type}
                </span>
              </div>
              {l.description && <p className="text-white/40 text-xs leading-relaxed mb-3 line-clamp-3">{l.description}</p>}
              <div className="flex items-center gap-3 text-xs text-white/30 mb-3 flex-wrap">
                {l.country && <span className="flex items-center gap-1"><MapPin size={10} /> {l.country}</span>}
                {l.industry && <span className="flex items-center gap-1"><Building2 size={10} /> {l.industry}</span>}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-white/30 text-xs">{l.posted_by_name || "Anonymous"}</span>
                <button
                  onClick={() => handleContact(l)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium transition-colors"
                >
                  <ArrowUpRight size={12} /> Express Interest
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}