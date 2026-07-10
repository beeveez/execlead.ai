import React from "react";
import { Link } from "react-router-dom";
import ReputationPanel from "@/components/legacy/ReputationPanel";
import { ArrowLeft } from "lucide-react";

export default function Reputation() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="text-white/40 hover:text-white/70">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white/90">Executive Reputation</h1>
          <p className="text-white/40 text-xs mt-0.5">Multi-dimensional credibility scoring powered by AI quality assessment</p>
        </div>
      </div>
      <ReputationPanel />
    </div>
  );
}