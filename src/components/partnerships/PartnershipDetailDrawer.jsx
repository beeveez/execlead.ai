import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  X, MapPin, Building2, Clock, BadgeCheck, ExternalLink, Check,
  Loader2, Sparkles, ArrowUpRight, AlertCircle, Briefcase, Globe,
  Calendar, User, TrendingUp, DollarSign, Target,
} from "lucide-react";
import {
  getCategory, getPartnerType, getWorkModel, getExecutiveLevel,
  getStartupStage, formatCompensation, formatRelative, formatDeadline,
  getSponsoredBadges,
} from "@/lib/partnershipMarketplace";
import MatchScoreBadge from "./MatchScoreBadge";
import { toast } from "@/components/ui/use-toast";

export default function PartnershipDetailDrawer({ listing, isInterested, onClose, onInterestChanged }) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expressing, setExpressing] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!listing) return;
    setLoading(true);
    setMatch(null);
    loadMatch();
    incrementView();
  }, [listing?.id]);

  const loadMatch = async () => {
    try {
      const res = await base44.functions.invoke("partnershipOps", {
        action: "calculate_match",
        listing_id: listing.id,
      });
      setMatch(res.data.match);
    } catch (e) {
      // silent
    }
    setLoading(false);
  };

  const incrementView = async () => {
    try {
      await base44.functions.invoke("partnershipOps", {
        action: "increment_view",
        listing_id: listing.id,
      });
    } catch (e) {
      // silent
    }
  };

  const handleExpressInterest = async () => {
    setExpressing(true);
    try {
      const res = await base44.functions.invoke("partnershipOps", {
        action: "express_interest",
        listing_id: listing.id,
        message,
      });
      if (res.data.success) {
        setMatch(res.data.match);
        toast({
          title: "Interest expressed",
          description: `${listing.partner_organization_name || "The partner"} has been notified.`,
          variant: "success",
        });
        onInterestChanged?.(listing.id, true);
        setShowMessageForm(false);
        setMessage("");
      }
    } catch (e) {
      const data = e.response?.data;
      if (data?.already_interested) {
        toast({ title: "Already interested", description: "You've already expressed interest in this opportunity.", variant: "info" });
      } else {
        toast({ title: "Could not express interest", description: data?.error || e.message, variant: "error" });
      }
    }
    setExpressing(false);
  };

  const handleWithdraw = async () => {
    setExpressing(true);
    try {
      await base44.functions.invoke("partnershipOps", {
        action: "withdraw_interest",
        listing_id: listing.id,
      });
      toast({ title: "Interest withdrawn", variant: "info" });
      onInterestChanged?.(listing.id, false);
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "error" });
    }
    setExpressing(false);
  };

  if (!listing) return null;

  const cat = getCategory(listing.category);
  const partnerType = getPartnerType(listing.partner_type);
  const workModel = getWorkModel(listing.work_model);
  const execLevel = getExecutiveLevel(listing.executive_level);
  const deadline = formatDeadline(listing.application_deadline);
  const badges = getSponsoredBadges(listing);
  const CatIcon = cat.icon;

  const reasons = match?.reasons || [];
  const missing = match?.missing || [];
  const recommendations = match?.recommendations || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#0d0d14] border-l border-white/10 overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0d0d14]/95 backdrop-blur-sm border-b border-white/5 px-6 py-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
              {listing.organization_logo ? (
                <img src={listing.organization_logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <Building2 size={20} className="text-white/30" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm text-white/50 truncate">{listing.partner_organization_name || "Organization"}</span>
                {listing.is_verified_partner && <BadgeCheck size={14} className="text-blue-400 shrink-0" />}
              </div>
              <h2 className="text-white font-bold text-lg leading-snug">{listing.title}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-300">
                  <CatIcon size={9} /> {cat.label}
                </span>
                <span className="text-[10px] text-white/30">{partnerType.label}</span>
                <span className="text-[10px] text-white/30">·</span>
                <span className="text-[10px] text-white/30">{formatRelative(listing.created_date)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/80 transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Sponsored badges */}
          {badges.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {badges.map((b) => {
                const BIcon = b.icon;
                return (
                  <span key={b.id} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${b.color}`}>
                    <BIcon size={11} /> {b.label}
                  </span>
                );
              })}
            </div>
          )}

          {/* AI Match Score */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-indigo-400" />
              <h3 className="text-white font-semibold text-sm">Executive Match AI</h3>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-white/30 text-sm">
                <Loader2 size={14} className="animate-spin" /> Calculating your match score...
              </div>
            ) : match ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MatchScoreBadge score={match.score} />
                  <span className="text-sm text-white/60">{match.label}</span>
                </div>
                {reasons.length > 0 && (
                  <div>
                    <p className="text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wide">Match Reasons</p>
                    <div className="space-y-1">
                      {reasons.map((r, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-emerald-400/80">
                          <Check size={12} /> {r}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {missing.length > 0 && (
                  <div>
                    <p className="text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wide">Missing Skills</p>
                    <div className="space-y-1">
                      {missing.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-amber-400/70">
                          <AlertCircle size={12} /> {m}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {recommendations.length > 0 && (
                  <div>
                    <p className="text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wide">Recommendations</p>
                    <div className="space-y-1">
                      {recommendations.map((rec, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-indigo-400/70">
                          <Target size={12} /> {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-white/30 text-sm">Complete your profile to see your match score.</p>
            )}
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h3 className="text-white/50 text-xs font-medium uppercase tracking-wide mb-2">Description</h3>
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>
          )}

          {/* Details grid */}
          <div>
            <h3 className="text-white/50 text-xs font-medium uppercase tracking-wide mb-3">Opportunity Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <DetailItem icon={Globe} label="Work Model" value={workModel.label} />
              <DetailItem icon={MapPin} label="Location" value={[listing.location, listing.country].filter(Boolean).join(", ") || "—"} />
              <DetailItem icon={Building2} label="Industry" value={listing.industry || "—"} />
              <DetailItem icon={Briefcase} label="Executive Level" value={execLevel.label} />
              <DetailItem icon={Clock} label="Experience Required" value={listing.required_experience_years > 0 ? `${listing.required_experience_years}+ years` : "Flexible"} />
              <DetailItem icon={Calendar} label="Duration" value={listing.duration || "—"} />
              {listing.startup_stage && <DetailItem icon={TrendingUp} label="Startup Stage" value={getStartupStage(listing.startup_stage).label} />}
              {listing.investment_size && <DetailItem icon={DollarSign} label="Investment Size" value={listing.investment_size} />}
            </div>
          </div>

          {/* Compensation */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
            <h3 className="text-emerald-400/60 text-xs font-medium uppercase tracking-wide mb-2">Compensation</h3>
            <p className="text-emerald-400 font-semibold text-sm">{formatCompensation(listing)}</p>
          </div>

          {/* Required Skills */}
          {listing.required_skills && listing.required_skills.length > 0 && (
            <div>
              <h3 className="text-white/50 text-xs font-medium uppercase tracking-wide mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {listing.required_skills.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Leadership Competencies */}
          {listing.leadership_competencies && (
            <div>
              <h3 className="text-white/50 text-xs font-medium uppercase tracking-wide mb-2">Leadership Competencies</h3>
              <p className="text-white/60 text-sm leading-relaxed">{listing.leadership_competencies}</p>
            </div>
          )}

          {/* Benefits */}
          {listing.benefits && (
            <div>
              <h3 className="text-white/50 text-xs font-medium uppercase tracking-wide mb-2">Benefits</h3>
              <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{listing.benefits}</p>
            </div>
          )}

          {/* Contact + Deadline */}
          {(listing.contact_person || listing.application_deadline) && (
            <div className="grid grid-cols-2 gap-3">
              {listing.contact_person && <DetailItem icon={User} label="Contact Person" value={listing.contact_person} />}
              {deadline && <DetailItem icon={Calendar} label="Application Deadline" value={deadline.label} />}
            </div>
          )}

          {/* Apply URL */}
          {listing.apply_url && (
            <a href={listing.apply_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors">
              <ExternalLink size={14} /> Apply Externally
            </a>
          )}
        </div>

        {/* Action bar */}
        <div className="sticky bottom-0 bg-[#0d0d14]/95 backdrop-blur-sm border-t border-white/5 px-6 py-4 space-y-3">
          {showMessageForm && !isInterested && (
            <div className="space-y-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message to the partner (optional)..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none"
              />
              <div className="flex items-center gap-2">
                <button onClick={handleExpressInterest} disabled={expressing}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium transition-colors">
                  {expressing ? <Loader2 size={14} className="animate-spin" /> : <ArrowUpRight size={14} />}
                  {expressing ? "Submitting..." : "Confirm Interest"}
                </button>
                <button onClick={() => setShowMessageForm(false)}
                  className="px-4 py-2.5 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!showMessageForm && (
            <div className="flex items-center gap-2">
              {isInterested ? (
                <>
                  <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium">
                    <Check size={14} /> Interested
                  </div>
                  <button onClick={handleWithdraw} disabled={expressing}
                    className="px-4 py-2.5 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 disabled:opacity-50 transition-colors">
                    {expressing ? <Loader2 size={14} className="animate-spin" /> : "Withdraw"}
                  </button>
                </>
              ) : (
                <button onClick={() => setShowMessageForm(true)} disabled={expressing}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium transition-colors">
                  <ArrowUpRight size={14} /> Express Interest
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="text-white/30 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-white/30 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-white/70 truncate">{value}</p>
      </div>
    </div>
  );
}