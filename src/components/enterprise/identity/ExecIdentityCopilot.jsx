import React, { useState } from "react";
import { Sparkles, Send, Loader2, AlertTriangle, Users, ShieldCheck, Activity, FileText, KeyRound } from "lucide-react";
import { base44 } from "@/api/base44Client";

const QUICK_PROMPTS = [
  { icon: AlertTriangle, label: "Show sync errors" },
  { icon: Users, label: "Show users without licenses" },
  { icon: ShieldCheck, label: "Show failed logins" },
  { icon: KeyRound, label: "Show MFA adoption" },
  { icon: FileText, label: "Generate SCIM report" },
  { icon: Activity, label: "Show identity health" },
];

export default function ExecIdentityCopilot({ organization, stats }) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const ask = async (prompt) => {
    if (!prompt) return;
    setLoading(true);
    setResponse(null);
    try {
      const context = `You are EXEC™, the identity copilot for EXECLEAD.AI Enterprise Identity™. Organization: ${organization?.name || "platform"}. Identity stats: ${JSON.stringify(stats || {})}. Answer the admin's identity question concisely and practically — covering providers, SSO, SCIM provisioning, group sync, identity security, and license automation. If data is unavailable, explain what to check in the identity dashboard.`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt: `${context}\n\nAdmin question: ${prompt}`, add_context_from_internet: false });
      setResponse(typeof res === "string" ? res : res?.output || JSON.stringify(res));
    } catch (e) { setResponse("I couldn't process that request right now. Please try again."); }
    finally { setLoading(false); }
  };

  const send = () => { if (input.trim()) { ask(input.trim()); setInput(""); } };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2"><Sparkles size={16} className="text-indigo-400" /><h3 className="text-white font-medium">EXEC™ Identity Copilot</h3></div>
        <p className="text-white/50 text-sm">EXEC™ understands identity — providers, SSO, SCIM provisioning, group sync, security, and license automation. Ask about sync errors, license gaps, MFA adoption, or generate identity reports.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((p) => (
          <button key={p.label} onClick={() => ask(p.label)} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs transition-colors disabled:opacity-50">
            <p.icon size={12} /> {p.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask EXEC™ about enterprise identity..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500" />
        <button onClick={send} disabled={loading || !input.trim()} className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium flex items-center gap-2">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Ask
        </button>
      </div>

      {response && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><Sparkles size={12} className="text-indigo-400" /><span className="text-white/40 text-xs uppercase tracking-wider">EXEC™ Response</span></div>
          <div className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">{response}</div>
        </div>
      )}
    </div>
  );
}