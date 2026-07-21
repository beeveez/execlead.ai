import React from 'react';
import { Zap, CheckCircle2, Lock } from 'lucide-react';

export default function PromptLocalizationSection({ promptContext }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <Zap size={16} className="text-violet-400" />
        <h3 className="text-sm font-semibold text-white">Prompt Localization™</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 ml-auto">{promptContext.injectionRate}% Injection Rate</span>
      </div>
      <p className="text-xs text-white/40 mb-4 leading-relaxed">{promptContext.description}</p>

      <div className="space-y-1.5">
        {promptContext.fields.map((field) => (
          <div key={field.key} className="flex items-center gap-3 bg-white/[0.02] rounded-lg p-2.5 border border-white/5">
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
              {field.injected ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Lock size={14} className="text-white/30" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white font-medium">{field.label}</span>
                {field.required && <span className="text-[9px] text-rose-400">Required</span>}
              </div>
              <div className="text-[10px] text-white/30 truncate">{field.value}</div>
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded ${field.injected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/30'}`}>
              {field.injected ? 'Injected' : 'Manual'}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="bg-white/[0.02] rounded-lg p-2 text-center border border-white/5">
          <div className="text-sm font-bold text-emerald-400">{promptContext.policyEnforcement}</div>
          <div className="text-[9px] text-white/30">Policy Enforcement</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-2 text-center border border-white/5">
          <div className="text-sm font-bold text-white">{promptContext.preservesReasoning ? 'Yes' : 'No'}</div>
          <div className="text-[9px] text-white/30">Preserves Reasoning</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-2 text-center border border-white/5">
          <div className="text-sm font-bold text-white">{promptContext.preservesBusinessLogic ? 'Yes' : 'No'}</div>
          <div className="text-[9px] text-white/30">Preserves Logic</div>
        </div>
      </div>
    </div>
  );
}