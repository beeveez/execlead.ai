import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import BetaApplicationForm from "@/components/beta/BetaApplicationForm";
import ApplicationConfirmation from "@/components/beta/ApplicationConfirmation";
import DuplicateApplicationNotice from "@/components/beta/DuplicateApplicationNotice";
import WaitlistForm from "@/components/beta/WaitlistForm";
import FoundingWavesSection from "@/components/founding/FoundingWavesSection";
import { useAdmissionsMetrics } from "@/lib/admissionsMetricsEngine";

export default function BetaApply() {
  const [showForm, setShowForm] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);
  const [duplicateApp, setDuplicateApp] = useState(null);
  const { metrics: capacity } = useAdmissionsMetrics();
  const isFull = capacity?.isFull;

  const openForm = () => {
    setShowForm(true);
    setTimeout(() => {
      document.getElementById("beta-apply-form")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <nav className="flex items-center gap-1.5 text-xs text-white/30">
          <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
          <ChevronRight size={10} />
          <span className="text-amber-400">Founding Member Program</span>
        </nav>
      </div>

      {/* Three-Wave Program Display */}
      <FoundingWavesSection onApply={openForm} />

      {/* Application / Confirmation / Waitlist */}
      <div id="beta-apply-form" className="max-w-4xl mx-auto px-6 py-12">
        {submittedApp ? (
          <div className="max-w-md mx-auto">
            <ApplicationConfirmation application={submittedApp} />
          </div>
        ) : duplicateApp ? (
          <div className="max-w-md mx-auto">
            <DuplicateApplicationNotice application={duplicateApp} />
          </div>
        ) : isFull ? (
          <div className="max-w-md mx-auto">
            <WaitlistForm />
          </div>
        ) : showForm ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 max-w-2xl mx-auto">
            <h2 className="text-lg font-bold text-white mb-1">Founding Member Application</h2>
            <p className="text-sm text-white/40 mb-6">Each application is reviewed personally by our team. Invitation is selective.</p>
            <BetaApplicationForm
              defaultTier="founding_beta"
              onSuccess={(app) => setSubmittedApp(app)}
              onDuplicate={(app) => setDuplicateApp(app)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}