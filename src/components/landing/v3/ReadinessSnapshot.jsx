import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Gauge } from 'lucide-react';

/**
 * Micro-Conversion CTA™ — "Get My Executive Readiness Snapshot™"
 * A lightweight 3-question preview that funnels into the full assessment.
 */

const QUESTIONS = [
  {
    key: 'stage',
    prompt: 'Where are you in your leadership journey?',
    options: ['Individual Contributor', 'Team Lead', 'Manager', 'Director / VP+'],
  },
  {
    key: 'focus',
    prompt: "What's your top growth focus?",
    options: ['Strategic Decision-Making', 'Executive Communication', 'Team Leadership', 'Executive Presence'],
  },
  {
    key: 'horizon',
    prompt: 'When do you want your next leadership move?',
    options: ['0–6 months', '6–12 months', '1–2 years', 'Just exploring'],
  },
];

function buildInsight(answers) {
  const stage = answers.stage || 'your current role';
  const focus = answers.focus || 'executive capability';
  const horizon = answers.horizon || 'your next move';
  return `Based on your stage as ${stage.toLowerCase()}, focusing on ${focus.toLowerCase()}, targeting ${horizon.toLowerCase()} — your Executive Readiness Snapshot suggests prioritizing evidence-based development in ${focus.toLowerCase()} and pairing it with executive simulations to accelerate readiness before your next move.`;
}

export default function ReadinessSnapshot() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const complete = QUESTIONS.every((q) => answers[q.key]);

  return (
    <section className="py-20 md:py-24 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/25 rounded-full text-[11px] text-indigo-300 font-medium mb-3">
            <Sparkles size={12} /> Micro-Conversion · No Account Required
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Get My Executive Readiness Snapshot</h2>
          <p className="text-sm text-white/45 max-w-lg mx-auto">
            Take a 3-question preview and receive a personalized leadership insight before creating an account.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
          {!submitted ? (
            <div className="space-y-6">
              {QUESTIONS.map((q, i) => (
                <div key={q.key}>
                  <div className="text-xs font-medium text-white/70 mb-2.5">
                    <span className="text-accent-orange mr-1.5">{i + 1}.</span> {q.prompt}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAnswers((a) => ({ ...a, [q.key]: opt }))}
                        className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                          answers[q.key] === opt
                            ? 'bg-indigo-500/15 border-indigo-500/40 text-white'
                            : 'bg-white/5 border-white/10 text-white/55 hover:text-white/80 hover:border-white/20'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="button"
                disabled={!complete}
                onClick={() => setSubmitted(true)}
                className="w-full bg-accent-orange hover:bg-accent-orange/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Gauge size={16} /> Get My Snapshot <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] text-emerald-400 font-medium mb-4">
                <Gauge size={12} /> Your Snapshot is Ready
              </div>
              <p className="text-sm text-white/75 leading-relaxed max-w-xl mx-auto">{buildInsight(answers)}</p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/executive-readiness"
                  className="w-full sm:w-auto bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  Take the Full Executive Readiness Assessment <ArrowRight size={16} />
                </Link>
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setAnswers({}); }}
                  className="w-full sm:w-auto text-white/55 hover:text-white/85 text-sm font-medium px-4 py-3 transition-colors"
                >
                  Retake Snapshot
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}