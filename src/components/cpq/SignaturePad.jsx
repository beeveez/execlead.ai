import React, { useState } from "react";
import { PenTool, Check } from "lucide-react";

export default function SignaturePad({ onSigned, disabled }) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const canSign = name.trim().length >= 2 && title.trim().length >= 2 && termsAccepted && !disabled;

  const handleSubmit = () => {
    if (!canSign) return;
    onSigned({ name: name.trim(), title: title.trim(), termsAccepted });
  };

  return (
    <div className="space-y-5">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <PenTool size={16} className="text-indigo-400" />
          <h4 className="text-sm font-medium text-white/70">Electronic Signature</h4>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Full Name (Authorized Signatory)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={disabled}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Title / Role</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={disabled}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50"
              placeholder="Chief Human Resources Officer"
            />
          </div>
        </div>

        {/* Signature Preview */}
        {name.trim() && (
          <div className="mt-4 p-4 bg-white rounded-lg border-2 border-dashed border-white/10">
            <div className="text-[10px] text-black/30 uppercase tracking-widest mb-1">Signature</div>
            <div className="text-2xl text-black/80 italic" style={{ fontFamily: "'Brush Script MT', cursive" }}>
              {name}
            </div>
            {title.trim() && <div className="text-xs text-black/40 mt-1">{title}</div>}
          </div>
        )}
      </div>

      {/* Terms Acceptance */}
      <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${termsAccepted ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}>
        <button
          type="button"
          onClick={() => setTermsAccepted(!termsAccepted)}
          disabled={disabled}
          className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${termsAccepted ? "bg-emerald-500 text-white" : "bg-white/10 border border-white/20"}`}
        >
          {termsAccepted && <Check size={12} />}
        </button>
        <span className="text-xs text-white/50 leading-relaxed">
          I agree to the <strong className="text-white/70">Master Service Agreement</strong> and <strong className="text-white/70">Subscription Agreement</strong> associated with this proposal. I confirm that I am authorized to sign on behalf of the organization. My electronic signature is legally binding under the ESIGN Act and UETA.
        </span>
      </label>

      <button
        onClick={handleSubmit}
        disabled={!canSign}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
      >
        <PenTool size={16} />
        Sign Contract & Accept Terms
      </button>
    </div>
  );
}