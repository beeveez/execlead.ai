import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Linkedin, Facebook, Twitter, MessageCircle, Mail, Link2, Check, Users } from "lucide-react";

export default function ShareMenu({ item, onClose }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/marketplace?item=${item.id}`;
  const text = encodeURIComponent(`Check out "${item.title}" on EXECLEAD Marketplace`);

  const platforms = [
    { label: "LinkedIn", icon: Linkedin, color: "text-blue-400", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { label: "Facebook", icon: Facebook, color: "text-blue-500", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: "X", icon: Twitter, color: "text-white/60", href: `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}` },
    { label: "WhatsApp", icon: MessageCircle, color: "text-emerald-400", href: `https://wa.me/?text=${text}%20${encodeURIComponent(url)}` },
    { label: "Email", icon: Mail, color: "text-white/50", href: `mailto:?subject=${text}&body=${encodeURIComponent(url)}` },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-sm w-full p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Share</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={18} /></button>
        </div>
        <p className="text-white/40 text-xs mb-4">{item.title}</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {platforms.map((p) => (
            <a key={p.label} href={p.href} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-colors">
              <p.icon size={20} className={p.color} />
              <span className="text-white/50 text-[10px]">{p.label}</span>
            </a>
          ))}
          <button onClick={copyLink}
            className="flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-colors">
            {copied ? <Check size={20} className="text-emerald-400" /> : <Link2 size={20} className="text-white/50" />}
            <span className="text-white/50 text-[10px]">{copied ? "Copied!" : "Copy Link"}</span>
          </button>
          <button
            className="flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-colors"
            title="Share with your enterprise organization"
          >
            <Users size={20} className="text-indigo-400" />
            <span className="text-white/50 text-[10px]">Team</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}