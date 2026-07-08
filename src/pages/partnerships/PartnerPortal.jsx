import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  Loader2, Plus, ArrowLeft, Eye, Heart, TrendingUp, Target,
  CheckCircle2, Clock, Building2, MoreVertical, Pencil, Archive,
  Check, X, Calendar, BadgeCheck, Mail,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  getCategory, getListingStatus, getListingTier, getInterestStatus,
  formatRelative, getSponsoredBadges,
} from "@/lib/partnershipMarketplace";
import MatchScoreBadge from "@/components/partnerships/MatchScoreBadge";
import CreateListingModal from "@/components/partnerships/CreateListingModal";

export default function PartnerPortal() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [tab, setTab] = useState("listings");
  const [actionMenu, setActionMenu] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("partnershipOps", { action: "get_partner_analytics" });
      setData(res.data);
    } catch (e) {
      toast({ title: "Failed to load dashboard", description: e.response?.data?.error || e.message, variant: "error" });
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleListingAction = async (listing, action) => {
    setActionMenu(null);
    try {
      if (action === "edit") {
        setEditing(listing);
        setShowCreate(true);
        return;
      }
      if (action === "close") {
        await base44.functions.invoke("partnershipOps", {
          action: "update_listing", listing_id: listing.id, updates: { status: "closed" }
        });
        toast({ title: "Listing closed", variant: "info" });
      }
      if (action === "reopen") {
        await base44.functions.invoke("partnershipOps", {
          action: "update_listing", listing_id: listing.id, updates: { status: "open" }
        });
        toast({ title: "Listing reopened", variant: "success" });
      }
      if (action === "archive") {
        await base44.functions.invoke("partnershipOps", {
          action: "update_listing", listing_id: listing.id, updates: { status: "archived" }
        });
        toast({ title: "Listing archived", variant: "info" });
      }
      loadData();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "error" });
    }
  };

  const handleInterestAction = async (interest, status) => {
    try {
      await base44.functions.invoke("partnershipOps", {
        action: "update_interest", interest_id: interest.id, status
      });
      const labels = { accepted: "accepted", rejected: "rejected", meeting_scheduled: "meeting scheduled", closed: "closed" };
      toast({ title: `Interest ${labels[status] || status}`, variant: "success" });
      loadData();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "error" });
    }
  };

  const handleSaved = () => {
    loadData();
    setEditing(null);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-indigo-400" /></div>;
  }

  const m = data?.metrics || {};
  const listings = data?.listings || [];
  const interests = data?.interests || [];

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Link to="/network/partnerships" className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 mb-2 transition-colors">
            <ArrowLeft size={12} /> Back to Marketplace
          </Link>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <Building2 size={12} className="text-indigo-400" /> Partner Portal
          </div>
          <h1 className="text-xl font-bold text-white">Partner Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">Manage your partnership listings, track applications, and monitor performance.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowCreate(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
          <Plus size={14} /> Create Listing
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Building2} label="Active Listings" value={m.active_listings || 0} color="text-indigo-400" />
        <StatCard icon={Heart} label="Applications" value={m.total_interests || 0} color="text-rose-400" />
        <StatCard icon={Clock} label="Pending" value={m.pending_interests || 0} color="text-amber-400" />
        <StatCard icon={Eye} label="Total Views" value={m.total_views || 0} color="text-blue-400" />
        <StatCard icon={CheckCircle2} label="Accepted" value={m.accepted_interests || 0} color="text-emerald-400" />
        <StatCard icon={Target} label="Conversion" value={`${m.conversion_rate || 0}%`} color="text-violet-400" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/5">
        <TabButton active={tab === "listings"} onClick={() => setTab("listings")} label="My Listings" count={listings.length} />
        <TabButton active={tab === "applications"} onClick={() => setTab("applications")} label="Applications" count={interests.length} />
      </div>

      {/* My Listings Tab */}
      {tab === "listings" && (
        <div className="space-y-3">
          {listings.length === 0 ? (
            <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-xl">
              <Building2 size={28} className="mx-auto text-white/10 mb-3" />
              <p className="text-white/40 text-sm font-medium">No listings yet</p>
              <p className="text-white/20 text-xs mt-1 mb-4">Create your first partnership opportunity.</p>
              <button onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
                <Plus size={14} /> Create Listing
              </button>
            </div>
          ) : (
            listings.map((l) => {
              const cat = getCategory(l.category);
              const status = getListingStatus(l.status);
              const tier = getListingTier(l.listing_tier);
              const badges = getSponsoredBadges(l);
              const CatIcon = cat.icon;
              return (
                <div key={l.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {l.organization_logo ? (
                          <img src={l.organization_logo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <CatIcon size={16} className="text-white/30" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-white font-semibold text-sm truncate">{l.title}</h3>
                          {l.is_verified_partner && <BadgeCheck size={12} className="text-blue-400 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-xs text-white/30">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status.color}`}>{status.label}</span>
                          <span className={`text-[10px] ${tier.color}`}>{tier.label}</span>
                          {l.opportunity_id && <span className="text-[10px] font-mono">{l.opportunity_id}</span>}
                          <span>· {formatRelative(l.created_date)}</span>
                        </div>
                        {badges.length > 0 && (
                          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                            {badges.map(b => (
                              <span key={b.id} className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${b.color}`}>{b.label}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center gap-3 text-xs text-white/30">
                        <span className="flex items-center gap-1"><Eye size={11} /> {l.views_count || 0}</span>
                        <span className="flex items-center gap-1"><Heart size={11} /> {l.interest_count || 0}</span>
                      </div>
                      <div className="relative">
                        <button onClick={() => setActionMenu(actionMenu === l.id ? null : l.id)}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/80 transition-colors">
                          <MoreVertical size={14} />
                        </button>
                        {actionMenu === l.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                            <div className="absolute right-0 top-8 z-20 bg-[#15151f] border border-white/10 rounded-lg shadow-xl py-1 w-40">
                              <MenuItem icon={Pencil} label="Edit" onClick={() => handleListingAction(l, "edit")} />
                              {l.status === "open" ? (
                                <MenuItem icon={X} label="Close" onClick={() => handleListingAction(l, "close")} />
                              ) : (
                                <MenuItem icon={Check} label="Reopen" onClick={() => handleListingAction(l, "reopen")} />
                              )}
                              <MenuItem icon={Archive} label="Archive" onClick={() => handleListingAction(l, "archive")} />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Applications Tab */}
      {tab === "applications" && (
        <div className="space-y-3">
          {interests.length === 0 ? (
            <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-xl">
              <Mail size={28} className="mx-auto text-white/10 mb-3" />
              <p className="text-white/40 text-sm font-medium">No applications yet</p>
              <p className="text-white/20 text-xs mt-1">When executives express interest in your listings, they'll appear here.</p>
            </div>
          ) : (
            interests.map((interest) => {
              const status = getInterestStatus(interest.status);
              const reasons = (() => { try { return JSON.parse(interest.match_reasons_json || "{}"); } catch { return {}; } })();
              return (
                <div key={interest.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {interest.user_photo ? (
                          <img src={interest.user_photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white/40 text-sm font-medium">
                            {(interest.user_name || "?")[0]}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-white font-semibold text-sm truncate">{interest.user_name}</h3>
                          {interest.match_score > 0 && <MatchScoreBadge score={interest.match_score} size="sm" />}
                        </div>
                        <p className="text-xs text-white/30 truncate">{interest.user_headline || interest.user_email}</p>
                        <p className="text-xs text-white/40 mt-1">Interested in: <span className="text-white/60">{interest.listing_title}</span></p>
                        {interest.message && (
                          <p className="text-xs text-white/40 mt-1.5 bg-white/[0.02] rounded-lg px-3 py-2 border border-white/5">"{interest.message}"</p>
                        )}
                        {reasons.reasons && reasons.reasons.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            {reasons.reasons.slice(0, 3).map((r, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/5 text-emerald-400/60">{r}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status.color}`}>{status.label}</span>
                      {interest.status === "pending" && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleInterestAction(interest, "accepted")}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors" title="Accept">
                            <Check size={14} />
                          </button>
                          <button onClick={() => handleInterestAction(interest, "rejected")}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors" title="Reject">
                            <X size={14} />
                          </button>
                          <button onClick={() => handleInterestAction(interest, "meeting_scheduled")}
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors" title="Schedule Meeting">
                            <Calendar size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreate && (
        <CreateListingModal
          existing={editing}
          onClose={() => { setShowCreate(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={color} />
        <span className="text-[10px] text-white/30 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-white font-bold text-lg">{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, label, count }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        active ? "border-indigo-500 text-white" : "border-transparent text-white/40 hover:text-white/60"
      }`}>
      {label}
      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${active ? "bg-indigo-500/20 text-indigo-300" : "bg-white/5 text-white/30"}`}>{count}</span>
    </button>
  );
}

function MenuItem({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:bg-white/5 hover:text-white/90 transition-colors text-left">
      <Icon size={12} /> {label}
    </button>
  );
}