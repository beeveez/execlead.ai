import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { SECTIONS } from "@/lib/codeOfConductContent";
import { generateCodeOfConductPDF, printCodeOfConduct } from "@/lib/codeOfConductExport";
import {
  Shield, ScrollText, Award, CheckCircle, Ban, MessageCircle, Lock, Bot,
  AlertTriangle, Flag, Scale, TrendingUp, TrendingDown, FileText,
  Clock, Download, Printer, X, Loader2, Check, Target, RefreshCw, Sparkles
} from "lucide-react";

const SECTION_ICONS = {
  objective: Target,
  welcome: Shield,
  pledge: ScrollText,
  core_values: Award,
  expected: CheckCircle,
  prohibited: Ban,
  principles: MessageCircle,
  confidentiality: Lock,
  ai_moderation: Bot,
  enforcement: AlertTriangle,
  reporting: Flag,
  appeals: Scale,
  reputation: TrendingUp,
  digital_signature: FileText,
  renewal: RefreshCw,
  vision: Sparkles,
};

export default function ExecutiveCodeOfConduct({ onAccepted, onDeclined, trigger }) {
  const { toast } = useToast();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke("manageCodeOfConduct", { action: "get_status" })
      .then((res) => { setStatus(res.data || res); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async () => {
    if (!agreed) return;
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke("manageCodeOfConduct", { action: "accept" });
      const d = res.data || res;
      if (d.success) {
        toast({ title: "Code of Conduct Accepted", description: "You can now participate in community features." });
        onAccepted?.(d.acceptance);
      }
    } catch (e) {
      toast({ title: "Failed to record acceptance", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleDecline = () => {
    toast({ title: "Code of Conduct Declined", description: "Community participation features remain disabled.", variant: "warning" });
    onDeclined?.();
  };

  const version = status?.current_version || "1.0";
  const lastUpdated = status?.last_updated;
  const readingTime = status?.estimated_reading_time || 7;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0a0a0f] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-indigo-400" />
              <h2 className="text-white/90 text-lg font-bold">Executive Code of Conduct</h2>
            </div>
            <div className="flex items-center gap-3 text-white/30 text-xs mt-1">
              <span>Version {version}</span>
              <span>·</span>
              <span>Updated {formatDate(lastUpdated)}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock size={10} /> {readingTime} min read</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={generateCodeOfConductPDF} title="Download PDF" className="flex items-center gap-1.5 text-white/40 hover:text-indigo-400 text-xs px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <Download size={13} /> <span className="hidden sm:inline">PDF</span>
            </button>
            <button onClick={printCodeOfConduct} title="Print" className="flex items-center gap-1.5 text-white/40 hover:text-indigo-400 text-xs px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <Printer size={13} /> <span className="hidden sm:inline">Print</span>
            </button>
            {onDeclined && (
              <button onClick={handleDecline} className="text-white/30 hover:text-white/60 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div id="code-of-conduct-printable" className="flex-1 overflow-y-auto p-5 space-y-6">
          {SECTIONS.map((section) => {
            const Icon = SECTION_ICONS[section.id] || FileText;
            return (
              <div key={section.id}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} className="text-indigo-400 flex-shrink-0" />
                  <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">{section.title}</h3>
                </div>
                {renderSection(section)}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/5 flex-shrink-0 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/50 cursor-pointer"
            />
            <span className="text-white/60 text-sm">
              I have read and agree to the <span className="text-white/80 font-medium">Executive Code of Conduct</span>.
            </span>
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleDecline}
              className="text-sm text-white/40 hover:text-white/60 px-4 py-2.5 rounded-lg transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={!agreed || submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Accept & Continue
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function renderSection(section) {
  switch (section.type) {
    case 'paragraph':
      return <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>;

    case 'pledge':
      return (
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
          <p className="text-white/70 text-sm leading-relaxed italic whitespace-pre-line">"{section.content}"</p>
        </div>
      );

    case 'tags':
      return (
        <div>
          {section.intro && <p className="text-white/50 text-sm mb-2">{section.intro}</p>}
          <div className="flex flex-wrap gap-2">
            {section.items.map((item, i) => (
              <span key={i} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-white/60 text-xs">{item}</span>
            ))}
          </div>
        </div>
      );

    case 'checklist':
      return (
        <ul className="space-y-1.5">
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
              <Check size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      );

    case 'xlist':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {section.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-white/50 text-sm">
              <Ban size={12} className="text-red-400 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      );

    case 'two-column':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
            <div className="text-emerald-400 text-xs font-medium mb-2 flex items-center gap-1">
              <TrendingUp size={12} /> {section.leftTitle}
            </div>
            <ul className="space-y-1">
              {section.leftItems.map((item, i) => (
                <li key={i} className="flex items-center gap-1.5 text-white/60 text-xs">
                  <Check size={10} className="text-emerald-400" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
            <div className="text-red-400 text-xs font-medium mb-2 flex items-center gap-1">
              <TrendingDown size={12} /> {section.rightTitle}
            </div>
            <ul className="space-y-1">
              {section.rightItems.map((item, i) => (
                <li key={i} className="flex items-center gap-1.5 text-white/60 text-xs">
                  <Ban size={10} className="text-red-400" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );

    case 'info':
      return (
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
          {section.intro && <p className="text-white/50 text-sm mb-2">{section.intro}</p>}
          <div className="grid grid-cols-2 gap-1.5">
            {section.items.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-white/60 text-xs">
                <FileText size={10} className="text-blue-400 flex-shrink-0" /> {item}
              </div>
            ))}
          </div>
        </div>
      );

    case 'list':
      return (
        <div>
          {section.intro && <p className="text-white/50 text-sm mb-2">{section.intro}</p>}
          <ul className="space-y-1 mb-2">
            {section.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
                <span className="text-white/30 flex-shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
          {section.note && <p className="text-amber-400/70 text-xs mt-2 italic">{section.note}</p>}
        </div>
      );

    default:
      return null;
  }
}