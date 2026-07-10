import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Clock, Check, ChevronRight, ChevronLeft, Loader2,
  UserCircle, BookOpen, Star, FileText, Award, PenLine, Brain,
  Target, Wallet, Dna, Users, MessageSquare, Share2, X,
  Sparkles, Crown, ArrowRight, AlertCircle
} from "lucide-react";
import MultiOrgCard from "@/components/identity/MultiOrgCard";

const PLAN_OPTIONS = [
  {
    id: "free",
    name: "Free",
    icon: UserCircle,
    color: "text-white/60",
    bgColor: "bg-white/5",
    borderColor: "border-white/10",
    description: "Keep your core executive identity.",
    features: ["Executive Profile", "Reputation & Badges", "Leadership Letters", "Community Access", "Resume", "Executive Legacy"],
  },
  {
    id: "professional",
    name: "Professional",
    icon: Sparkles,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/5",
    borderColor: "border-indigo-500/20",
    description: "Unlock AI coaching and publishing.",
    features: ["Everything in Free", "AI Coach", "Publishing", "Advanced Reputation", "Career Studio", "AI Resume", "Community Analytics"],
  },
  {
    id: "executive",
    name: "Executive",
    icon: Crown,
    color: "text-amber-400",
    bgColor: "bg-amber-500/5",
    borderColor: "border-amber-500/20",
    description: "Full executive intelligence suite.",
    features: ["Everything in Professional", "Executive Intelligence", "Executive Council", "Executive Benchmarking", "AI Executive Advisor", "Premium Marketplace"],
  },
];

const ASSET_ICONS = {
  "Executive Profile": UserCircle,
  "Leadership Letters": BookOpen,
  "Executive Reputation": Star,
  "Resume Versions": FileText,
  "Certificates": Award,
  "Journal Entries": PenLine,
  "Simulation Sessions": Brain,
  "Challenge Results": Target,
  "Executive Wallet": Wallet,
  "Executive Legacy": Award,
  "Leadership DNA": Dna,
  "AI Memory": Brain,
  "Referrals": Users,
  "Community Comments": MessageSquare,
  "Community Posts": Share2,
};

