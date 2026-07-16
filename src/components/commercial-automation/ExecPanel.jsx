import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles, Loader2, Mail, FileText, TrendingUp, Shield, Calendar, Target, User } from "lucide-react";

const COMMANDS = [
  { id: "show_priorities", label: "Show Today's Priorities", icon: Target, desc: "View top commercial priorities" },
  { id: "who_to_contact", label: "Who Should I Contact First?", icon: User, desc: "Identify the most urgent contact" },
  { id: "generate_followup_email", label: "Generate Follow-up Email", icon: Mail, desc: "Draft a personalized follow-up email" },
  { id: "generate_enterprise_proposal", label: "Generate Enterprise Proposal", icon: FileText, desc: "Create an enterprise proposal outline" },
  { id: "generate_upgrade_campaign", label: "Generate Upgrade Campaign", icon: TrendingUp, desc: "Create an upgrade email campaign" },
  { id: "generate_retention_campaign", label: "Generate Retention Campaign", icon: Shield, desc: "Create a retention email campaign" },
  { id: "generate_weekly_briefing", label: "Generate Weekly Founder Briefing", icon: Calendar, desc: "Create a weekly executive summary" },
];

export default function ExecPanel() {
  const { toast } = useToast();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeCommand, setActiveCommand] = useState(null);

  const runCommand = async (cmd) => {
    setLoading(true);
    setActiveCommand(cmd.id);
    setResult(null);
    try {
      const res = await base44.functions.invoke("commercialAutomationEngine", { action: "exec_command", command: cmd.id });
      setResult(res.data);
    } catch (e) {
      toast({ title: "EXEC™ Command Failed", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><Sparkles size={18} className="text-indigo-400" /> EXEC™ Commercial Assistant</h2>
        <p className="text-xs text-white/40 mt-0.5">Execute commercial actions with AI-powered recommendations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {COMMANDS.map((cmd) => {
          const Icon = cmd.icon;
          const isActive = activeCommand === cmd.id && loading;
          return (
            <button
              key={cmd.id}
              onClick={() => runCommand(cmd)}
              disabled={loading}
              className={`p-3 rounded-xl border text-left transition-all disabled:opacity-40 ${isActive ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                {isActive ? <Loader2 size={14} className="animate-spin text-indigo-400" /> : <Icon size={14} className="text-indigo-400" />}
                <span className="text-xs font-medium text-white">{cmd.label}</span>
              </div>
              <p className="text-[10px] text-white/40">{cmd.desc}</p>
            </button>
          );
        })}
      </div>

      {result && (
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-sm font-semibold text-white">EXEC™ Response</span>
          </div>
          <div className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{result.response}</div>
        </div>
      )}
    </div>
  );
}