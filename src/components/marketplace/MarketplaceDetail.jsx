import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { X, Star, Clock, Download, Check, Loader2 } from "lucide-react";

const TYPE_LABELS = {
  learning_path: "Learning Path",
  company_pack: "Company Pack",
  interview_pack: "Interview Pack",
  certification_track: "Certification Track",
  executive_playbook: "Executive Playbook",
  presentation_template: "Presentation Template",
  case_study: "Case Study",
  industry_framework: "Industry Framework",
};

const DIFFICULTY_COLORS = {
  beginner: "bg-emerald-500/10 text-emerald-400",
  intermediate: "bg-blue-500/10 text-blue-400",
  advanced: "bg-amber-500/10 text-amber-400",
  executive: "bg-purple-500/10 text-purple-400",
};

export default function MarketplaceDetail({ item, onClose }) {
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const checkPurchased = async () => {
      try {
        const existing = await base44.entities.Purchase.filter({ item_id: item.id });
        if (existing.length > 0) setPurchased(true);
      } catch (e) {}
    };
    checkPurchased();
  }, [item.id]);

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

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#0d0d14] z-10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{item.icon}</span>
            <div>
              <h3 className="text-white font-bold">{item.title}</h3>
              <p className="text-white/30 text-xs">{TYPE_LABELS[item.type]} · by {item.creator_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>

          <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-1 rounded-full text-xs ${DIFFICULTY_COLORS[item.difficulty] || DIFFICULTY_COLORS.executive}`}>{item.difficulty}</span>
            {item.duration_hours > 0 && <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-white/5 text-white/40"><Clock size={10} /> {item.duration_hours}h</span>}
            {item.rating > 0 && <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-white/5 text-amber-400"><Star size={10} fill="currentColor" /> {item.rating}</span>}
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-white/5 text-white/40"><Download size={10} /> {item.downloads}</span>
          </div>

          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag, i) => <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/10 text-indigo-400/70">#{tag}</span>)}
            </div>
          )}

          {showContent && purchased && item.content_preview && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Check size={14} className="text-emerald-400" />
                <h4 className="text-emerald-400 text-xs uppercase tracking-wider font-semibold">Your Purchased Content</h4>
              </div>
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{item.content_preview}</p>
              {item.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.tags.map((tag, i) => <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400/70">#{tag}</span>)}
                </div>
              )}
            </div>
          )}

          {(!purchased || !showContent) && item.content_preview && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <h4 className="text-white/40 text-xs uppercase tracking-wider mb-2">What's Included</h4>
              <p className="text-white/50 text-sm">{item.content_preview}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-2xl font-bold text-white">{item.price === 0 ? "Free" : `$${item.price}`}</span>
            <button
              onClick={purchased ? () => setShowContent(true) : handlePurchase}
              disabled={purchasing}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                purchased
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : item.price === 0
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "bg-indigo-500 hover:bg-indigo-600 text-white"
              } disabled:cursor-default`}
            >
              {purchasing ? (
                <><Loader2 size={16} className="animate-spin" /> Processing...</>
              ) : purchased ? (
                <><Download size={16} /> Access Content</>
              ) : item.price === 0 ? (
                <><Download size={16} /> Get Free</>
              ) : (
                <><Check size={16} /> Purchase</>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}