import React, { useState, useEffect } from "react";
import { Loader2, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PassportCard from "@/components/intelligence/PassportCard";
import TrustFramework from "@/components/intelligence/TrustFramework";

export default function ExecutivePassport() {
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await base44.functions.invoke("manageIntelligence", { action: "passport" });
        setPassport(res.data);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  if (!passport) {
    return <div className="text-center py-20 text-white/30 text-sm">Unable to load your Executive Passport. Please try again later.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <BookOpen size={12} className="text-indigo-400" />
          Executive Passport™
        </div>
        <h1 className="text-2xl font-bold text-white">Your Executive Passport</h1>
        <p className="text-white/40 text-sm mt-1">A portable professional identity that belongs to you — not your employer.</p>
      </div>

      {/* Passport Card */}
      <PassportCard passport={passport} />

      {/* Trust Framework */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-1">Executive Trust Framework™</h3>
        <p className="text-white/30 text-xs mb-4">Your trust score is built from verification, reputation, and platform authenticity signals.</p>
        <TrustFramework trust={passport.trust} />
      </div>
    </div>
  );
}