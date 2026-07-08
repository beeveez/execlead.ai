import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ChevronDown, Lock, Database, CreditCard, Rocket,
  Sparkles, Check
} from "lucide-react";

const STORAGE_KEY = "execlead_trust_center_open";

const TRUST_INDICATORS = [
  { icon: Lock, title: "Secure Authentication", desc: "Enterprise-grade authentication protects every account.", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { icon: Database, title: "Encrypted Data", desc: "Your information is encrypted during transmission and handled securely.", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { icon: CreditCard, title: "Secure Payments", desc: "Subscriptions are processed through trusted payment providers. EXECLEAD.AI never stores your payment card information.", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { icon: Rocket, title: "Continuous Innovation", desc: "New features and platform improvements are delivered regularly.", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
];

const EARLY_BENEFITS = [
  "Shape future platform features",
  "Early access to new capabilities",
  "Direct feedback opportunities",
  "Founding Member recognition",
  "Priority product updates",
];

const ROADMAP = [
  { label: "Executive Leadership Platform", status: "done", tag: "" },
  { label: "AI Career Intelligence", status: "done", tag: "" },
  { label: "Leadership Academy", status: "done", tag: "" },
  { label: "Executive Coaching", status: "done", tag: "" },
  { label: "Early Access", status: "current", tag: "Current" },
  { label: "Official Custom Domain", status: "next", tag: "Next" },
  { label: "Enterprise Integrations", status: "upcoming", tag: "Upcoming" },
  { label: "Global Enterprise Platform", status: "future", tag: "Future" },
];

const SECURITY_NOTICES = [
  "Your account information remains secure.",
  "Your subscription remains active.",
  "Your progress is preserved.",
  "Future platform updates will happen seamlessly.",
];

const ROADMAP_STYLES = {
  done: { dot: "bg-emerald-400", text: "text-emerald-400" },
  current: { dot: "bg-blue-400", text: "text-blue-400" },
  next: { dot: "bg-purple-400", text: "text-purple-400" },
  upcoming: { dot: "bg-indigo-400", text: "text-indigo-400" },
  future: { dot: "bg-white/30", text: "text-white/40" },
};

export default function DomainFAQ() {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === "true";
  });

  const toggle = () => {
    const next = !open;
    setOpen(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return (
    <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left hover:bg-white/[0.02] transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ShieldCheck size={22} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-heading font-bold text-base md:text-lg">Early Access & Platform Trust</h3>
            <p className="text-white/40 text-xs md:text-sm mt-0.5 max-w-xl">
              Building the future of Executive Leadership Intelligence with transparency, security, and continuous innovation.
            </p>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={20} className="text-white/40 shrink-0" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-6 space-y-6">
              {/* Introduction */}
              <p className="text-sm text-white/60 leading-relaxed">
                EXECLEAD.AI is currently in its <span className="text-white/80 font-medium">Early Access</span> phase.
                Our focus is delivering world-class AI-powered executive leadership experiences while continuously enhancing our platform infrastructure.
                As part of our growth journey, our official custom domain and additional enterprise capabilities will be introduced seamlessly.
              </p>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TRUST_INDICATORS.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`rounded-xl ${item.bg} backdrop-blur-sm border ${item.border} p-4`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg ${item.bg} border ${item.border} flex items-center justify-center shrink-0`}>
                        <item.icon size={16} className={item.color} />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-sm">{item.title}</h4>
                        <p className="text-white/50 text-xs mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Early Access Benefits */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/15 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-indigo-400" />
                  <h4 className="text-white font-semibold text-sm">Why Join Early?</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EARLY_BENEFITS.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span className="text-white/60 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Roadmap */}
              <div>
                <h4 className="text-white/60 text-xs uppercase tracking-wider font-medium mb-4">Platform Roadmap</h4>
                <div className="space-y-0">
                  {ROADMAP.map((item, i) => {
                    const style = ROADMAP_STYLES[item.status];
                    const isLast = i === ROADMAP.length - 1;
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full ${style.dot} flex items-center justify-center shrink-0 z-10`}>
                            {item.status === "done" && <Check size={10} className="text-black" />}
                          </div>
                          {!isLast && <div className="w-px flex-1 bg-white/10 my-1 min-h-[16px]" />}
                        </div>
                        <div className="pb-4 flex items-center gap-2 flex-wrap">
                          <span className={`text-sm ${item.status === "future" ? "text-white/40" : "text-white/70"}`}>{item.label}</span>
                          {item.tag && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${style.text} bg-white/5 border border-white/10 uppercase tracking-wider font-medium`}>
                              {item.tag}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Domain */}
              <div className="rounded-xl bg-white/[0.02] border border-white/10 p-5">
                <p className="text-sm text-white/60 leading-relaxed">
                  Our official custom domain will be introduced during our next platform milestone.
                  All user accounts, subscriptions, and data will migrate automatically.
                  <span className="text-white/40"> No action will be required from customers.</span>
                </p>
              </div>

              {/* Security Notice */}
              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-5">
                <div className="space-y-2">
                  {SECURITY_NOTICES.map((notice, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span className="text-sm text-emerald-300/80">{notice}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}