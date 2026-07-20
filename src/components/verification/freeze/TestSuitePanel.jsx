import React, { useState } from "react";
import { FlaskConical, CheckCircle2, XCircle, ChevronDown, ChevronRight, Loader2 } from "lucide-react";

export default function TestSuitePanel({ results }) {
  const [expanded, setExpanded] = useState(null);

  if (!results) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex items-center justify-center gap-2 text-white/40 text-sm">
        <Loader2 size={16} className="animate-spin" /> Running test suite...
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <FlaskConical size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white/80">Automated Test Suite</h3>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ml-auto ${results.allPassed ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
          {results.passed}/{results.total} Passed
        </span>
      </div>
      <div className="space-y-1">
        {results.results.map((test) => {
          const isOpen = expanded === test.id;
          return (
            <div key={test.id} className="rounded-lg border border-white/5 overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : test.id)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-white/[0.02] transition-colors"
              >
                {isOpen ? <ChevronDown size={12} className="text-white/30" /> : <ChevronRight size={12} className="text-white/30" />}
                {test.passed ? <CheckCircle2 size={13} className="text-emerald-400" /> : <XCircle size={13} className="text-red-400" />}
                <span className="text-xs text-white/60 font-medium">{test.label}</span>
                <span className="text-[9px] text-white/20 ml-auto capitalize">{test.category}</span>
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pt-1 space-y-1.5">
                  <p className="text-[10px] text-white/30 mb-1">{test.desc}</p>
                  {test.assertions?.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px]">
                      {a.passed ? <CheckCircle2 size={11} className="text-emerald-400 shrink-0 mt-0.5" /> : <XCircle size={11} className="text-red-400 shrink-0 mt-0.5" />}
                      <span className={a.passed ? "text-white/50" : "text-red-400/70"}>{a.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}