export default function IdentityTransferWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [transfer, setTransfer] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [assets, setAssets] = useState(null);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [chosenPlan, setChosenPlan] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [affiliations, setAffiliations] = useState([]);

  useEffect(() => {
    let active = true;
    base44.functions.invoke("manageIdentityTransfer", { action: "get_my_transfer" })
      .then(res => {
        if (!active) return;
        const d = res.data || res;
        if (d.active_transfer) {
          setTransfer(d.active_transfer);
          setDaysRemaining(d.days_remaining);
        } else {
          setError("No active transfer found. If your organization membership has ended, contact support.");
        }
      })
      .catch(() => setError("Failed to load transfer status."));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    base44.functions.invoke("manageIdentityTransfer", { action: "get_affiliations" })
      .then(res => { const d = res.data || res; setAffiliations(d.affiliations || []); })
      .catch(() => {});
  }, []);

  const loadAssets = async () => {
    if (assets) return;
    setLoadingAssets(true);
    try {
      const res = await base44.functions.invoke("manageIdentityTransfer", { action: "review_personal_assets" });
      const d = res.data || res;
      setAssets(d);
    } catch {
      toast({ title: "Failed to load assets", variant: "destructive" });
    }
    setLoadingAssets(false);
  };

  const handleComplete = async () => {
    if (!chosenPlan) return;
    setCompleting(true);
    try {
      const res = await base44.functions.invoke("manageIdentityTransfer", {
        action: "complete_transfer",
        chosen_plan: chosenPlan,
      });
      const d = res.data || res;
      if (d.success) {
        setCompleted(true);
        setStep(5);
      }
    } catch {
      toast({ title: "Transfer failed", description: "Please try again or contact support.", variant: "destructive" });
    }
    setCompleting(false);
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <AlertCircle size={32} className="text-white/30 mx-auto mb-3" />
        <p className="text-white/40 text-sm">{error}</p>
      </div>
    );
  }

  if (!transfer && !error) {
    return (
      <div className="max-w-2xl mx-auto flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  const steps = ["Leaving", "Your Assets", "Choose Plan", "Confirm", "Complete"];

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4">
          <Sparkles size={14} className="text-indigo-400" />
          <span className="text-indigo-400 text-xs font-medium">Executive Identity Portability</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white/90 mb-2">Continue Your Executive Journey</h1>
        <p className="text-white/40 text-sm">Your organization membership has ended. Your Executive Identity remains yours.</p>
      </div>

      {/* Step Progress */}
      {!completed && (
        <div className="flex items-center justify-center gap-1 mb-8">
          {steps.slice(0, 4).map((s, i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                step >= i + 1 ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" : "bg-white/5 text-white/30 border border-transparent"
              }`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${step > i + 1 ? "bg-indigo-500 text-white" : step === i + 1 ? "border border-indigo-400" : "border border-white/20"}`}>
                  {step > i + 1 ? <Check size={8} /> : i + 1}
                </span>
                {s}
              </div>
              {i < 3 && <div className={`w-4 h-px ${step > i + 1 ? "bg-indigo-500/40" : "bg-white/10"}`} />}
            </React.Fragment>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Leaving Organization */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Building2 size={20} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-white/90">Leaving Organization</h2>
                  <p className="text-white/40 text-xs mt-0.5">Your enterprise membership is ending</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between bg-white/[0.02] rounded-lg p-3">
                  <span className="text-white/40 text-xs">Organization</span>
                  <span className="text-white/80 text-sm font-medium">{transfer.organization_name || "Your Organization"}</span>
                </div>
                <div className="flex items-center justify-between bg-white/[0.02] rounded-lg p-3">
                  <span className="text-white/40 text-xs">Reason</span>
                  <span className="text-white/80 text-sm capitalize">{(transfer.trigger_reason || "admin_removed").replace(/_/g, " ")}</span>
                </div>
                <div className="flex items-center justify-between bg-white/[0.02] rounded-lg p-3">
                  <span className="text-white/40 text-xs">Previous Role</span>
                  <span className="text-white/80 text-sm">{transfer.previous_custom_role || "Enterprise User"}</span>
                </div>
              </div>

              {/* Grace Period */}
              <div className={`rounded-xl p-4 border mb-6 ${daysRemaining === 0 ? "bg-red-500/5 border-red-500/15" : "bg-indigo-500/5 border-indigo-500/15"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={14} className={daysRemaining === 0 ? "text-red-400" : "text-indigo-400"} />
                  <span className="text-xs font-medium uppercase tracking-wider text-white/50">Grace Period</span>
                </div>
                <p className="text-sm text-white/70">
                  {daysRemaining === 0
                    ? "Your grace period has ended. Complete your transfer to continue accessing EXECLEAD.AI."
                    : <>You retain full Enterprise features for <span className="font-bold text-white">{daysRemaining} {daysRemaining === 1 ? "day" : "days"}</span>. Choose your next membership before this period ends.</>}
                </p>
              </div>

              {/* Ownership Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                  <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">You Keep</p>
                  <ul className="space-y-1 text-xs text-white/60">
                    <li className="flex items-center gap-1.5"><Check size={10} className="text-emerald-400" /> Executive Profile</li>
                    <li className="flex items-center gap-1.5"><Check size={10} className="text-emerald-400" /> Reputation & Legacy</li>
                    <li className="flex items-center gap-1.5"><Check size={10} className="text-emerald-400" /> Letters & Resume</li>
                    <li className="flex items-center gap-1.5"><Check size={10} className="text-emerald-400" /> Community Contributions</li>
                  </ul>
                </div>
                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                  <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">Employer Keeps</p>
                  <ul className="space-y-1 text-xs text-white/60">
                    <li className="flex items-center gap-1.5"><X size={10} className="text-red-400" /> Enterprise Dashboards</li>
                    <li className="flex items-center gap-1.5"><X size={10} className="text-red-400" /> Organization Analytics</li>
                    <li className="flex items-center gap-1.5"><X size={10} className="text-red-400" /> Internal Assessments</li>
                    <li className="flex items-center gap-1.5"><X size={10} className="text-red-400" /> Private Communities</li>
                  </ul>
                </div>
              </div>

              {affiliations.filter(a => a.organization_id !== transfer.organization_id).length > 0 && (
                <MultiOrgCard affiliations={affiliations.filter(a => a.organization_id !== transfer.organization_id)} />
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button onClick={() => { setStep(2); loadAssets(); }} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors">
                Review Your Assets <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Review Personal Assets */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h2 className="font-semibold text-white/90 mb-1">Review Your Personal Assets</h2>
              <p className="text-white/40 text-xs mb-4">Everything listed here stays with you — forever.</p>

              {loadingAssets ? (
                <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
              ) : assets ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                    {assets.personal_assets.map((a, i) => {
                      const Icon = ASSET_ICONS[a.label] || Check;
                      return (
                        <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon size={14} className="text-emerald-400" />
                            <Check size={12} className="text-emerald-400 ml-auto" />
                          </div>
                          <div className="text-white/80 text-xs font-medium">{a.label}</div>
                          <div className="text-white/30 text-[10px]">{a.count} {a.count === 1 ? "item" : "items"}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">Stays with Employer</p>
                    <div className="flex flex-wrap gap-1.5">
                      {assets.company_assets.map((c, i) => (
                        <span key={i} className="px-2 py-1 bg-red-500/5 border border-red-500/10 rounded text-white/40 text-xs">{c}</span>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="flex justify-between mt-4">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
                <ChevronLeft size={16} /> Back
              </button>
              <button onClick={() => setStep(3)} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors">
                Choose Membership <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Choose New Membership */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h2 className="font-semibold text-white/90 mb-1">Choose Your Next Membership</h2>
              <p className="text-white/40 text-xs mb-4">Your personal assets are preserved regardless of choice.</p>

              <div className="space-y-2">
                {PLAN_OPTIONS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setChosenPlan(plan.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      chosenPlan === plan.id
                        ? `${plan.borderColor} ${plan.bgColor}`
                        : "border-white/5 bg-white/[0.02] hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${plan.bgColor}`}>
                        <plan.icon size={18} className={plan.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-white/90 font-medium text-sm">{plan.name}</span>
                          {chosenPlan === plan.id && <Check size={14} className={plan.color} />}
                        </div>
                        <p className="text-white/40 text-xs mb-2">{plan.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {plan.features.map((f, i) => (
                            <span key={i} className="text-[10px] text-white/40 px-1.5 py-0.5 bg-white/5 rounded">{f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!chosenPlan}
                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
              >
                Review & Confirm <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h2 className="font-semibold text-white/90 mb-4">Confirm Transfer</h2>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between bg-white/[0.02] rounded-lg p-3">
                  <span className="text-white/40 text-xs">Leaving</span>
                  <span className="text-white/80 text-sm font-medium">{transfer.organization_name}</span>
                </div>
                <div className="flex items-center justify-between bg-white/[0.02] rounded-lg p-3">
                  <span className="text-white/40 text-xs">New Plan</span>
                  <span className="text-indigo-400 text-sm font-medium capitalize">{chosenPlan}</span>
                </div>
                <div className="flex items-center justify-between bg-white/[0.02] rounded-lg p-3">
                  <span className="text-white/40 text-xs">Personal Data</span>
                  <span className="text-emerald-400 text-sm font-medium">Preserved</span>
                </div>
                <div className="flex items-center justify-between bg-white/[0.02] rounded-lg p-3">
                  <span className="text-white/40 text-xs">Company Data</span>
                  <span className="text-amber-400 text-sm font-medium">Archived with Employer</span>
                </div>
              </div>

              <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4">
                <p className="text-white/60 text-xs leading-relaxed">
                  By confirming, your organization associations will be removed and your membership will transition to <span className="font-medium text-white/80 capitalize">{chosenPlan}</span>.
                  {chosenPlan === "free" ? " You can upgrade anytime from Billing." : " Complete payment from Billing to activate."}
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button onClick={() => setStep(3)} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={handleComplete}
                disabled={completing}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
              >
                {completing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Complete Transfer
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 5: Transfer Complete */}
        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                <Check size={28} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white/90 mb-2">Transfer Complete</h2>
              <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
                Your Executive Identity has been successfully separated from {transfer.organization_name}.
                Your profile, reputation, letters, and legacy remain yours.
              </p>

              <div className="bg-white/[0.02] rounded-xl p-4 mb-6 max-w-xs mx-auto">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Your New Plan</p>
                <p className="text-indigo-400 text-lg font-bold capitalize">{chosenPlan}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
                >
                  Go to Dashboard <ArrowRight size={16} />
                </button>
                {chosenPlan !== "free" && (
                  <button
                    onClick={() => navigate("/billing")}
                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
                  >
                    Complete Payment
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProductMessaging />
    </div>
  );
}

const IDENTITY_MESSAGES = [
  "Your employer may sponsor your EXECLEAD.AI membership, but your Executive Identity belongs to you.",
  "Your leadership journey doesn't end when you leave a company.",
  "EXECLEAD.AI grows with you throughout your career.",
];

function ProductMessaging() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIdx(i => (i + 1) % IDENTITY_MESSAGES.length), 5000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="text-center mt-8">
      <AnimatePresence mode="wait">
        <motion.p key={idx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
          className="text-white/30 text-xs italic max-w-md mx-auto">
          {IDENTITY_MESSAGES[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}