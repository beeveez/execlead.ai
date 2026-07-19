import React from "react";
import SectionCard from "./SectionCard";
import { Cpu } from "lucide-react";

function AIMetric({ label, value, score }) {
  const s = score != null ? score : 0;
  const color = s >= 90 ? "#10b981" : s >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(s, 100)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function AIIntelligence({ aiIntelligence }) {
  return (
    <SectionCard
      title="AI Intelligence"
      subtitle={`EXEC™ Cognitive Score: ${aiIntelligence.cognitiveScore} · ${aiIntelligence.cognitiveTier} · Knowledge v${aiIntelligence.knowledgeVersion} · Prompt v${aiIntelligence.promptVersion}`}
      icon={Cpu}
      accent="violet"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AIMetric label="Knowledge Coverage" value={`${aiIntelligence.knowledgeCoverage}%`} score={aiIntelligence.knowledgeCoverage} />
        <AIMetric label="Prompt Health" value={`${aiIntelligence.promptHealth}%`} score={aiIntelligence.promptHealth} />
        <AIMetric label="Evidence Coverage" value={`${aiIntelligence.evidenceCoverage}%`} score={aiIntelligence.evidenceCoverage} />
        <AIMetric label="Reasoning Quality" value={`${aiIntelligence.reasoningQuality}%`} score={aiIntelligence.reasoningQuality} />
        <AIMetric label="Recommendation Quality" value={`${aiIntelligence.recommendationQuality}%`} score={aiIntelligence.recommendationQuality} />
        <AIMetric label="EXEC™ Confidence" value={`${aiIntelligence.execConfidence}%`} score={aiIntelligence.execConfidence} />
        <AIMetric label="Response Quality" value={`${aiIntelligence.responseQuality}%`} score={aiIntelligence.responseQuality} />
        <AIMetric label="Cognitive Score" value={`${aiIntelligence.cognitiveScore}%`} score={aiIntelligence.cognitiveScore} />
      </div>
    </SectionCard>
  );
}