import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Link2, Plus, Building2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import PartnershipCard from "@/components/partnerships/PartnershipCard";
import PartnershipFilters from "@/components/partnerships/PartnershipFilters";
import PartnershipDetailDrawer from "@/components/partnerships/PartnershipDetailDrawer";

const EMPTY_FILTERS = { search: "", category: "", work_model: "", executive_level: "", listing_tier: "", country: "", industry: "" };

export default function NetworkPartnerships() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selected, setSelected] = useState(null);
  const [userInterests, setUserInterests] = useState(new Set());
  const [matchScores, setMatchScores] = useState({});
  const [bookmarks, setBookmarks] = useState(new Set());

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("partnership_bookmarks") || "[]");
    setBookmarks(new Set(stored));
    loadListings();
    loadInterests();
  }, []);

  const loadListings = async () => {
    try {
      const data = await base44.entities.PartnershipListing.list("-created_date", 100);
      const open = data.filter(l => l.status === "open");
      setListings(open);
      if (open.length > 0) {
        try {
          const res = await base44.functions.invoke("partnershipOps", {
            action: "bulk_match",
            listing_ids: open.map(l => l.id),
          });
          const scores = {};
          for (const [id, match] of Object.entries(res.data.matches || {})) {
            scores[id] = match.score;
          }
          setMatchScores(scores);
        } catch (e) {
          // user may not be authed — match scores optional
        }
      }
    } catch (e) {
      toast({ title: "Failed to load listings", variant: "error" });
    }
    setLoading(false);
  };

  const loadInterests = async () => {
    try {
      const res = await base44.functions.invoke("partnershipOps", { action: "get_user_interests" });
      const ids = new Set((res.data.interests || []).map(i => i.listing_id));
      setUserInterests(ids);
    } catch (e) {
      // user may not be authed
    }
  };

  const handleInterestChanged = useCallback((listingId, interested) => {
    setUserInterests(prev => {
      const next = new Set(prev);
      if (interested) next.add(listingId);
      else next.delete(listingId);
      return next;
    });
    setListings(prev => prev.map(l =>
      l.id === listingId
        ? { ...l, interest_count: Math.max(0, (l.interest_count || 0) + (interested ? 1 : -1)) }
        : l
    ));
  }, []);

  const toggleBookmark = (listing) => {
    const next = new Set(bookmarks);
    if (next.has(listing.id)) next.delete(listing.id);
    else next.add(listing.id);
    setBookmarks(next);
    localStorage.setItem("partnership_bookmarks", JSON.stringify([...next]));
  };

  const handleShare = async (listing) => {
    const url = `${window.location.origin}/network/partnerships`;
    if (navigator.share) {
      try { await navigator.share({ title: listing.title, text: listing.description, url }); } catch (e) {}
    } else {
      try { await navigator.clipboard.writeText(url); toast({ title: "Link copied", variant: "success" }); } catch (e) {}
    }
  };

  const filtered = listings.filter((l) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!l.title?.toLowerCase().includes(q) &&
          !l.description?.toLowerCase().includes(q) &&
          !l.partner_organization_name?.toLowerCase().includes(q) &&
          !l.industry?.toLowerCase().includes(q)) return false;
    }
    if (filters.category && l.category !== filters.category) return false;
    if (filters.work_model && l.work_model !== filters.work_model) return false;
    if (filters.executive_level && l.executive_level !== filters.executive_level) return false;
    if (filters.listing_tier && l.listing_tier !== filters.listing_tier) return false;
    if (filters.country && !l.country?.toLowerCase().includes(filters.country.toLowerCase())) return false;
    if (filters.industry && !l.industry?.toLowerCase().includes(filters.industry.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aBoost = (a.is_sponsored ? 4 : 0) + (a.is_featured ? 3 : 0) + (a.is_urgent ? 2 : 0) + (a.is_executive_pick ? 1 : 0);
    const bBoost = (b.is_sponsored ? 4 : 0) + (b.is_featured ? 3 : 0) + (b.is_urgent ? 2 : 0) + (b.is_executive_pick ? 1 : 0);
    return bBoost - aBoost;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <Link2 size={12} className="text-indigo-400" /> Partnerships
          </div>
          <h1 className="text-xl font-bold text-white">Executive Partnership Marketplace</h1>
          <p className="text-white/40 text-sm mt-1 max-w-2xl">
            Connect with verified organizations, investors, universities, and strategic partners. Board seats, advisory roles, fractional positions, joint ventures, and investment opportunities.
          </p>
        </div>
        <Link to="/partner-portal"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
          <Plus size={14} /> Post Opportunity
        </Link>
      </div>

      <PartnershipFilters
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
        resultCount={sorted.length}
      />

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-indigo-400" /></div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20">
          <Building2 size={32} className="mx-auto text-white/10 mb-3" />
          <p className="text-white/40 text-sm font-medium">No partnership opportunities found</p>
          <p className="text-white/20 text-xs mt-1">Try adjusting your filters or check back later for new opportunities.</p>
          <Link to="/partner-portal"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors">
            <Sparkles size={14} /> Be the first to post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {sorted.map((l) => (
            <PartnershipCard
              key={l.id}
              listing={l}
              isInterested={userInterests.has(l.id)}
              matchScore={matchScores[l.id]}
              bookmarked={bookmarks.has(l.id)}
              onClick={() => setSelected(l)}
              onBookmark={toggleBookmark}
              onShare={handleShare}
            />
          ))}
        </div>
      )}

      {selected && (
        <PartnershipDetailDrawer
          listing={selected}
          isInterested={userInterests.has(selected.id)}
          onClose={() => setSelected(null)}
          onInterestChanged={handleInterestChanged}
        />
      )}
    </div>
  );
}