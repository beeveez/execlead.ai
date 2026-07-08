import React from "react";
import { FileText, Code2 } from "lucide-react";

const PROMPTS = [
  { name: 'Executive Chief of Staff', agent: 'executive_chief_of_staff', variables: ['executive_context', 'task', 'priorities'] },
  { name: 'Career AI', agent: 'career_ai', variables: ['resume', 'career_goals', 'job_target'] },
  { name: 'Executive Coach', agent: 'executive_coach', variables: ['leadership_dna', 'challenge'] },
  { name: 'Interview AI', agent: 'interview_ai', variables: ['role', 'seniority', 'interview_type'] },
  { name: 'Board Advisor', agent: 'board_advisor', variables: ['company', 'strategy_context', 'deliverable'] },
  { name: 'Leadership DNA AI', agent: 'leadership_dna_ai', variables: ['activity_data', 'competencies'] },
];

export default function PromptLibrary() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">Prompt Library</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROMPTS.map(p => (
          <div key={p.agent} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={14} className="text-indigo-400" />
              <span className="text-white font-medium text-sm">{p.name}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {p.variables.map(v => (
                <span key={v} className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 font-mono">
                  <Code2 size={8} /> {v}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}