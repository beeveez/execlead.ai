import React, { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useExecVerified } from "@/hooks/useExecVerified";
import { EVIDENCE_TYPES, WORKFLOW_ORDER, WORKFLOW_STAGES } from "@/lib/execVerifiedCatalog";
import { ShieldCheck, ArrowRight, ArrowLeft, Check, Loader2, Upload, AlertCircle, Fingerprint } from "lucide-react";

const STEPS = [
  { id: 0, key: "eligibility", label: "Eligibility Check", icon: Check },
  { id: 1, key: "identity", label: "Identity Verification", icon: Fingerprint },
  { id: 2, key: "evidence", label: "Evidence Submission", icon: Upload },
  { id: 3, key: "submit", label: "Review & Submit", icon: ShieldCheck },
];

export default function VerificationApply() {
  const { enabled, loading: flagLoading } = useExecVerified();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState([]);
  const [identityUploaded, setIdentityUploaded] = useState(false);

  if (!flagLoading && !enabled) return <Navigate to="/security" replace />;
  if (flagLoading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" /></div>;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const verificationId = `EV-${Date.now()}`;
      const auditEntry = { timestamp: new Date().toISOString(), event: "application_submitted", actor: user?.email, details: `Evidence types: ${selectedEvidence.join(", ")}` };
      await base44.entities.ExecVerification.create({
        verification_id: verificationId,
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name || user.email,
        verification_status: "pending",
        verification_level: "level_1_email",
        verification_level_number: 1,
        application_date: new Date().toISOString(),
        workflow_stage: "eligibility_check",
        identity_status: identityUploaded ? "pending" : "not_started",
        employment_status: selectedEvidence.includes("employment_verification") ? "pending" : "not_started",
        certification_status: selectedEvidence.includes("professional_certifications") ? "pending" : "not_started",
        executive_status: selectedEvidence.includes("leadership_credentials") ? "pending" : "not_started",
        enterprise_status: selectedEvidence.includes("organization_verification") ? "pending" : "not_started",
        evidence_count: selectedEvidence.length + (identityUploaded ? 1 : 0),
        launch_phase: "internal_testing",
        annual_renewal_required: true,
        audit_trail_json: JSON.stringify([auditEntry]),
        evidence_json: JSON.stringify(selectedEvidence.map(t => ({ type: t, submitted_date: new Date().toISOString(), status: "pending" }))),
      });
      setSuccess(true);
    } catch (e) {
      setError(e.message || "Failed to submit application.");
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-emerald-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Application Submitted</h1>
        <p className="text-white/50 text-sm mb-6">Your EXEC™ Verified application has been submitted and is now pending review. You will be notified when the review is complete.</p>
        <Link to="/verification" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium transition-colors">
          Back to Verification Center <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link to="/verification" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1 mb-2">
          <ArrowLeft size={12} /> Verification Center
        </Link>
        <h1 className="text-2xl font-bold text-white">Apply for EXEC™ Verified</h1>
        <p className="text-white/40 text-sm mt-1">Verification is free and requires evidence-based review. It cannot be purchased.</p>
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              i < step ? "bg-emerald-500/10 text-emerald-400" : i === step ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/30"
            }`}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-[11px] hidden sm:inline ${i === step ? "text-indigo-400" : "text-white/30"}`}>{s.label}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded ${i < step ? "bg-emerald-500/20" : "bg-white/5"}`} />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/15 text-red-400 text-sm mb-4">
            <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        {/* Step 0: Eligibility */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-indigo-400" />
              <h2 className="text-white font-semibold text-sm">Eligibility Check</h2>
            </div>
            <div className="space-y-2">
              <EligibilityItem label="Email Verified" passed={user?.email_verified ?? true} />
              <EligibilityItem label="Account Active" passed={true} />
              <EligibilityItem label="Profile Started" passed={true} />
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              EXEC™ Verified is a trust framework. It is separate from your subscription plan.
              You may subscribe without being verified, and verification does not require a paid subscription.
            </p>
            <button onClick={() => setStep(1)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Fingerprint size={16} className="text-indigo-400" />
              <h2 className="text-white font-semibold text-sm">Identity Verification</h2>
            </div>
            <p className="text-xs text-white/40">Upload a government-issued ID for identity verification. Accepted: Passport, Driver's License, National ID.</p>
            <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-indigo-500/20 transition-colors cursor-pointer" onClick={() => setIdentityUploaded(!identityUploaded)}>
              {identityUploaded ? (
                <div className="space-y-2">
                  <Check size={24} className="text-emerald-400 mx-auto" />
                  <p className="text-xs text-emerald-400">ID uploaded (placeholder)</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload size={24} className="text-white/30 mx-auto" />
                  <p className="text-xs text-white/40">Click to upload government ID</p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Back</button>
              <button onClick={() => setStep(2)} className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Evidence */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Upload size={16} className="text-indigo-400" />
              <h2 className="text-white font-semibold text-sm">Evidence Submission</h2>
            </div>
            <p className="text-xs text-white/40">Select the types of evidence you can provide. More evidence increases your Evidence Confidence™ score.</p>
            <div className="space-y-2">
              {EVIDENCE_TYPES.filter(t => t.id !== "government_id").map(type => {
                const selected = selectedEvidence.includes(type.id);
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedEvidence(prev => selected ? prev.filter(t => t !== type.id) : [...prev, type.id])}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${selected ? "border-indigo-500/30 bg-indigo-500/5" : "border-white/5 bg-white/[0.01] hover:bg-white/[0.03]"}`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${selected ? "border-indigo-500 bg-indigo-500" : "border-white/20"}`}>
                      {selected && <Check size={12} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white/80 font-medium">{type.name}</div>
                      <div className="text-[11px] text-white/30 mt-0.5">{type.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
                Review <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-indigo-400" />
              <h2 className="text-white font-semibold text-sm">Review & Submit</h2>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-white/[0.02] border border-white/5">
              <ReviewItem label="Government ID" value={identityUploaded ? "Uploaded" : "Not uploaded"} />
              <ReviewItem label="Evidence Types" value={`${selectedEvidence.length} selected`} />
              <ReviewItem label="Applicant" value={user?.email || "—"} />
            </div>
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
              <p className="text-xs text-amber-400">
                By submitting, you agree that your application will undergo AI validation and manual review.
                Verification cannot be purchased and requires evidence-based approval.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Back</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} Submit Application
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EligibilityItem({ label, passed }) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${passed ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
        {passed ? <Check size={12} className="text-emerald-400" /> : <AlertCircle size={12} className="text-amber-400" />}
      </div>
      <span className="text-sm text-white/70 flex-1">{label}</span>
      <span className={`text-xs ${passed ? "text-emerald-400" : "text-amber-400"}`}>{passed ? "Passed" : "Pending"}</span>
    </div>
  );
}

function ReviewItem({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/40">{label}</span>
      <span className="text-xs text-white/70 font-medium">{value}</span>
    </div>
  );
}