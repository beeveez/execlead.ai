import React from "react";
import { Link } from "react-router-dom";
import { Crown, Check, ArrowRight } from "lucide-react";

const BENEFITS = [
  "Early access to new features",
  "Priority support",
  "Direct influence on product roadmap",
  "Exclusive Founder updates",
  "Founding Member recognition",
  "Special pricing (if applicable)",
];

export default function FoundingMemberCTA() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-yellow-500/5 p-8 md:p-10">
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 mb-4">
          <Crown size={13} className="text-amber-400" />
          <span className="text-amber-300 text-xs font-semibold uppercase tracking-wider">Founding Member Program</span>
        </div>

        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Become a Founding Member</h3>
        <p className="text-white/50 text-sm md:text-base max-w-xl leading-relaxed mb-6">
          Join the first generation of EXECLEAD.AI members and help shape the future of AI-powered executive leadership.
        </p>

        <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Founding Members may receive exclusive benefits such as:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
          {BENEFITS.map((b) => (
            <div key={b} className="flex items-center gap-2 text-sm text-white/60">
              <div className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                <Check size={11} className="text-amber-400" />
              </div>
              {b}
            </div>
          ))}
        </div>

        <Link
          to="/register"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/10"
        >
          <Crown size={17} /> Become a Founding Member <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}