import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Lock, ArrowRight, Crown } from "lucide-react";
import CapsuleCreationForm from "@/components/founding/capsule/CapsuleCreationForm";
import CapsuleSealed from "@/components/founding/capsule/CapsuleSealed";
import CapsuleOpened from "@/components/founding/capsule/CapsuleOpened";
import CapsuleSuccess from "@/components/founding/capsule/CapsuleSuccess";

export default function FounderTimeCapsule() {
  const [loading, setLoading] = useState(true);
  const [isFounder, setIsFounder] = useState(false);
  const [capsule, setCapsule] = useState(null);
  const [founderNumber, setFounderNumber] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const loadCapsule = async () => {
    try {
      const res = await base44.functions.invoke("manageTimeCapsule", { action: "get" });
      const d = res.data || res;
      setIsFounder(d.is_founder);
      setCapsule(d.capsule);
      setFounderNumber(d.founder_number);

      // Get current profile for comparison
      if (d.capsule && d.capsule.status === "unlocked") {
        try {
          const waitlist = await base44.entities.FoundingWaitlist.filter({ user_id: d.capsule.user_id });
          const f = waitlist[0] || {};
          setCurrentProfile({
            profession: f.profession || "",
            company: f.company || "",
            industry: f.industry || "",
            country: f.country || "",
            subscription_plan: f.preferred_plan || "",
          });
        } catch (e) {}
      }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    loadCapsule();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  // Not a founder
  if (!isFounder) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Crown size={28} className="text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Founders Only</h2>
        <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
          The Time Capsule is an exclusive feature for Founding Members. Reserve your founding membership to create your own piece of EXECLEAD.AI history.
        </p>
        <Link to="/pricing" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-medium px-6 py-3 rounded-xl transition-colors">
          Reserve Founding Membership <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  // Just sealed — show success
  if (showSuccess && capsule) {
    return <CapsuleSuccess capsule={capsule} founderNumber={founderNumber} onContinue={() => setShowSuccess(false)} />;
  }

  // No capsule or draft — show creation form
  if (!capsule || capsule.status === "draft") {
    return (
      <div className="py-6">
        <CapsuleCreationForm
          founderNumber={founderNumber}
          existingDraft={capsule}
          onSealed={(newCapsule) => {
            setCapsule(newCapsule);
            setShowSuccess(true);
          }}
        />
      </div>
    );
  }

  // Sealed — show countdown
  if (capsule.status === "sealed") {
    return (
      <div className="py-6">
        <CapsuleSealed capsule={capsule} founderNumber={founderNumber} />
      </div>
    );
  }

  // Unlocked or opened — show opening experience
  if (capsule.status === "unlocked" || capsule.status === "opened") {
    return (
      <div className="py-6">
        <CapsuleOpened
          capsule={capsule}
          founderNumber={founderNumber}
          currentProfile={currentProfile}
          onUpdate={loadCapsule}
        />
      </div>
    );
  }

  return null;
}