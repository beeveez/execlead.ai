import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  X, Star, Clock, Download, Check, Loader2, BookOpen, Bookmark, Share2,
  Building2, FileText, Video, Globe, Award, Shield, Package,
} from "lucide-react";
import AIContentTools from "@/components/marketplace/AIContentTools";
import ShareMenu from "@/components/marketplace/ShareMenu";
import MarketplaceCard from "@/components/marketplace/MarketplaceCard";

const CATEGORY_TO_COURSE = {
  "Digital Transformation": "digital-transformation",
  "Communication": "executive-communication",
  "Leadership": "leadership",
  "Cloud": "cloud",
  "CIO": "ai-leadership",
  "Board": "governance",
  "M&A": "business-strategy",
};

const TYPE_LABELS = {
  learning_path: "Learning Path",
  company_pack: "Company Pack",
  interview_pack: "Interview Pack",
  certification_track: "Certification Track",
  executive_playbook: "Executive Playbook",
  presentation_template: "Presentation Template",
  case_study: "Case Study",
  industry_framework: "Industry Framework",
  executive_book: "Executive Book",
  ai_prompt_library: "AI Prompt Library",
  board_pack: "Board Pack",
  strategy_toolkit: "Strategy Toolkit",
  executive_bundle: "Executive Bundle",
};

const DIFFICULTY_COLORS = {
  beginner: "bg-emerald-500/10 text-emerald-400",
  intermediate: "bg-blue-500/10 text-blue-400",
  advanced: "bg-amber-500/10 text-amber-400",
  executive: "bg-purple-500/10 text-purple-400",
};

