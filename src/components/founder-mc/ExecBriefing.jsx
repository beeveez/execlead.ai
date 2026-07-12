import React from "react";
import SectionCard from "./SectionCard";
import { Brain, RefreshCw, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import { buildBriefingPrompt } from "@/lib/founderMissionControl";

export default function ExecBriefing({ snapshot }) {
  const [briefing, setBriefing] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const generate = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: buildBriefingPrompt(snapshot),
        model: "automatic",
      });
      setBriefing(typeof res === "string" ? res : JSON.stringify(res));
    } catch (e) {
      setError(e?.message || "Failed to generate briefing");
    } finally {
      setLoading(false);
    }
  }, [snapshot]);

  React.useEffect(() => { generate(); }, [generate]);

  return (
    <SectionCard
      title="EXEC™ Daily Briefing"
      subtitle="AI-generated founder briefing"
      icon={Brain}
      accent="violet"
      action={
        <button onClick={generate} disabled={loading}
          className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 disabled:opacity-40">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          {loading ? "Generating…" : "Refresh"}
        </button>
      }
    >
      {loading && !briefing && (
        <div className="flex items-center gap-2 text-white/40 text-sm py-4">
          <Sparkles size={14} className="text-violet-400 animate-pulse" />
          EXEC™ is analyzing platform telemetry…
        </div>
      )}
      {error && <div className="text-red-400 text-sm py-2">{error}</div>}
      {briefing && (
        <div className="text-sm prose prose-invert prose-sm max-w-none text-white/70">
          <ReactMarkdown>{briefing}</ReactMarkdown>
        </div>
      )}
    </SectionCard>
  );
}