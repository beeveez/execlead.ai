import React, { useState } from "react";
import { ArrowLeft, Send, Loader2, Brain, Users, GitCompare, RefreshCw, HelpCircle, ShieldCheck, Lightbulb } from "lucide-react";
import { SCORING_DIMENSIONS, difficultyColor, categoryColor } from "@/lib/decisionLabEngine";

/**
 * ScenarioPlayer — the core Decision Lab experience.
 * Brief → Choose Strategy → Explain → EXEC™ Challenge → Feedback →
 * Compare Alternatives → Perspectives → Reflection → Evidence Recorded.
 */
export default function ScenarioPlayer({ scenario, ld, onExit }) {
  const { evaluate, evaluating, saveAttempt, persistProfile, attempts } = ld;
  const [step, setStep] = useState("brief"); // brief | decide | evaluating | results | reflect
  const [chosen, setChosen] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [result, setResult] = useState(null);
  const [reflection, setReflection] = useState({ sameDecision: "", overlooked: "", surprised: "", changed: "" });

  const submit = async () => {
    setStep("evaluating");
    const res = await evaluate(scenario, chosen, explanation);
    setResult(res);
    setStep("results");
  };

  const finish = async () => {
    const saved = await saveAttempt(scenario, chosen, explanation, result, reflection);
    await persistProfile([saved, ...attempts]);
    onExit();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white"><ArrowLeft size={14} /> Back to Library</button>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${categoryColor(scenario.category)}22`, color: categoryColor(scenario.category) }}>{scenario.category}</span>
          <span className="text-[10px]" style={{ color: difficultyColor(scenario.difficulty) }}>{scenario.difficulty}</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-500/10 to-amber-500/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-white mb-1">{scenario.title}</h2>
        {scenario.business_context && <p className="text-sm text-white/60">{scenario.business_context}</p>}
      </div>

      {step === "brief" && <Brief scenario={scenario} onNext={() => setStep("decide")} />}
      {step === "decide" && (
        <Decide scenario={scenario} chosen={chosen} setChosen={setChosen} explanation={explanation} setExplanation={setExplanation} onSubmit={submit} evaluating={evaluating} />
      )}
      {step === "results" && result && (
        <Results scenario={scenario} chosen={chosen} result={result} onReflect={() => setStep("reflect")} onRedo={() => { setStep("decide"); setResult(null); }} />
      )}
      {step === "reflect" && (
        <Reflect reflection={reflection} setReflection={setReflection} result={result} onFinish={finish} />
      )}
      {evaluating && step === "evaluating" && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 size={28} className="animate-spin text-indigo-400" />
          <p className="text-sm text-white/50">EXEC™ is analyzing your decision…</p>
        </div>
      )}
    </div>
  );
}

function Brief({ scenario, onNext }) {
  return (
    <>
      <Section label="Background" text={scenario.background} />
      <Grid>
        {scenario.constraints?.length > 0 && <List title="Constraints" items={scenario.constraints} />}
        {scenario.stakeholders?.length > 0 && <List title="Stakeholders" items={scenario.stakeholders} />}
        {scenario.risks?.length > 0 && <List title="Risks" items={scenario.risks} />}
        {scenario.unknown_information?.length > 0 && <List title="Unknown Information" items={scenario.unknown_information} />}
      </Grid>
      {scenario.time_pressure && <Section label="Time Pressure" text={scenario.time_pressure} />}
      {scenario.success_criteria?.length > 0 && <List title="Success Criteria" items={scenario.success_criteria} />}
      <button onClick={onNext} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">Analyze & Decide →</button>
    </>
  );
}