export default function MarketplaceDetail({
  item, onClose, isEnterprise, isSaved, onToggleSave, isPurchased,
  relatedItems, onSelectRelated,
}) {
  const navigate = useNavigate();
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(isPurchased);
  const [showShare, setShowShare] = useState(false);

  const includedInEnterprise = isEnterprise && item.enterprise_included;
  const courseSlug = CATEGORY_TO_COURSE[item.category] || "leadership";

  useEffect(() => {
    const checkPurchased = async () => {
      try {
        const existing = await base44.entities.Purchase.filter({ item_id: item.id });
        if (existing.length > 0) setPurchased(true);
      } catch (e) {}
    };
    if (!isPurchased) checkPurchased();
  }, [item.id, isPurchased]);

  const accessContent = () => {
    onClose();
    navigate(`/academy/${courseSlug}`);
  };

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await base44.entities.MarketplaceItem.update(item.id, { downloads: (item.downloads || 0) + 1 });
      await base44.entities.Purchase.create({
        item_id: item.id,
        item_title: item.title,
        item_type: item.type,
        item_icon: item.icon,
        price: item.price,
        currency: item.currency,
        creator_name: item.creator_name,
        category: item.category,
        content_preview: item.content_preview,
        tags: item.tags,
      });
      setPurchased(true);
    } catch (e) {}
    setPurchasing(false);
  };

  let learningOutcomes = [];
  try { learningOutcomes = JSON.parse(item.learning_outcomes_json || "[]"); } catch (e) {}

  const renderPrice = () => {
    if (includedInEnterprise) {
      return (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-emerald-500/10 text-emerald-400 font-medium">
            <Shield size={14} /> Included with Enterprise
          </span>
        </div>
      );
    }
    return <span className="text-2xl font-bold text-white">{item.price === 0 ? "Free" : `$${item.price}`}</span>;
  };

  const renderActionButton = () => {
    if (purchased || includedInEnterprise) {
      return (
        <button onClick={accessContent}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
          <BookOpen size={16} /> {includedInEnterprise ? "Open" : "Start Learning"}
        </button>
      );
    }
    if (item.price === 0) {
      return (
        <button onClick={handlePurchase} disabled={purchasing}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-40">
          {purchasing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Get Free
        </button>
      );
    }
    return (
      <button onClick={handlePurchase} disabled={purchasing}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm bg-indigo-500 hover:bg-indigo-600 text-white transition-colors disabled:opacity-40">
        {purchasing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Purchase
      </button>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#0d0d14] z-10">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-3xl shrink-0">{item.icon || "📦"}</span>
              <div className="min-w-0">
                <h3 className="text-white font-bold truncate">{item.title}</h3>
                <p className="text-white/30 text-xs">
                  {TYPE_LABELS[item.type] || item.type}
                  {item.author && ` · by ${item.author}`}
                  {item.publisher && ` · ${item.publisher}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => onToggleSave?.(item)}
                className={`p-2 rounded-lg transition-colors ${isSaved ? "text-indigo-400 bg-indigo-500/10" : "text-white/30 hover:text-white/60"}`}>
                <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
              </button>
              <button onClick={() => setShowShare(true)} className="p-2 rounded-lg text-white/30 hover:text-white/60 transition-colors">
                <Share2 size={18} />
              </button>
              <button onClick={onClose} className="p-2 rounded-lg text-white/30 hover:text-white/60 transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-1 rounded-full text-xs capitalize ${DIFFICULTY_COLORS[item.difficulty] || DIFFICULTY_COLORS.executive}`}>{item.difficulty}</span>
              {item.executive_level && <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-white/5 text-white/50"><Award size={10} /> {item.executive_level}</span>}
              {item.collection && <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-400"><Building2 size={10} /> {item.collection}</span>}
              {item.is_bundle && <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-400"><Package size={10} /> Bundle</span>}
              {item.partner_verified && <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400"><Shield size={10} /> Verified Partner</span>}
              {item.duration_hours > 0 && <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-white/5 text-white/40"><Clock size={10} /> {item.duration_hours}h</span>}
              {item.video_duration_minutes > 0 && <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-white/5 text-white/40"><Video size={10} /> {item.video_duration_minutes}m</span>}
              {item.pages > 0 && <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-white/5 text-white/40"><FileText size={10} /> {item.pages}p</span>}
              {item.language && <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-white/5 text-white/40"><Globe size={10} /> {item.language}</span>}
              {item.rating > 0 && <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-white/5 text-amber-400"><Star size={10} fill="currentColor" /> {item.rating} ({item.review_count || 0})</span>}
              <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-white/5 text-white/40"><Download size={10} /> {item.downloads || 0}</span>
              {item.version && <span className="px-2 py-1 rounded-full text-xs bg-white/5 text-white/40">v{item.version}</span>}
            </div>

            {/* Description */}
            <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>

            {/* Learning outcomes */}
            {learningOutcomes.length > 0 && (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <h4 className="text-white/40 text-xs uppercase tracking-wider mb-2">Learning Outcomes</h4>
                <ul className="space-y-1.5">
                  {learningOutcomes.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
                      <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" /> {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What's included */}
            {item.content_preview && (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <h4 className="text-white/40 text-xs uppercase tracking-wider mb-2">What's Included</h4>
                <p className="text-white/50 text-sm">{item.content_preview}</p>
              </div>
            )}

            {/* Tags */}
            {item.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag, i) => <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/10 text-indigo-400/70">#{tag}</span>)}
              </div>
            )}

            {/* AI Tools */}
            <AIContentTools item={item} />

            {/* Price + Action */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              {renderPrice()}
              {renderActionButton()}
            </div>

            {/* Enterprise licensing note */}
            {isEnterprise && !includedInEnterprise && item.price > 0 && (
              <p className="text-xs text-white/30 text-center">
                Enterprise admins can license this for their organization or department.
              </p>
            )}

            {/* Related content */}
            {relatedItems && relatedItems.length > 0 && (
              <div className="border-t border-white/5 pt-4">
                <h4 className="text-white/40 text-xs uppercase tracking-wider mb-3">Related Content</h4>
                <div className="grid grid-cols-2 gap-3">
                  {relatedItems.slice(0, 4).map((ri) => (
                    <MarketplaceCard key={ri.id} item={ri} onClick={() => onSelectRelated(ri)} isEnterprise={isEnterprise} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {showShare && <ShareMenu item={item} onClose={() => setShowShare(false)} />}
    </>
  );
}