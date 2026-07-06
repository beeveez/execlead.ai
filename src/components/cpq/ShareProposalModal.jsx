import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link2, Mail, Copy, Check, Linkedin } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function ShareProposalModal({ shareUrl, proposalNumber, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link Copied", description: "Proposal link copied to clipboard." });
    } catch (e) {
      toast({ title: "Copy Failed", description: "Please copy the link manually.", variant: "destructive" });
    }
  };

  const emailSubject = `Enterprise Proposal ${proposalNumber} — EXECLEAD.AI`;
  const emailBody = `Please review our enterprise proposal: ${shareUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0d0d14] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden"
        >
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Link2 size={18} className="text-indigo-400" />
              </div>
              <h2 className="text-white font-bold text-lg">Share Proposal</h2>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors p-1">
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-xs text-white/60 focus:outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 text-xs font-medium hover:bg-indigo-500/25 transition-colors flex-shrink-0"
              >
                {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <a
                href={`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Mail size={20} className="text-white/50" />
                <span className="text-xs text-white/50">Email</span>
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Linkedin size={20} className="text-white/50" />
                <span className="text-xs text-white/50">LinkedIn</span>
              </a>
              <button
                onClick={handleCopy}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Copy size={20} className="text-white/50" />
                <span className="text-xs text-white/50">Copy Link</span>
              </button>
            </div>

            <p className="text-xs text-white/30 text-center">
              Only authenticated EXECLEAD.AI users can view this proposal.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}