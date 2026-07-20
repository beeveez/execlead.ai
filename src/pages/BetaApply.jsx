import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Rocket, Shield, Zap, Sparkles, Check, Users, TrendingUp } from "lucide-react";
import BetaApplicationForm from "@/components/beta/BetaApplicationForm";
import ApplicationConfirmation from "@/components/beta/ApplicationConfirmation";
import DuplicateApplicationNotice from "@/components/beta/DuplicateApplicationNotice";
import CapacityDisplay from "@/components/beta/CapacityDisplay";
import WaitlistForm from "@/components/beta/WaitlistForm";
import { getCurrentBetaStage } from "@/lib/betaProgramEngine";
import { getCapacityInfo } from "@/lib/foundingAdmissionsEngine";
import { BrandRegistry } from "@/lib/brandRegistry";

const BENEFITS = [
  { icon: Zap, label: "Free during Beta", desc: "Full access to every EXEC™ capability at no cost" },
  { icon: Shield, label: "Lifetime Founding Member Badge", desc: "Permanent recognition as a founding contributor" },
  { icon: TrendingUp, label: "Direct influence on product roadmap", desc: "Your feedback shapes what we build next" },
  { icon: Sparkles, label: "Early access to every new capability", desc: "Be first to try new EXEC™ modules" },
  { icon: Rocket, label: "Exclusive Founder pricing after launch", desc: "Locked-in lifetime discount when we go paid" },
];

export default function BetaApply() {
  const stage = getCurrentBetaStage();
  const [showForm, setShowForm] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);
  const [duplicateApp, setDuplicateApp] = useState(null);
  const [capacity, setCapacity] = useState(null);

  useEffect(() => {
    getCapacityInfo().then(setCapacity).catch(() => {});
  }, []);

  const isFull = capacity?.isFull;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-500/10 via-indigo-500/5 to-transparent border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-8">
            <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
            <ChevronRight size={10} />
            <span className="text-amber-400">Founding Beta</span>
          </nav>

          <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest mb-4">
            <Rocket size={14} /> {stage.label}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Become a Founding Member of <span className="text-amber-400">EXECLEAD.AI</span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-2xl mb-8">
            Help shape {BrandRegistry.headline}.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Users size={14} className="text-amber-400" /> {stage.maxUsers} founding spots
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Shield size={14} className="text-indigo-400" /> Application-only access
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Zap size={14} className="text-cyan-400" /> Free during Beta
            </div>
          </div>

          {capacity && !isFull && !showForm && !submittedApp && (
            <div className="max-w-xs">
              <CapacityDisplay capacity={capacity.capacity} accepted={capacity.accepted} remaining={capacity.remaining} />
            </div>
          )}

          {isFull && !showForm && (
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 max-w-md">
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} className="text-amber-400" />
                <span className="text-sm font-bold text-white">Founding Beta is Full</span>
              </div>
              <p className="text-xs text-white/40">Applications are no longer accepted. Join the Executive Waitlist below.</p>
            </div>
          )}

          {!showForm && !isFull && !submittedApp && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm transition-colors"
            >
              <Rocket size={16} /> Request Beta Access
            </button>
          )}
        </div>
      </div>

      {/* Benefits + Form */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {submittedApp ? (
          <div className="max-w-md mx-auto">
            <ApplicationConfirmation application={submittedApp} />
          </div>
        ) : duplicateApp ? (
          <div className="max-w-md mx-auto">
            <DuplicateApplicationNotice application={duplicateApp} />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Benefits */}
            <div>
              <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Why Join the Founding Beta?</h2>
              <div className="space-y-4">
                {BENEFITS.map(b => (
                  <div key={b.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <b.icon size={14} className="text-amber-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-400" /> {b.label}
                      </div>
                      <p className="text-white/40 text-xs mt-0.5">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            {isFull ? (
              <WaitlistForm />
            ) : showForm ? (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-1">Beta Application</h2>
                <p className="text-sm text-white/40 mb-6">Fill out the form below. Our team reviews each application personally.</p>
                <BetaApplicationForm
                  defaultTier="founding_beta"
                  onSuccess={(app) => setSubmittedApp(app)}
                  onDuplicate={(app) => setDuplicateApp(app)}
                />
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                  <Sparkles size={24} className="text-amber-400" />
                </div>
                <h3 className="text-white font-medium text-sm mb-2">Ready to shape the future?</h3>
                <p className="text-white/40 text-xs mb-4 max-w-xs">Join a select group of professionals building {BrandRegistry.headline}.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm transition-colors"
                >
                  <Rocket size={14} /> Request Beta Access
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}