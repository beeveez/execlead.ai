import React from "react";
import {
  MapPin, Building2, Eye, Heart, Share2, Bookmark, Clock,
  BadgeCheck, ArrowUpRight, Check,
} from "lucide-react";
import {
  getCategory, getPartnerType, getWorkModel, formatCompensation,
  formatRelative, formatDeadline, getSponsoredBadges,
} from "@/lib/partnershipMarketplace";
import MatchScoreBadge from "./MatchScoreBadge";

export default function PartnershipCard({ listing, isInterested, matchScore, onClick, onBookmark, bookmarked, onShare }) {
  const cat = getCategory(listing.category);
  const partnerType = getPartnerType(listing.partner_type);
  const deadline = formatDeadline(listing.application_deadline);
  const badges = getSponsoredBadges(listing);
  const CatIcon = cat.icon;

  return (
    <div
      onClick={onClick}
      className="group bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:border-white/15 hover:bg-white/[0.05] transition-all cursor-pointer relative"
    >
      {/* Sponsored badges */}
      {badges.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {badges.slice(0, 3).map((b) => {
            const BIcon = b.icon;
            return (
              <span key={b.id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${b.color}`}>
                <BIcon size={9} /> {b.label}
              </span>
            );
          })}
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        {/* Logo */}
        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
          {listing.organization_logo ? (
            <img src={listing.organization_logo} alt="" className="w-full h-full object-cover" />
          ) : (
            <Building2 size={18} className="text-white/30" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs text-white/50 truncate">{listing.partner_organization_name || "Organization"}</span>
            {listing.is_verified_partner && <BadgeCheck size={12} className="text-blue-400 shrink-0" />}
          </div>
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">{listing.title}</h3>
        </div>

        {/* Match score */}
        {matchScore != null && (
          <div className="shrink-0">
            <MatchScoreBadge score={matchScore} size="sm" />
          </div>
        )}
      </div>

      {/* Category + meta */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-300">
          <CatIcon size={9} /> {cat.label}
        </span>
        <span className="text-[10px] text-white/30">{partnerType.label}</span>
      </div>

      {listing.description && (
        <p className="text-white/40 text-xs leading-relaxed mb-3 line-clamp-2">{listing.description}</p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs text-white/30 mb-3 flex-wrap">
        {listing.work_model && (
          <span className="flex items-center gap-1">{getWorkModel(listing.work_model).label}</span>
        )}
        {listing.country && (
          <span className="flex items-center gap-1"><MapPin size={10} /> {listing.country}</span>
        )}
        {listing.industry && (
          <span className="flex items-center gap-1"><Building2 size={10} /> {listing.industry}</span>
        )}
      </div>

      {/* Compensation */}
      <div className="text-xs text-emerald-400/80 font-medium mb-3">
        {formatCompensation(listing)}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-3 text-xs text-white/30">
          <span className="flex items-center gap-1"><Clock size={10} /> {formatRelative(listing.created_date)}</span>
          {deadline && <span className={`flex items-center gap-1 ${deadline.color}`}>{deadline.label}</span>}
          <span className="flex items-center gap-1"><Eye size={10} /> {listing.views_count || 0}</span>
          <span className="flex items-center gap-1"><Heart size={10} /> {listing.interest_count || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          {onBookmark && (
            <button
              onClick={(e) => { e.stopPropagation(); onBookmark(listing); }}
              className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
            >
              <Bookmark size={14} fill={bookmarked ? "currentColor" : "none"} className={bookmarked ? "text-indigo-400" : ""} />
            </button>
          )}
          {onShare && (
            <button
              onClick={(e) => { e.stopPropagation(); onShare(listing); }}
              className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
            >
              <Share2 size={14} />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isInterested
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-indigo-500 hover:bg-indigo-600 text-white"
            }`}
          >
            {isInterested ? <><Check size={12} /> Interested</> : <><ArrowUpRight size={12} /> Express Interest</>}
          </button>
        </div>
      </div>
    </div>
  );
}