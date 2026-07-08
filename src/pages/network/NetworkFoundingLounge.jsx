import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSubscription } from "@/lib/SubscriptionContext";
import {
  Crown, Lock, Sparkles, ThumbsUp, Calendar, Rocket, MessageSquare, Award,
} from "lucide-react";

const ROADMAP_ITEMS = [
  { title: "Executive AI Agents", desc: "Autonomous AI agents that proactively coach, analyze, and prepare you for executive scenarios.", votes: 142 },
  { title: "Board Meeting Simulator", desc: "Practice board-level presentations, Q&A, and crisis management with AI board members.", votes: 98 },
  { title: "Leadership DNA 2.0", desc: "Enhanced competency mapping with predictive career trajectory analysis.", votes: 76 },
  { title: "Executive Peer Matching", desc: "AI-powered matching with executives facing similar challenges and goals.", votes: 64 },
];

const FOUNDER_UPDATES = [
  { date: "Jul 2026", title: "EXECLEAD Network™ Launch", desc: "The executive network is now live for all founding members." },
  { date: "Jul 2026", title: "Company Intelligence — 126+ Organizations", desc: "Expanded our global company database with executive-grade intelligence." },
  { date: "Jun 2026", title: "Truth Engine™ Enhancement", desc: "Improved detection of inflated metrics and false ownership claims." },
];

export default function NetworkFoundingLounge() {
  const { profile } = useSubscription();
  const [votes, setVotes] = useState({});

  if (!profile?.founding_member) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
          <Lock size={28} className="text-amber-400" />
        </div>
        <h2 className="text-white font-semibold text-lg mb-2">Founding Members Only</h2>
        <p className="text-white/40 text-sm leading-relaxed mb-6">
          The Founding Member Lounge is an exclusive area reserved for EXECLEAD.AI's founding
          members. Become a Founding Member to access founder updates, roadmap previews, feature
          voting, AMA sessions, and early beta access.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition-all"
        >
          <Crown size={16} /> Become a Founding Member
        </Link>
      </div>
    );
  }

  const handleVote = (idx) => {
    setVotes((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-amber-400/60 text-xs uppercase tracking-widest mb-1">
          <Crown size={12} /> Founding Member Lounge
        </div>
        <h1 className="text-xl font-bold text-white">Exclusive Founding Member Area</h1>
        <p className="text-white/40 text-sm mt-1">
          Founder updates, roadmap previews, feature voting, and early beta access.
        </p>
      </div>

      {/* Founder Updates */}
      <section>
        <h2 className="flex items-center gap-2 text-white/70 text-sm font-medium mb-3">
          <Sparkles size={14} className="text-amber-400" /> Founder Updates
        </h2>
        <div className="space-y-2">
          {FOUNDER_UPDATES.map((update, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-400/60 text-xs font-mono">{update.date}</span>
                <h3 className="text-white font-medium text-sm">{update.title}</h3>
              </div>
              <p className="text-white/40 text-xs leading-relaxed">{update.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap Voting */}
      <section>
        <h2 className="flex items-center gap-2 text-white/70 text-sm font-medium mb-3">
          <Rocket size={14} className="text-amber-400" /> Roadmap Preview — Vote on Features
        </h2>
        <div className="space-y-2">
          {ROADMAP_ITEMS.map((item, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm mb-1">{item.title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                </div>
                <button
                  onClick={() => handleVote(i)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors shrink-0 ${
                    votes[i] ? "bg-amber-500/15 text-amber-400" : "bg-white/5 text-white/30 hover:text-white/60"
                  }`}
                >
                  <ThumbsUp size={14} className={votes[i] ? "fill-current" : ""} />
                  <span className="text-xs font-bold">{item.votes + (votes[i] ? 1 : 0)}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="grid grid-cols-2 gap-3">
        <Link to="/network/discussions" className="bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:border-amber-500/20 transition-colors">
          <MessageSquare size={18} className="text-amber-400 mb-2" />
          <h3 className="text-white text-sm font-medium">Private Discussions</h3>
          <p className="text-white/30 text-xs mt-1">Founding member exclusive Q&A</p>
        </Link>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
          <Award size={18} className="text-amber-400 mb-2" />
          <h3 className="text-white text-sm font-medium">Recognition Wall</h3>
          <p className="text-white/30 text-xs mt-1">Your Lifetime Founder Badge is active</p>
        </div>
      </section>
    </div>
  );
}