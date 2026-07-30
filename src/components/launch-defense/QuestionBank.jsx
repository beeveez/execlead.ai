import React, { useState, useMemo } from "react";
import { Search, X, Send, Loader2, BookOpen, AlertCircle } from "lucide-react";
import { QUESTION_CATEGORIES, SCORING_DIMENSIONS, difficultyColor } from "@/lib/launchDefenseEngine";

/**
 * QuestionBank™ — searchable, filterable question knowledge base with a
 * detail drawer showing purpose, suggested answers, evidence, follow-ups,
 * common mistakes, and inline AI-scored practice.
 */
export default function QuestionBank({ ld }) {
  const { questions, scoreAnswer, saveAttempt, scoring } = ld;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [selected, setSelected] = useState(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);

  const filtered = useMemo(() => {
    return questions.filter((x) => {
      const matchCat = cat === "All" || x.category === cat;
      const matchQ = !q || (x.question || "").toLowerCase().includes(q.toLowerCase());
      return matchCat && matchQ;
    });
  }, [questions, q, cat]);

  const practice = async () => {
    if (!answer.trim() || !selected) return;
    const res = await scoreAnswer(answer, { question: selected.question, persona: selected.audience, category: selected.category });
    setResult(res);
    await saveAttempt({
      question_id: selected.question_id,
      question: selected.question,
      category: selected.category,
      persona: selected.audience,
      answer,
      scores_json: JSON.stringify(res.scores || {}),
      feedback: res.feedback || "",
      overall_score: res.overall || 0,
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions…" className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
          <option>All</option>
          {QUESTION_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((x) => (
          <button key={x.id} onClick={() => { setSelected(x); setResult(null); setAnswer(""); }} className="text-left bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300">{x.category}</span>
              <span className="text-[10px]" style={{ color: difficultyColor(x.difficulty) }}>{x.difficulty}</span>
            </div>
            <p className="text-sm text-white/80 leading-snug">{x.question}</p>
            <div className="text-[11px] text-white/30 mt-2">{x.audience || "General"} · {x.question_id}</div>
          </button>
        ))}
        {!filtered.length && <p className="text-xs text-white/40 col-span-2 text-center py-8">No questions match. Try another category.</p>}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg h-full bg-[#0d0d14] border-l border-white/10 overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#0d0d14]/95 backdrop-blur border-b border-white/5 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2"><BookOpen size={16} className="text-indigo-400" /><span className="text-sm font-semibold text-white">Question Detail</span></div>
              <button onClick={() => setSelected(null)}><X size={18} className="text-white/40 hover:text-white" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300">{selected.category}</span>
                  <span className="text-[10px] text-white/30">{selected.audience}</span>
                </div>
                <h2 className="text-base font-bold text-white">{selected.question}</h2>
              </div>

              {selected.purpose && <Field label="Purpose — why people ask this" text={selected.purpose} />}
              {selected.suggested_answer && <Field label="Excellent Answer" text={selected.suggested_answer} />}
              {selected.alternative_answer && <Field label="Alternative Answer" text={selected.alternative_answer} />}
              {selected.short_answer && <Field label="60-Second Answer" text={selected.short_answer} />}
              {selected.long_answer && <Field label="3-Minute Answer" text={selected.long_answer} />}

              {selected.evidence?.length > 0 && <List title="Supporting Evidence" items={selected.evidence} />}
              {selected.follow_up_questions?.length > 0 && <List title="Follow-up Questions" items={selected.follow_up_questions} />}
              {selected.common_mistakes?.length > 0 && <List title="Common Mistakes" items={selected.common_mistakes} icon={AlertCircle} />}
              {selected.recommended_reading?.length > 0 && <List title="Recommended Reading" items={selected.recommended_reading} />}

              {/* Practice */}
              <div className="pt-4 border-t border-white/5">
                <div className="text-[11px] uppercase tracking-wider text-white/40 mb-2">Practice Your Answer</div>
                <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={5} placeholder="Type your answer to be scored by the AI Coach…" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40 resize-none" />
                <button onClick={practice} disabled={scoring || !answer.trim()} className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium transition-colors">
                  {scoring ? <><Loader2 size={14} className="animate-spin" /> Scoring…</> : <><Send size={14} /> Score My Answer</>}
                </button>

                {result && (
                  <div className="mt-4 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-white/40">AI Coach Score</span>
                      <span className="text-2xl font-bold text-white">{result.overall}<span className="text-sm text-white/30">/100</span></span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {SCORING_DIMENSIONS.map((d) => (
                        <div key={d.key} className="bg-white/[0.02] rounded-lg p-2">
                          <div className="text-[10px] text-white/40">{d.label}</div>
                          <div className="text-sm font-semibold" style={{ color: d.color }}>{result.scores?.[d.key] ?? 0}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">{result.feedback}</p>
                    {result.followUpQuestions?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Follow-ups they may ask</div>
                        {result.followUpQuestions.map((f, i) => <p key={i} className="text-xs text-white/60 py-0.5">• {f}</p>)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, text }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-white/40 mb-1">{label}</div>
      <p className="text-sm text-white/70 leading-relaxed">{text}</p>
    </div>
  );
}
function List({ title, items, icon: Icon }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-white/40 mb-1 flex items-center gap-1.5">{Icon && <Icon size={11} />}{title}</div>
      <ul className="space-y-1">{items.map((x, i) => <li key={i} className="text-sm text-white/70">• {x}</li>)}</ul>
    </div>
  );
}