function Decide({ scenario, chosen, setChosen, explanation, setExplanation, onSubmit, evaluating }) {
  return (
    <>
      <div>
        <div className="text-[11px] uppercase tracking-wider text-white/40 mb-2">Choose Your Strategy</div>
        <div className="space-y-2">
          {(scenario.strategy_options || []).map((o) => (
            <button key={o.id} onClick={() => setChosen(o)} className={`w-full text-left rounded-xl p-3 border transition-all ${chosen?.id === o.id ? "bg-indigo-500/15 border-indigo-500/40" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}>
              <div className="text-sm font-semibold text-white">{o.name}</div>
              <p className="text-xs text-white/60 mt-1">{o.description}</p>
              {o.trade_offs && <p className="text-[11px] text-amber-400/80 mt-1">Trade-offs: {o.trade_offs}</p>}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-wider text-white/40 mb-2">Explain Your Decision</div>
        <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={5} placeholder="What decision would you make, and why? Walk through your reasoning, trade-offs, and expected outcomes…" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40 resize-none" />
      </div>
      <button onClick={onSubmit} disabled={!chosen || !explanation.trim() || evaluating} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium transition-colors">
        <Send size={14} /> Submit to EXEC™
      </button>
    </>
  );
}

function Results({ scenario, chosen, result, onReflect, onRedo }) {
  return (
    <>
      {/* Decision Scorecard */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">Decision Scorecard</h3>
          <span className="text-3xl font-bold text-white">{result.overall}<span className="text-sm text-white/30">/100</span></span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {SCORING_DIMENSIONS.map((d) => (
            <div key={d.key} className="bg-white/[0.02] rounded-lg p-2">
              <div className="text-[10px] text-white/40">{d.label}</div>
              <div className="text-sm font-semibold" style={{ color: d.color }}>{result.scores?.[d.key] ?? 0}</div>
            </div>
          ))}
        </div>
        <div className="text-xs text-white/40 mb-1">Business Impact</div>
        <p className="text-sm text-white/70 mb-3">{result.business_impact}</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><div className="text-emerald-400 mb-1">Strengths</div>{result.strengths?.map((s, i) => <p key={i} className="text-white/60 py-0.5">• {s}</p>)}</div>
          <div><div className="text-rose-400 mb-1">Blind Spots</div>{result.blind_spots?.map((s, i) => <p key={i} className="text-white/60 py-0.5">• {s}</p>)}</div>
        </div>
      </div>

      {/* EXEC challenges */}
      {result.challenge_questions?.length > 0 && (
        <Panel icon={HelpCircle} color="#f59e0b" title="EXEC™ Challenges Your Assumptions">
          {result.challenge_questions.map((c, i) => (
            <div key={i} className="bg-white/[0.02] rounded-lg p-3 mb-2">
              <p className="text-sm text-white/80">"{c.question}"</p>
              {c.focus && <p className="text-[11px] text-amber-400/70 mt-1">Focus: {c.focus}</p>}
            </div>
          ))}
        </Panel>
      )}

      {/* Perspectives */}
      {result.perspectives?.length > 0 && (
        <Panel icon={Users} color="#0ea5e9" title="Multiple Perspectives">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {result.perspectives.map((p, i) => (
              <div key={i} className="bg-white/[0.02] rounded-lg p-3">
                <div className="text-[11px] text-cyan-400 font-medium mb-1">{p.role}</div>
                <p className="text-xs text-white/60 leading-relaxed">{p.viewpoint}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Comparison */}
      {result.comparison && (
        <Panel icon={GitCompare} color="#a855f7" title="Decision Comparison">
          <div className="space-y-2 text-xs">
            <Comp label="Your Decision" text={result.comparison.your_decision_summary} />
            <Comp label="Alternative" text={result.comparison.alternative_summary} />
            <Comp label="Expert Strategy" text={result.comparison.expert_strategy} />
            <Comp label="AI Recommendation" text={result.comparison.ai_recommendation} accent />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Comp label="Trade-offs" text={result.comparison.trade_offs} />
              <Comp label="Advantages" text={result.comparison.advantages} />
              <Comp label="Risks" text={result.comparison.risks} />
              <Comp label="Expected Outcomes" text={result.comparison.expected_outcomes} />
            </div>
          </div>
        </Panel>
      )}

      {/* Feedback */}
      {result.feedback && (
        <Panel icon={Brain} color="#6366f1" title="EXEC™ Coach Feedback">
          <p className="text-sm text-white/70 leading-relaxed">{result.feedback}</p>
        </Panel>
      )}

      {result.missed_opportunities?.length > 0 && (
        <Panel icon={Lightbulb} color="#eab308" title="Missed Opportunities">
          {result.missed_opportunities.map((m, i) => <p key={i} className="text-sm text-white/60 py-0.5">• {m}</p>)}
        </Panel>
      )}

      <div className="flex gap-2">
        <button onClick={onRedo} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm"><RefreshCw size={14} /> Revise Decision</button>
        <button onClick={onReflect} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium">Reflect →</button>
      </div>
    </>
  );
}

function Reflect({ reflection, setReflection, result, onFinish }) {
  const prompts = result?.reflection_prompts?.length ? result.reflection_prompts : [
    "Would you make the same decision?",
    "What did you overlook?",
    "What feedback surprised you?",
    "How has your thinking changed?",
  ];
  const keys = ["sameDecision", "overlooked", "surprised", "changed"];
  return (
    <>
      <Panel icon={ShieldCheck} color="#10b981" title="Executive Reflection">
        <div className="space-y-3">
          {prompts.slice(0, 4).map((p, i) => (
            <div key={i}>
              <label className="text-xs text-white/60 mb-1 block">{p}</label>
              <textarea value={reflection[keys[i]]} onChange={(e) => setReflection({ ...reflection, [keys[i]]: e.target.value })} rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/40 resize-none" />
            </div>
          ))}
        </div>
      </Panel>
      <button onClick={onFinish} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors">Record Evidence & Complete</button>
    </>
  );
}

/* helpers */
function Section({ label, text }) { return text ? <div><div className="text-[11px] uppercase tracking-wider text-white/40 mb-1">{label}</div><p className="text-sm text-white/70 leading-relaxed mb-4">{text}</p></div> : null; }
function Grid({ children }) { return <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">{children}</div>; }
function List({ title, items }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="text-[11px] uppercase tracking-wider text-white/40 mb-2">{title}</div>
      <ul className="space-y-1">{items.map((x, i) => <li key={i} className="text-sm text-white/70">• {x}</li>)}</ul>
    </div>
  );
}
function Panel({ icon: Icon, color, title, children }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3"><Icon size={15} style={{ color }} /><h3 className="text-white font-semibold text-sm">{title}</h3></div>
      {children}
    </div>
  );
}
function Comp({ label, text, accent }) {
  return text ? <div className={`rounded-lg p-3 ${accent ? "bg-violet-500/10 border border-violet-500/20" : "bg-white/[0.02]"}`}><div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{label}</div><p className="text-white/70">{text}</p></div> : null;
}