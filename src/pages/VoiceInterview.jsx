import React, { useState, useMemo } from "react";
import { Mic, Zap, Clock, Crown, Briefcase, Settings, History, Volume2, ChevronRight, AlertTriangle, ArrowLeft, CheckCircle, Brain, TrendingUp, Download, Trash2, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useVoiceControls } from "@/hooks/useVoiceControls";
import { INTERVIEW_TYPES, VOICE_SETTINGS_DEFAULTS, VOICE_HISTORY_SAMPLE, EXECUTIVE_COACHING_AREAS, getGreetingText, computeAggregateScores } from "@/lib/voiceInterviewEngine";
import InterviewTypeSelector from "@/components/voice-interview/InterviewTypeSelector";
import VoiceRecorder from "@/components/voice-interview/VoiceRecorder";
import LiveCoaching from "@/components/voice-interview/LiveCoaching";

export default function VoiceInterview() {
  const [view, setView] = useState("home");
  const [selectedType, setSelectedType] = useState(null);
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const [settings, setSettings] = useState(VOICE_SETTINGS_DEFAULTS);
  const [showSettings, setShowSettings] = useState(false);
  const [phase, setPhase] = useState("greeting");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [answers, setAnswers] = useState([]);

  const voice = useVoiceControls(settings);

  const handleSelectType = (type) => { setSelectedType(type); setShowCreditWarning(true); };

  const startInterview = async () => {
    setShowCreditWarning(false);
    setView("interview");
    setPhase("greeting");
    setQuestionIndex(0);
    setAnswers([]);
    setAnalysis(null);
    if (settings.autoReadQuestions) {
      await voice.speak(getGreetingText(selectedType));
    }
    await askQuestion(0);
  };

  const askQuestion = async (idx) => {
    setPhase("question");
    setAnalysis(null);
    voice.startListening && voice.stopListening();
    if (settings.autoReadQuestions) {
      await voice.speak(selectedType.questions[idx]);
    }
    setPhase("listening");
  };

  const handleSubmitAnswer = async () => {
    voice.stopListening();
    setPhase("analyzing");
    setIsAnalyzing(true);

    const currentTranscript = voice.transcript;
    if (!currentTranscript.trim()) {
      setIsAnalyzing(false);
      setPhase("listening");
      return;
    }

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are EXEC™, an experienced executive recruiter conducting a ${selectedType.name} interview.

Mode: ${selectedType.mode === "executive" ? "Executive Voice Coach™ — evaluate executive presence, strategic thinking, board readiness, and enterprise leadership" : "Professional Voice Mode™ — evaluate communication clarity, STAR framework, professionalism, and leadership potential"}

Interview Type: ${selectedType.name}
Difficulty: ${selectedType.difficulty}

Question ${questionIndex + 1}: "${selectedType.questions[questionIndex]}"

Candidate's spoken response (transcribed): "${currentTranscript}"

Provide a comprehensive analysis. Score each metric 0-100. Be direct, constructive, and executive-grade. Challenge weak answers and reward exceptional ones. Explain WHY improvements matter.`,
        response_json_schema: {
          type: "object",
          properties: {
            overallScore: { type: "number" },
            communication: { type: "object", properties: { clarity: { type: "number" }, confidence: { type: "number" }, speakingPace: { type: "number" }, grammar: { type: "number" }, conciseness: { type: "number" }, structure: { type: "number" }, fillerWords: { type: "number" }, tone: { type: "number" } } },
            leadership: { type: "object", properties: { strategicThinking: { type: "number" }, executivePresence: { type: "number" }, ownership: { type: "number" }, businessAcumen: { type: "number" }, decisionQuality: { type: "number" } } },
            fillerWordCount: { type: "number" },
            coaching: { type: "object", properties: { strengths: { type: "array", items: { type: "string" } }, improvements: { type: "array", items: { type: "string" } }, betterWording: { type: "string" }, leadershipTips: { type: "array", items: { type: "string" } }, executivePerspective: { type: "string" } } },
            coachingSummary: { type: "string" },
          },
        },
      });
      setAnalysis(result);
      setPhase("coaching");
      if (settings.voicePlayback && result.coachingSummary) {
        await voice.speak(result.coachingSummary);
      }
    } catch (e) {
      setAnalysis({ overallScore: 0, communication: {}, leadership: {}, coaching: { strengths: [], improvements: ["Analysis temporarily unavailable"] }, coachingSummary: "Unable to analyze response. Please try again." });
      setPhase("coaching");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNextQuestion = () => {
    const answerRecord = { question: selectedType.questions[questionIndex], transcript: voice.transcript, analysis };
    setAnswers((prev) => [...prev, answerRecord]);

    if (questionIndex + 1 < selectedType.questions.length) {
      setQuestionIndex(questionIndex + 1);
      voice.startListening && voice.stopListening();
      askQuestion(questionIndex + 1);
    } else {
      setPhase("complete");
      setView("results");
    }
  };

  const aggregateScores = useMemo(() => computeAggregateScores([...answers, analysis ? { question: selectedType?.questions[questionIndex], transcript: voice.transcript, analysis } : null].filter(Boolean)), [answers, analysis, questionIndex, voice.transcript, selectedType]);

  // HOME VIEW
  if (view === "home") {
    return (
      <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-0">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Mic size={12} className="text-pink-400" /> Voice AI Pack™ · Premium Feature
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Mic className="text-pink-400" size={24} /> Voice Interview™</h1>
          <p className="text-white/40 text-sm mt-1">Complete interview simulations using natural speech. EXEC™ analyzes your communication, leadership, and executive presence in real-time.</p>
        </div>

        {/* Credits + status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4"><Zap size={16} className="text-amber-400" /><div className="text-xl font-bold text-white mt-2">500</div><div className="text-xs text-white/40">Voice Credits</div></div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4"><Clock size={16} className="text-cyan-400" /><div className="text-xl font-bold text-white mt-2">250 min</div><div className="text-xs text-white/40">Remaining Minutes</div></div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4"><History size={16} className="text-indigo-400" /><div className="text-xl font-bold text-white mt-2">{VOICE_HISTORY_SAMPLE.length}</div><div className="text-xs text-white/40">Interviews Completed</div></div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4"><TrendingUp size={16} className="text-emerald-400" /><div className="text-xl font-bold text-white mt-2">{VOICE_HISTORY_SAMPLE[0]?.overallScore || 0}</div><div className="text-xs text-white/40">Last Score</div></div>
        </div>

        {/* Browser support warning */}
        {!voice.supported && (
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div><h3 className="text-sm font-medium text-amber-400">Voice Recognition Not Available</h3><p className="text-xs text-white/40 mt-1">Your browser doesn't support the Web Speech API. Please use Chrome, Edge, or Safari for the full voice interview experience.</p></div>
          </div>
        )}

        {/* Interview type selector */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Choose Your Interview Type</h2>
            <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/50 hover:text-white/80 transition-colors"><Settings size={12} /> Voice Settings</button>
          </div>
          <InterviewTypeSelector types={INTERVIEW_TYPES} selected={selectedType} onSelect={handleSelectType} />
        </div>

        {/* Voice Settings panel */}
        {showSettings && <VoiceSettingsPanel settings={settings} setSettings={setSettings} voices={voice.getVoices()} />}

        {/* Voice history */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><History size={14} className="text-indigo-400" /> Voice History™</h3>
          <div className="space-y-2">
            {VOICE_HISTORY_SAMPLE.map((h) => (
              <div key={h.id} className="flex items-center justify-between bg-white/[0.01] border border-white/[0.03] rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center"><Mic size={14} className="text-indigo-400" /></div>
                  <div>
                    <div className="text-xs text-white/80">{h.name}</div>
                    <div className="text-[10px] text-white/30">{h.date} · {h.duration} min · {h.creditsUsed} credits · {h.model}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center"><div className="text-sm font-bold text-white">{h.overallScore}</div><div className="text-[9px] text-white/30">Overall</div></div>
                  <div className="text-center"><div className="text-sm font-bold text-amber-400">{h.leadershipScore}</div><div className="text-[9px] text-white/30">Leadership</div></div>
                  <div className="text-center"><div className="text-sm font-bold text-cyan-400">{h.communicationScore}</div><div className="text-[9px] text-white/30">Comm</div></div>
                  <ChevronRight size={16} className="text-white/20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Executive coaching areas */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Crown size={14} className="text-amber-400" /> Executive Voice Coach™ — Advanced Coaching Areas</h3>
          <div className="flex flex-wrap gap-2">
            {EXECUTIVE_COACHING_AREAS.map((area, i) => <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-400/80 border border-amber-500/15">{area}</span>)}
          </div>
        </div>

        {/* Credit warning modal */}
        {showCreditWarning && selectedType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowCreditWarning(false)}>
            <div className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-4"><Zap size={20} className="text-amber-400" /><h3 className="text-lg font-bold text-white">Credit Consumption</h3></div>
              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between text-sm"><span className="text-white/50">Interview Type</span><span className="text-white/80">{selectedType.name}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-white/50">Estimated AI Credits</span><span className="font-bold text-amber-400">{selectedType.estimatedCredits}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-white/50">Estimated Duration</span><span className="text-white/80">{selectedType.estimatedMinutes} min</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-white/50">Questions</span><span className="text-white/80">{selectedType.questions.length}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-white/50">Mode</span><span className={selectedType.mode === "executive" ? "text-amber-400" : "text-indigo-400"}>{selectedType.mode === "executive" ? "Executive Voice Coach™" : "Professional Voice Mode™"}</span></div>
                <div className="flex items-center justify-between text-sm border-t border-white/5 pt-3"><span className="text-white/50">Remaining Credits</span><span className="font-bold text-emerald-400">500</span></div>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3 mb-4 flex items-start gap-2"><AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" /><p className="text-[11px] text-white/40">{selectedType.estimatedCredits} credits will be consumed. You have 500 credits remaining. You will never be surprised by hidden charges.</p></div>
              <div className="flex gap-2">
                <button onClick={() => setShowCreditWarning(false)} className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:text-white/90 transition-colors">Cancel</button>
                <button onClick={startInterview} className="flex-1 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm text-white font-medium transition-colors flex items-center justify-center gap-2"><Mic size={14} /> Start Interview</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // INTERVIEW VIEW
  if (view === "interview") {
    return (
      <div className="max-w-4xl mx-auto space-y-4 px-4 md:px-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => setView("home")} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"><ArrowLeft size={14} /> Exit Interview</button>
          <div className="flex items-center gap-3 text-xs text-white/40">
            <span>Question {questionIndex + 1} of {selectedType.questions.length}</span>
            <span className="flex items-center gap-1"><Zap size={12} className="text-amber-400" /> {selectedType.estimatedCredits} credits</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${((questionIndex + (phase === "coaching" ? 1 : 0)) / selectedType.questions.length) * 100}%` }} />
        </div>

        {/* Interview type badge */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${selectedType.mode === "executive" ? "bg-amber-500/10 text-amber-400" : "bg-indigo-500/10 text-indigo-400"}`}>{selectedType.mode === "executive" ? "Executive Voice Coach™" : "Professional Voice Mode™"}</span>
          <span className="text-sm text-white/60">{selectedType.name}</span>
        </div>

        {/* Question display */}
        <div className="bg-white/[0.02] border border-indigo-500/15 rounded-xl p-5">
          <div className="text-[10px] text-indigo-400/60 uppercase tracking-wide mb-2">EXEC™ asks:</div>
          <p className="text-base text-white/80 leading-relaxed">{selectedType.questions[questionIndex]}</p>
        </div>

        {/* Voice recorder (only when listening or before analyzing) */}
        {(phase === "listening" || phase === "question") && (
          <VoiceRecorder
            isListening={voice.isListening}
            isSpeaking={voice.isSpeaking}
            transcript={voice.transcript}
            interimTranscript={voice.interimTranscript}
            onStart={voice.startListening}
            onStop={voice.handleSubmitAnswer || handleSubmitAnswer}
            disabled={voice.isSpeaking}
          />
        )}

        {/* Submit button */}
        {phase === "listening" && voice.transcript && !voice.isListening && (
          <button onClick={handleSubmitAnswer} className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm text-white font-medium transition-colors flex items-center justify-center gap-2"><CheckCircle size={16} /> Submit Answer for Analysis</button>
        )}

        {/* Live coaching */}
        {(phase === "analyzing" || phase === "coaching") && (
          <LiveCoaching analysis={analysis} isAnalyzing={isAnalyzing || phase === "analyzing"} onReadCoaching={() => analysis?.coachingSummary && voice.speak(analysis.coachingSummary)} isSpeaking={voice.isSpeaking} />
        )}

        {/* Next button */}
        {phase === "coaching" && analysis && (
          <button onClick={handleNextQuestion} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm text-white font-medium transition-colors flex items-center justify-center gap-2">
            {questionIndex + 1 < selectedType.questions.length ? <>Next Question <ChevronRight size={16} /></> : <>Complete Interview <CheckCircle size={16} /></>}
          </button>
        )}

        {/* Error */}
        {voice.error && <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3 text-xs text-red-400">{voice.error}</div>}
      </div>
    );
  }

  // RESULTS VIEW
  if (view === "results") {
    const scores = aggregateScores || { overallScore: 0, communicationScore: 0, leadershipScore: 0, confidence: 0, executivePresence: 0, strategicThinking: 0, businessAcumen: 0, decisionQuality: 0, speakingPace: 0, grammar: 0, fillerWordCount: 0, avgAnswerLength: 0 };
    return (
      <div className="max-w-5xl mx-auto space-y-6 px-4 md:px-0">
        <div className="flex items-center justify-between">
          <button onClick={() => setView("home")} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"><ArrowLeft size={14} /> Back to Home</button>
          <button onClick={() => setView("home")} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-400 hover:bg-indigo-500/20 transition-colors"><Mic size={12} /> New Interview</button>
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3"><CheckCircle size={32} className="text-emerald-400" /></div>
          <h1 className="text-2xl font-bold text-white">Interview Complete</h1>
          <p className="text-white/40 text-sm mt-1">{selectedType.name} · {answers.length + 1} questions answered</p>
        </div>

        {/* Executive Feedback Dashboard™ */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Brain size={14} className="text-indigo-400" /> Executive Feedback Dashboard™</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ScoreCard label="Overall Interview Score™" value={scores.overallScore} color="#10b981" />
            <ScoreCard label="Communication Score™" value={scores.communicationScore} color="#06b6d4" />
            <ScoreCard label="Leadership Score™" value={scores.leadershipScore} color="#6366f1" />
            <ScoreCard label="Confidence™" value={scores.confidence} color="#f59e0b" />
            <ScoreCard label="Executive Presence™" value={scores.executivePresence} color="#a855f7" />
            <ScoreCard label="Strategic Thinking™" value={scores.strategicThinking} color="#ec4899" />
            <ScoreCard label="Business Acumen™" value={scores.businessAcumen} color="#14b8a6" />
            <ScoreCard label="Decision Quality™" value={scores.decisionQuality} color="#f59e0b" />
            <ScoreCard label="Speaking Pace™" value={scores.speakingPace} color="#06b6d4" />
            <ScoreCard label="Grammar™" value={scores.grammar} color="#10b981" />
            <ScoreCard label="Filler Word Count" value={scores.fillerWordCount} color="#ef4444" />
            <ScoreCard label="Avg Answer Length" value={`${scores.avgAnswerLength}w`} color="#6366f1" />
          </div>
        </div>

        {/* Answer review */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Answer Review & Transcripts</h3>
          <div className="space-y-3">
            {[...answers, analysis ? { question: selectedType.questions[questionIndex], transcript: voice.transcript, analysis } : null].filter(Boolean).map((a, i) => (
              <div key={i} className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-white/30">Q{i + 1}</span>
                  {a.analysis?.overallScore && <span className="text-sm font-bold" style={{ color: a.analysis.overallScore >= 80 ? "#10b981" : a.analysis.overallScore >= 60 ? "#f59e0b" : "#ef4444" }}>{a.analysis.overallScore}</span>}
                </div>
                <p className="text-xs text-white/60 mb-2 italic">"{a.question}"</p>
                <p className="text-xs text-white/40 mb-2">{a.transcript}</p>
                {a.analysis?.coachingSummary && <p className="text-[11px] text-indigo-400/70 border-l-2 border-indigo-500/20 pl-2">{a.analysis.coachingSummary}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Audio + privacy */}
        {voice.audioUrl && (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Volume2 size={14} className="text-indigo-400" /> Audio Recording</h3>
            <audio src={voice.audioUrl} controls className="w-full mb-3" />
            <div className="flex items-center gap-3">
              <a href={voice.audioUrl} download="voice-interview.webm" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/50 hover:text-white/80 transition-colors"><Download size={12} /> Download</a>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/5 border border-red-500/15 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={12} /> Delete</button>
            </div>
            <div className="mt-3 flex items-start gap-2 text-[10px] text-white/30"><Shield size={12} className="text-emerald-400/40 shrink-0 mt-0.5" /><span>Audio recordings require explicit consent and are encrypted. You can delete or export your recordings at any time. Retention policy: 30 days unless saved.</span></div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

function ScoreCard({ label, value, color }) {
  return (
    <div className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-3 text-center">
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-white/30 mt-0.5">{label}</div>
    </div>
  );
}

function VoiceSettingsPanel({ settings, setSettings, voices }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Settings size={14} className="text-indigo-400" /> Voice Settings™</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-white/50">AI Interviewer Voice</span>
          <select value={settings.voiceURI} onChange={(e) => setSettings({ ...settings, voiceURI: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-indigo-500/40">
            <option value="">Default Voice</option>
            {voices.map((v) => <option key={v.uri} value={v.uri}>{v.name} ({v.lang})</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-white/50">Speaking Speed</span>
          <select value={settings.speakingSpeed} onChange={(e) => setSettings({ ...settings, speakingSpeed: parseFloat(e.target.value) })} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-indigo-500/40">
            <option value="0.8">Slow (0.8x)</option>
            <option value="1.0">Normal (1.0x)</option>
            <option value="1.2">Fast (1.2x)</option>
            <option value="1.5">Very Fast (1.5x)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-white/50">Transcript Language</span>
          <select value={settings.transcriptLanguage} onChange={(e) => setSettings({ ...settings, transcriptLanguage: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-indigo-500/40">
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="en-AU">English (AU)</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
            <option value="ja-JP">Japanese</option>
            <option value="ko-KR">Korean</option>
            <option value="zh-CN">Chinese (Simplified)</option>
          </select>
        </label>
        <div className="space-y-2">
          <ToggleRow label="Auto Read Questions" value={settings.autoReadQuestions} onChange={(v) => setSettings({ ...settings, autoReadQuestions: v })} />
          <ToggleRow label="Voice Playback" value={settings.voicePlayback} onChange={(v) => setSettings({ ...settings, voicePlayback: v })} />
          <ToggleRow label="Noise Reduction" value={settings.noiseReduction} onChange={(v) => setSettings({ ...settings, noiseReduction: v })} />
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <label className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
      <span className="text-xs text-white/50">{label}</span>
      <button onClick={() => onChange(!value)} className={`w-10 h-5 rounded-full transition-colors relative ${value ? "bg-indigo-500" : "bg-white/10"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}