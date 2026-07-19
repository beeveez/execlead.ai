import React, { useState, useEffect } from "react";
import { KeyRound, X, Download, Printer, Copy, RefreshCw, Check, AlertTriangle, Loader2 } from "lucide-react";

const STORAGE_KEY = "execlead_backup_codes_v1";
const CODE_COUNT = 10;

function loadStored() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function saveStored(codes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ codes, generated_at: new Date().toISOString() }));
}

function clearStored() {
  localStorage.removeItem(STORAGE_KEY);
}

function generateCodes() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const array = new Uint8Array(CODE_COUNT * 8);
  crypto.getRandomValues(array);
  const codes = [];
  for (let i = 0; i < CODE_COUNT; i++) {
    let code = "";
    for (let j = 0; j < 8; j++) {
      code += chars[array[i * 8 + j] % chars.length];
      if (j === 3) code += "-";
    }
    codes.push(code);
  }
  return codes;
}

export default function BackupCodesDrawer({ onClose }) {
  const [stored, setStored] = useState(null);
  const [copied, setCopied] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setStored(loadStored());
  }, []);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const codes = generateCodes();
      saveStored(codes);
      setStored({ codes, generated_at: new Date().toISOString() });
      setGenerating(false);
      setConfirmRegen(false);
    }, 400);
  };

  const handleCopy = () => {
    if (!stored?.codes) return;
    const text = stored.codes.join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    if (!stored?.codes) return;
    const content = `EXECLEAD.AI — Backup Recovery Codes\nGenerated: ${new Date(stored.generated_at).toLocaleString()}\n\n${stored.codes.join("\n")}\n\nKeep these codes safe. Each code can be used once.\nIf you regenerate, all previous codes are invalidated.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "execlead-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!stored?.codes) return;
    const win = window.open("", "_blank", "width=600,height=600");
    if (!win) return;
    win.document.write(`
      <html><head><title>EXECLEAD.AI Backup Codes</title>
      <style>
        body { font-family: monospace; padding: 40px; }
        h1 { font-size: 18px; }
        .codes { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 20px; }
        .code { font-size: 16px; padding: 8px; border: 1px solid #ccc; text-align: center; }
      </style></head><body>
      <h1>EXECLEAD.AI — Backup Recovery Codes</h1>
      <p>Generated: ${new Date(stored.generated_at).toLocaleString()}</p>
      <div class="codes">${stored.codes.map(c => `<div class="code">${c}</div>`).join("")}</div>
      <p style="margin-top:20px;font-size:12px;color:#666;">Keep these codes safe. Each code can be used once.</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const handleRegenerate = () => {
    setConfirmRegen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#0d0d14] z-10">
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-indigo-400" />
            <h2 className="text-white font-semibold">Backup Codes™</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Empty state */}
          {!stored?.codes && (
            <div className="text-center py-8">
              {generating ? (
                <Loader2 size={32} className="animate-spin text-indigo-400 mx-auto mb-3" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <KeyRound size={24} className="text-white/30" />
                </div>
              )}
              <p className="text-white/50 text-sm mb-1">No backup codes generated yet.</p>
              <p className="text-white/30 text-xs mb-4 max-w-xs mx-auto">
                Generate single-use codes you can use to recover your account if you lose access to your email or phone.
              </p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {generating ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                Generate Backup Codes
              </button>
            </div>
          )}

          {/* Codes displayed */}
          {stored?.codes && !confirmRegen && (
            <>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
                <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                <span className="text-amber-400 text-xs">
                  Store these codes securely. Each code can only be used once.
                  Generated {new Date(stored.generated_at).toLocaleString()}.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {stored.codes.map((code, i) => (
                  <div key={i} className="flex items-center justify-center py-2.5 rounded-lg bg-white/[0.03] border border-white/5 font-mono text-sm text-white/80 tracking-wider">
                    {code}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={handleDownload}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] text-white/60 hover:text-white/80 transition-colors"
                >
                  <Download size={14} />
                  <span className="text-[10px]">Download</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] text-white/60 hover:text-white/80 transition-colors"
                >
                  <Printer size={14} />
                  <span className="text-[10px]">Print</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] text-white/60 hover:text-white/80 transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span className="text-[10px]">{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={handleRegenerate}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 text-amber-400 transition-colors"
                >
                  <RefreshCw size={14} />
                  <span className="text-[10px]">Regenerate</span>
                </button>
              </div>
            </>
          )}

          {/* Regenerate warning */}
          {stored?.codes && confirmRegen && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-4 rounded-lg bg-red-500/5 border border-red-500/15">
                <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
                <div className="text-sm text-red-400">
                  <div className="font-medium mb-1">Regenerate Backup Codes?</div>
                  <p className="text-xs text-red-300/80">
                    This will invalidate all existing backup codes. Any previously generated codes will no longer work.
                    Make sure you've stored the current codes if you still need them.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmRegen(false)}
                  className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5">
          <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">
            Return to Security Center
          </button>
        </div>
      </div>
    </div>
  );
}