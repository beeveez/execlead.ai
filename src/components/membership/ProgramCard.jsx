import React from "react";
import {
  Users, Rocket, ThumbsUp, MessageSquare, Gift, Percent, Calendar,
  Infinity as InfinityIcon, Clock, Edit2, UserPlus, Trash2, Settings
} from "lucide-react";
import { PROGRAM_TYPES, BENEFIT_FIELDS } from "@/lib/membershipEngine";

const BENEFIT_ICONS = {
  community_access: Users,
  early_feature_access: Rocket,
  roadmap_voting: ThumbsUp,
  feedback_sessions: MessageSquare,
  referral_bonus_enabled: Gift,
};

export default function ProgramCard({ program, onEdit, onEnroll, onManageMembers, onDelete }) {
  const meta = PROGRAM_TYPES[program.program_type] || PROGRAM_TYPES.custom;
  const activeBenefits = BENEFIT_FIELDS.filter((b) => program[b.key]);
  const isFull = program.max_participants > 0 && (program.enrolled_count || 0) >= program.max_participants;
  const campaignEnded = program.campaign_end_date && new Date(program.campaign_end_date) < new Date();

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col hover:border-white/10 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: `${program.color || meta.color}20`, border: `1px solid ${program.color || meta.color}30` }}
          >
            {program.icon || meta.icon}
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm leading-tight">{program.name || "Untitled Program"}</h3>
            <span className="text-white/30 text-xs">{meta.label}</span>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${
          !program.is_active || campaignEnded
            ? "bg-white/5 text-white/40"
            : "bg-emerald-500/10 text-emerald-400"
        }`}>
          {!program.is_active ? "Disabled" : campaignEnded ? "Ended" : "Active"}
        </span>
      </div>

      {program.description && (
        <p className="text-white/40 text-xs leading-relaxed mb-4 line-clamp-2">{program.description}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white/[0.02] rounded-lg p-2.5 text-center">
          <div className="text-white/80 text-sm font-bold">{program.enrolled_count || 0}</div>
          <div className="text-white/30 text-[10px]">Enrolled</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-2.5 text-center">
          <div className="text-white/80 text-sm font-bold">{program.max_participants > 0 ? program.max_participants : "∞"}</div>
          <div className="text-white/30 text-[10px]">Max</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-2.5 text-center">
          <div className="text-white/80 text-sm font-bold flex items-center justify-center gap-0.5">
            {program.discount_percentage > 0 ? (
              <><Percent size={10} />{program.discount_percentage}</>
            ) : "—"}
          </div>
          <div className="text-white/30 text-[10px]">Discount</div>
        </div>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-2 mb-3 text-xs">
        {program.benefit_duration_type === "lifetime" ? (
          <span className="flex items-center gap-1 text-amber-400/80">
            <InfinityIcon size={12} /> Lifetime Benefits
          </span>
        ) : (
          <span className="flex items-center gap-1 text-blue-400/80">
            <Clock size={12} /> {program.benefit_duration_days} days
          </span>
        )}
        {program.lifetime_pricing_protection && (
          <span className="flex items-center gap-1 text-emerald-400/80 ml-auto">
            <Percent size={12} /> Price Protected
          </span>
        )}
      </div>

      {/* Benefit pills */}
      {activeBenefits.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {activeBenefits.map((b) => {
            const Icon = BENEFIT_ICONS[b.key];
            return (
              <span key={b.key} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-white/50 text-[10px]">
                {Icon && <Icon size={10} />}
                {b.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Campaign dates */}
      {(program.campaign_start_date || program.campaign_end_date) && (
        <div className="flex items-center gap-1.5 text-white/30 text-[10px] mb-4">
          <Calendar size={10} />
          {program.campaign_start_date && new Date(program.campaign_start_date).toLocaleDateString()}
          {" → "}
          {program.campaign_end_date && new Date(program.campaign_end_date).toLocaleDateString()}
        </div>
      )}

      {isFull && (
        <div className="text-amber-400/80 text-[10px] mb-3">⚠ Enrollment full</div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1.5 mt-auto pt-3 border-t border-white/5">
        <button
          onClick={onEnroll}
          disabled={isFull || !program.is_active}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <UserPlus size={12} /> Enroll
        </button>
        <button
          onClick={onManageMembers}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs font-medium transition-colors"
        >
          <Users size={12} /> Members
        </button>
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 transition-colors"
          title="Edit"
        >
          <Edit2 size={12} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors ml-auto"
          title="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}