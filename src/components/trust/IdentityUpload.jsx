import React, { useState } from "react";
import { Upload, FileText, Loader2, AlertCircle, CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { DOCUMENT_TYPES, IDENTITY_STATUSES, ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_MB } from "@/lib/trustEngine";
import { validateFileUpload } from "@/lib/fileUploadSecurity";

export default function IdentityUpload({ verification, onUpdate }) {
  const { user } = useAuth();
  const [docType, setDocType] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const status = verification?.identity_status || "pending_upload";
  const statusMeta = IDENTITY_STATUSES[status];

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const securityCheck = validateFileUpload(f);
    if (!securityCheck.valid) {
      setError(securityCheck.error);
      return;
    }
    if (!ACCEPTED_FILE_TYPES.includes(f.type)) {
      setError("Only PNG, JPEG, and PDF files are accepted.");
      return;
    }
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size must be under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setError("");
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file || !docType) return;
    setUploading(true);
    setError("");
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.IdentityVerification.update(verification.id, {
        identity_document_type: docType,
        identity_document_uri: file_uri,
        identity_status: "submitted",
        identity_submitted_date: new Date().toISOString(),
        identity_rejection_reason: "",
      });
      await base44.entities.VerificationLog.create({
        verification_id: verification.id,
        user_id: verification.user_id,
        user_name: verification.user_name,
        action: "identity_submitted",
        document_type: docType,
        submitted_date: new Date().toISOString(),
        decision: "pending",
        notes: `Document uploaded: ${file.name}`,
      });
      setFile(null);
      setDocType("");
      onUpdate();
    } catch (e) {
      setError(e.message || "Upload failed. Please try again.");
    }
    setUploading(false);
  };

  // If already verified or under review, show status instead of upload form
  if (status === "verified" || verification?.identity_verified) {
    return (
      <div className="bg-emerald-500/[0.04] border border-emerald-500/15 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <CheckCircle size={20} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">✓ Identity Verified</h3>
            <p className="text-white/40 text-xs mt-0.5">
              Verified using government-issued identification.
              {verification.identity_verified_date && ` Verified on: ${new Date(verification.identity_verified_date).toLocaleDateString()}.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "submitted" || status === "under_review") {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <ShieldCheck size={20} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Identity Under Review</h3>
            <p className="text-white/40 text-xs mt-0.5">
              Your document is being reviewed. You'll be notified when verification is complete.
            </p>
          </div>
        </div>
        {verification.identity_document_type && (
          <p className="text-white/30 text-xs">
            Document: {DOCUMENT_TYPES.find(d => d.id === verification.identity_document_type)?.label || verification.identity_document_type}
            {verification.identity_submitted_date && ` · Submitted: ${new Date(verification.identity_submitted_date).toLocaleDateString()}`}
          </p>
        )}
      </div>
    );
  }

  // Rejection — show reason and allow resubmission
  const isRejected = status === "rejected";

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Upload size={16} className="text-indigo-400" />
        <h3 className="text-white font-semibold text-sm">Identity Verification Upload</h3>
      </div>

      {isRejected && verification.identity_rejection_reason && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-500/[0.05] border border-red-500/15 rounded-lg">
          <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 text-xs font-medium">Verification Rejected</p>
            <p className="text-white/40 text-xs mt-0.5">{verification.identity_rejection_reason}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Document Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DOCUMENT_TYPES.map(doc => (
              <button
                key={doc.id}
                onClick={() => setDocType(doc.id)}
                className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  docType === doc.id
                    ? "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {doc.label}
                {doc.optional && <span className="block text-[10px] text-white/30 mt-0.5">Optional</span>}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Upload Document</label>
          <label className="flex flex-col items-center justify-center gap-2 w-full h-28 bg-white/[0.02] border border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/[0.04] transition-colors">
            {file ? (
              <>
                <FileText size={20} className="text-indigo-400" />
                <span className="text-xs text-white/70">{file.name}</span>
                <span className="text-[10px] text-white/30">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </>
            ) : (
              <>
                <Upload size={20} className="text-white/30" />
                <span className="text-xs text-white/40">Click to select a file</span>
                <span className="text-[10px] text-white/20">PNG, JPEG, PDF · Max {MAX_FILE_SIZE_MB}MB</span>
              </>
            )}
            <input type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className="flex items-start gap-2 p-2.5 bg-white/[0.02] border border-white/5 rounded-lg">
          <ShieldCheck size={12} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-white/30 text-[11px] leading-relaxed">
            Your document is encrypted and stored securely. Only authorized reviewers can access it.
            Document numbers are never displayed publicly — only your verified status is shown.
          </p>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || !docType || uploading}
          className="w-full h-11 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : <><Upload size={16} /> Submit for Verification</>}
        </button>
      </div>
    </div>
  );
}