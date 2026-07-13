import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Rocket, Users, Shield, Zap } from "lucide-react";
import BetaApplicationForm from "@/components/beta/BetaApplicationForm";
import { getCurrentBetaStage } from "@/lib/betaProgramEngine";

export default function BetaApply() {
  const stage = getCurrentBetaStage();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-500/10 via-indigo-500/5 to-transparent border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-6">
            <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
            <ChevronRight size={10} />
            <span className="text-amber-400">Private Beta</span>
          </nav>
          <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest mb-3">
            <Rocket size={14} /> {stage.label}
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Become a Founding Beta Member</h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-xl">
            Be one of the first executive professionals to shape the future of AI-powered leadership.
            We're accepting a limited number of Founding Beta Members for our private beta program.
          </p>
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Users size={14} className="text-amber-400" /> {stage.maxUsers} spots available
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Shield size={14} className="text-indigo-400" /> Application-only access
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Zap size={14} className="text-cyan-400" /> v{stage.version}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
          <h2 className="text-lg font-bold text-white mb-1">Beta Application</h2>
          <p className="text-sm text-white/40 mb-6">Fill out the form below. Our team reviews each application personally.</p>
          <BetaApplicationForm />
        </div>
      </div>
    </div>
  );
}