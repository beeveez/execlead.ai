import React, { useState, useEffect } from 'react';
import { Save, History, Check, RefreshCw, ShieldCheck, FlaskConical, BarChart3, Award, FileText, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { EXECUTION_STEPS } from '@/lib/remediationEngine';

const STEP_ICONS = { Save, History, Check, RefreshCw, ShieldCheck, FlaskConical, BarChart3, Award, ShieldCheck, FileText };

export default function PatchExecutionProgress({ executing, result, blocker }) {
  const [currentStep, setCurrentStep] = useState(executing ? 0 : EXECUTION_STEPS.length);

  useEffect(() => {
    if (!executing) return;
    setCurrentStep(0);
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= EXECUTION_STEPS.length - 1) {
          clearInterval(interval);
          return EXECUTION_STEPS.length;
        }
        return prev + 1;
      });
    }, 180);
    return () => clearInterval(interval);
  }, [executing]);

  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Patch Execution Pipeline</h4>
        <div className="space-y-2">
          {EXECUTION_STEPS.map((step, i) => {
            const Icon = STEP_ICONS[step.icon] || Check;
            const isActive = executing && i === currentStep;
            const isDone = i < currentStep || (!executing && result);
            const isPending = !isDone && !isActive;
            return (
              <div key={step.id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isActive ? 'bg-indigo-500/10' : ''}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isDone ? 'bg-emerald-500/10 text-emerald-400' : isActive ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/5 text-white/20'
                }`}>
                  {isActive ? <Loader2 size={12} className="animate-spin" /> : isDone ? <CheckCircle2 size={12} /> : <Icon size={12} />}
                </div>
                <span className={`text-xs ${isDone ? 'text-white/50' : isActive ? 'text-white' : 'text-white/30'}`}>{step.label}</span>
                {isActive && <span className="ml-auto text-[10px] text-indigo-400 animate-pulse">Running…</span>}
                {isDone && <CheckCircle2 size={10} className="ml-auto text-emerald-400/50" />}
              </div>
            );
          })}
        </div>
      </div>

      {result && (
        <>
          <ValidationResults result={result.validation} />
          <CertificationResults result={result.certification} />
        </>
      )}

      {!executing && !result && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
          <ShieldCheck className="mx-auto text-white/20 mb-3" size={32} />
          <p className="text-white/40 text-sm">Execute the patch from the Action Center to start the remediation pipeline.</p>
        </div>
      )}
    </div>
  );
}

function ValidationResults({ result }) {
  if (!result) return null;
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        {result.passed ? <CheckCircle2 size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-red-400" />}
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Post-Patch Validation</h4>
        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${result.passed ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
          {result.passed ? 'PASSED' : 'FAILED'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {result.checks.map((c) => (
          <div key={c.id} className="flex items-center gap-1.5 text-[10px] text-white/40">
            {c.passed ? <CheckCircle2 size={8} className="text-emerald-400" /> : <XCircle size={8} className="text-red-400" />}
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificationResults({ result }) {
  if (!result) return null;
  const entries = Object.entries(result).filter(([k]) => !['passed', 'status'].includes(k));
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Award size={14} className={result.passed ? 'text-emerald-400' : 'text-amber-400'} />
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Auto-Certification</h4>
        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${result.passed ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
          {result.status === 'certified' ? 'CERTIFIED' : 'NEEDS REVIEW'}
        </span>
      </div>
      <div className="space-y-1">
        {entries.map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            {val.passed ? <CheckCircle2 size={10} className="text-emerald-400" /> : <XCircle size={10} className="text-red-400" />}
            <span className="text-white/50 capitalize">{key.replace(/_/g, ' ')}</span>
            <span className="text-white/30 ml-auto text-[10px]">{val.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}