import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { validateLogoUrl } from "@/lib/companyLogo";
import CompanyLogo from "@/components/companies/CompanyLogo";
import { RefreshCw, Link2, Upload, Sparkles, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const STATUS_LABELS = {
  valid: { label: "Valid", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  invalid: { label: "Broken", color: "text-red-400", bg: "bg-red-500/10" },
  missing: { label: "Missing", color: "text-amber-400", bg: "bg-amber-500/10" },
  pending: { label: "Pending", color: "text-blue-400", bg: "bg-blue-500/10" },
};

export default function LogoRepairPanel({ company, onUpdated, onClose }) {
  const [busy, setBusy] = useState(null);
  const [newUrl, setNewUrl] = useState("");
  const [message, setMessage] = useState(null);

  const updateLogo = async (logoUrl, logoStatus, logoError) => {
    const updated = await base44.entities.Company.update(company.id, {
      logo_url: logoUrl,
      logo_status: logoStatus,
      logo_validated_at: new Date().toISOString(),
      logo_error: logoError || "",
    });
    onUpdated?.(updated);
    return updated;
  };

  const handleRetry = async () => {
    setBusy("retry");
    setMessage(null);
    const result = await validateLogoUrl(company.logo_url);
    if (result.valid) {
      await updateLogo(company.logo_url, "valid", "");
      setMessage({ type: "success", text: "Logo validated successfully." });
    } else {
      await updateLogo(company.logo_url, "invalid", result.error);
      setMessage({ type: "error", text: result.error });
    }
    setBusy(null);
  };

  const handleReplace = async () => {
    if (!newUrl.trim()) return;
    setBusy("replace");
    setMessage(null);
    const result = await validateLogoUrl(newUrl.trim());
    if (result.valid) {
      await updateLogo(newUrl.trim(), "valid", "");
      setNewUrl("");
      setMessage({ type: "success", text: "Logo replaced successfully." });
    } else {
      await updateLogo(newUrl.trim(), "invalid", result.error);
      setMessage({ type: "error", text: result.error });
    }
    setBusy(null);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy("upload");
    setMessage(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await validateLogoUrl(file_url);
      await updateLogo(file_url, result.valid ? "valid" : "invalid", result.error);
      setMessage(result.valid
        ? { type: "success", text: "Logo uploaded successfully." }
        : { type: "error", text: result.error });
    } catch (err) {
      setMessage({ type: "error", text: "Upload failed. Please try again." });
    }
    setBusy(null);
  };

  const handleGenerate = async () => {
    setBusy("generate");
    setMessage(null);
    try {
      const prompt = `Professional minimalist company logo for "${company.name}", ${company.industry || "corporate"} industry, clean vector style, centered on solid white background, no text`;
      const { url } = await base44.integrations.Core.GenerateImage({ prompt });
      await updateLogo(url, "valid", "");
      setMessage({ type: "success", text: "Placeholder logo generated." });
    } catch (err) {
      setMessage({ type: "error", text: "Generation failed. Try another method." });
    }
    setBusy(null);
  };

  const st = STATUS_LABELS[company.logo_status] || STATUS_LABELS.pending;

  const actions = [
    { id: "retry", label: "Retry Download", desc: "Re-validate the current logo URL", icon: RefreshCw, onClick: handleRetry },
    { id: "upload", label: "Upload Logo", desc: "Upload an image file from your device", icon: Upload, onClick: () => {}, fileInput: true },
    { id: "generate", label: "Generate Placeholder", desc: "AI-generate a placeholder logo", icon: Sparkles, onClick: handleGenerate },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <RefreshCw size={18} className="text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Logo Repair — {company.name}</h3>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Current state */}
          <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <CompanyLogo company={company} size="xl" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Current Status</div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.bg} ${st.color}`}>{st.label}</span>
                {company.logo_validated_at && (
                  <span className="text-xs text-white/30">Validated {new Date(company.logo_validated_at).toLocaleDateString()}</span>
                )}
              </div>
              {company.logo_error && <p className="text-xs text-red-400/70 mt-1.5">{company.logo_error}</p>}
              {company.logo_url && <p className="text-xs text-white/30 truncate mt-1.5">{company.logo_url}</p>}
            </div>
          </div>

          {message && (
            <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${message.type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </div>
          )}

          {/* Replace URL */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-white/70 mb-2"><Link2 size={14} /> Replace Logo URL</label>
            <div className="flex gap-2">
              <input
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
              <button
                onClick={handleReplace}
                disabled={busy === "replace" || !newUrl.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white rounded-lg text-sm font-medium"
              >
                {busy === "replace" ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />} Replace
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 gap-2">
            {actions.map(action => {
              const inner = (
                <>
                  {busy === action.id ? <Loader2 size={16} className="animate-spin text-indigo-400" /> : <action.icon size={16} className="text-white/50" />}
                  <div>
                    <div className="text-sm font-medium text-white/80">{action.label}</div>
                    <div className="text-xs text-white/30">{action.desc}</div>
                  </div>
                </>
              );
              if (action.fileInput) {
                return (
                  <label key={action.id} className={`flex items-center gap-3 px-4 py-3 bg-white/[0.02] hover:bg-white/5 border border-white/5 rounded-lg text-left cursor-pointer ${busy !== null ? "opacity-40 pointer-events-none" : ""} transition-colors`}>
                    {inner}
                    <input type="file" accept="image/svg+xml,image/png,image/webp,image/jpeg" className="hidden" onChange={handleUpload} />
                  </label>
                );
              }
              return (
                <button key={action.id} onClick={action.onClick} disabled={busy !== null} className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] hover:bg-white/5 border border-white/5 rounded-lg text-left disabled:opacity-40 transition-colors">
                  {inner}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}