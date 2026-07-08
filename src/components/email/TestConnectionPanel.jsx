import React, { useState } from "react";
import { testEmailConnection } from "@/lib/emailProvider";
import { Send, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

export default function TestConnectionPanel({ settings, userEmail, onTested }) {
  const [testEmail, setTestEmail] = useState(userEmail || "");
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    try {
      const res = await testEmailConnection(testEmail);
      setResult(res);
      if (onTested) onTested();
    } catch (e) {
      setResult({ success: false, message: e?.message || "Failed to test connection" });
    }
    setTesting(false);
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50";

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 space-y-5">
      <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Test Connection</h3>
      <p className="text-white/40 text-sm">Send a test email to verify your provider configuration is working correctly.</p>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={testEmail}
          onChange={e => setTestEmail(e.target.value)}
          placeholder="recipient@example.com"
          className={inputClass}
        />
        <button
          onClick={handleTest}
          disabled={testing || !testEmail}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
        >
          {testing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send Test Email
        </button>
      </div>

      {settings?.last_tested_at && (
        <div className="flex items-center gap-2 text-xs text-white/30">
          <Clock size={12} /> Last tested: {new Date(settings.last_tested_at).toLocaleString()}
          {settings.last_test_result && <span className="text-white/20">— {settings.last_test_result}</span>}
        </div>
      )}

      {result && (
        <div className={`rounded-lg p-4 border ${result.success ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
          <div className="flex items-start gap-3">
            {result.success
              ? <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              : <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            }
            <div>
              <div className={`font-medium text-sm ${result.success ? "text-emerald-400" : "text-red-400"}`}>
                {result.success ? "Connected" : "Connection Failed"}
              </div>
              <div className="text-white/50 text-sm mt-1 break-words">{result.message}</div>
              {result.provider && <div className="text-white/30 text-xs mt-1">Provider: {result.provider}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}