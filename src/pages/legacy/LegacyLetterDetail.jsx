import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft, Loader2, Heart, Bookmark, Share2, MessageCircle, Eye, Clock,
  BadgeCheck, Crown, BookOpen, Lightbulb, Target, Quote, HelpCircle,
  Sparkles, Send, ListChecks, Award, PenLine, Trash2
} from "lucide-react";

export default function LegacyLetterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [letter, setLetter] = useState(null);
  const [myInteraction, setMyInteraction] = useState({ liked: false, bookmarked: false });
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [engaging, setEngaging] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // AI Discussion
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    base44.functions.invoke("manageLegacyLibrary", { action: "get", letter_id: id })
      .then((res) => {
        const d = res.data || res;
        setLetter(d.letter);
        setMyInteraction(d.my_interaction || { liked: false, bookmarked: false });
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    base44.entities.LetterComment.filter({ letter_id: id, status: "active" }, "-created_date", 100)
      .then(setComments)
      .catch(() => {});
  }, [id]);

  const handleEngage = async (type) => {
    setEngaging(type);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "engage", letter_id: id, type });
      const d = res.data || res;
      if (d.success) {
        if (type === "like") {
          setMyInteraction((p) => ({ ...p, liked: d.active }));
          setLetter((p) => ({ ...p, likes: d.count }));
        } else if (type === "bookmark") {
          setMyInteraction((p) => ({ ...p, bookmarked: d.active }));
          setLetter((p) => ({ ...p, bookmarks: d.count }));
          toast({ title: d.active ? "Bookmarked" : "Removed bookmark" });
        } else if (type === "share") {
          setLetter((p) => ({ ...p, shares: d.count }));
          navigator.clipboard?.writeText(window.location.href);
          toast({ title: "Link copied to clipboard" });
        }
      }
    } catch (e) {
      toast({ title: "Action failed", variant: "destructive" });
    }
    setEngaging(null);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "comment", letter_id: id, content: commentText });
      const d = res.data || res;
      if (d.success) {
        setComments((p) => [d.comment, ...p]);
        setLetter((p) => ({ ...p, comments_count: (p.comments_count || 0) + 1 }));
        setCommentText("");
      }
    } catch (e) {
      toast({ title: "Failed to post comment", variant: "destructive" });
    }
    setSubmittingComment(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${letter.title}"? This permanently removes the letter and all related data.`)) return;
    setDeleting(true);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "delete", letter_id: id });
      const d = res.data || res;
      if (d.success || d.error === undefined) {
        toast({ title: "Letter deleted" });
        navigate("/legacy-library");
      } else {
        toast({ title: d.error || "Failed to delete", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
    setDeleting(false);
  };

  const handleAiDiscuss = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiAnswer("");
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "ai_discuss", letter_id: id, question: aiQuestion });
      const d = res.data || res;
      if (d.success) setAiAnswer(d.answer);
    } catch (e) {
      toast({ title: "AI discussion failed", variant: "destructive" });
    }
    setAiLoading(false);
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  if (!letter) {
    return (
      <div className="text-center py-16">
        <BookOpen size={32} className="text-white/20 mx-auto mb-3" />
        <p className="text-white/40">Letter not found.</p>
        <Link to="/legacy-library" className="text-indigo-400 text-sm mt-2 inline-block hover:underline">Back to Library</Link>
      </div>
    );
  }

  const insights = {
    competencies: safeParse(letter.ai_competencies_json),
    principles: safeParse(letter.ai_principles_json),
    decisionThemes: safeParse(letter.ai_decision_themes_json),
    skills: safeParse(letter.ai_executive_skills_json),
    takeaways: safeParse(letter.ai_key_takeaways_json),
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link to="/legacy-library" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm">
          <ArrowLeft size={16} /> Back to Library
        </Link>
        {user?.role === "admin" && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 text-white/30 hover:text-red-400 text-sm transition-colors disabled:opacity-50"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
          </button>
        )}
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-medium">{letter.category}</span>
          {letter.featured && <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-medium">Featured</span>}
        </div>
        <h1 className="text-2xl md:text-4xl font-bold mb-2 leading-tight">{letter.title}</h1>
        {letter.subtitle && <p className="text-white/50 text-lg">{letter.subtitle}</p>}
      </div>

      {/* Author Card */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-6 flex items-center gap-3">
        {letter.author_photo ? (
          <img src={letter.author_photo} alt="" className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-medium">{letter.author_name?.charAt(0)}</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-white/90 font-medium text-sm">{letter.author_name}</span>
            {letter.author_verification_badge && <BadgeCheck size={14} className="text-indigo-400" />}
            {letter.author_is_founder && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 text-[10px] font-medium">
                <Crown size={9} /> Founder
              </span>
            )}
          </div>
          <div className="text-white/40 text-xs">{letter.author_position}{letter.organization ? ` at ${letter.organization}` : ""}</div>
          <div className="text-white/30 text-[10px] mt-0.5">
            {[letter.industry, letter.country, letter.years_experience ? `${letter.years_experience} yrs exp` : null].filter(Boolean).join(" · ")}
          </div>
        </div>
      </div>

      {/* Engagement Bar */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5 text-white/40 text-xs">
        <span className="flex items-center gap-1"><Clock size={13} /> {letter.ai_reading_time_minutes || 5} min read</span>
        <span className="flex items-center gap-1"><Eye size={13} /> {letter.views}</span>
        <button onClick={() => handleEngage("like")} disabled={engaging === "like"} className={`flex items-center gap-1 transition-colors ${myInteraction.liked ? "text-red-400" : "hover:text-red-400"}`}>
          <Heart size={13} fill={myInteraction.liked ? "currentColor" : "none"} /> {letter.likes}
        </button>
        <button onClick={() => handleEngage("bookmark")} disabled={engaging === "bookmark"} className={`flex items-center gap-1 transition-colors ${myInteraction.bookmarked ? "text-indigo-400" : "hover:text-indigo-400"}`}>
          <Bookmark size={13} fill={myInteraction.bookmarked ? "currentColor" : "none"} /> {letter.bookmarks}
        </button>
        <button onClick={() => handleEngage("share")} disabled={engaging === "share"} className="flex items-center gap-1 hover:text-indigo-400 transition-colors ml-auto">
          <Share2 size={13} /> Share
        </button>
      </div>

      {/* Message */}
      <div className="prose prose-invert prose-sm max-w-none mb-8">
        <ReactMarkdown className="text-white/70 leading-relaxed">{letter.message}</ReactMarkdown>
      </div>

      {/* Key Lessons */}
      {letter.key_lessons?.length > 0 && (
        <Section icon={ListChecks} title="Key Lessons">
          <ul className="space-y-2">
            {letter.key_lessons.map((lesson, i) => (
              <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
                <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                {lesson}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Advice */}
      {letter.advice && <Section icon={Lightbulb} title="Advice"><p className="text-white/60 text-sm leading-relaxed">{letter.advice}</p></Section>}

      {/* Quotes */}
      {letter.quotes?.length > 0 && (
        <Section icon={Quote} title="Memorable Quotes">
          <div className="space-y-3">
            {letter.quotes.map((q, i) => (
              <blockquote key={i} className="border-l-2 border-indigo-500/30 pl-4 text-white/70 text-sm italic">"{q}"</blockquote>
            ))}
          </div>
        </Section>
      )}

      {/* Reflection Questions */}
      {letter.reflection_questions?.length > 0 && (
        <Section icon={HelpCircle} title="Reflection Questions">
          <ul className="space-y-1.5">
            {letter.reflection_questions.map((q, i) => <li key={i} className="text-white/60 text-sm">• {q}</li>)}
          </ul>
        </Section>
      )}

      {/* Recommendations */}
      {(letter.recommended_books?.length > 0 || letter.recommended_courses?.length > 0 || letter.recommended_habits?.length > 0) && (
        <Section icon={BookOpen} title="Recommendations">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {letter.recommended_books?.length > 0 && <RecList title="Books" items={letter.recommended_books} />}
            {letter.recommended_courses?.length > 0 && <RecList title="Courses" items={letter.recommended_courses} />}
            {letter.recommended_habits?.length > 0 && <RecList title="Habits" items={letter.recommended_habits} />}
          </div>
        </Section>
      )}

      {/* Closing */}
      {letter.closing_message && (
        <div className="bg-gradient-to-br from-indigo-500/5 to-transparent border border-indigo-500/10 rounded-xl p-5 mb-8">
          <div className="text-indigo-400 text-xs font-medium uppercase tracking-widest mb-2">Closing Message</div>
          <p className="text-white/70 text-sm leading-relaxed">{letter.closing_message}</p>
        </div>
      )}

      {/* AI Insights */}
      {letter.ai_summary && (
        <Section icon={Sparkles} title="AI Leadership Insights">
          <div className="bg-gradient-to-br from-indigo-500/5 to-transparent border border-indigo-500/10 rounded-xl p-5 space-y-4">
            <p className="text-white/70 text-sm leading-relaxed">{letter.ai_summary}</p>
            {insights.takeaways.length > 0 && <InsightList title="Key Takeaways" items={insights.takeaways} color="text-indigo-400" />}
            {insights.competencies.length > 0 && <InsightList title="Leadership Competencies" items={insights.competencies} color="text-emerald-400" />}
            {insights.principles.length > 0 && <InsightList title="Leadership Principles" items={insights.principles} color="text-amber-400" />}
            {insights.decisionThemes.length > 0 && <InsightList title="Decision Themes" items={insights.decisionThemes} color="text-purple-400" />}
            {insights.skills.length > 0 && <InsightList title="Executive Skills" items={insights.skills} color="text-cyan-400" />}
            {letter.ai_communication_style && (
              <div className="text-xs text-white/40"><span className="text-cyan-400 font-medium">Communication Style:</span> {letter.ai_communication_style}</div>
            )}
            {letter.ai_recommended_audience && (
              <div className="text-xs text-white/40"><span className="text-indigo-400 font-medium">Recommended Audience:</span> {letter.ai_recommended_audience}</div>
            )}
          </div>
        </Section>
      )}

      {/* AI Discussion */}
      <Section icon={MessageCircle} title="Ask AI About This Letter">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAiDiscuss()}
              placeholder="e.g. What leadership principles are demonstrated here?"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50"
            />
            <button onClick={handleAiDiscuss} disabled={aiLoading || !aiQuestion.trim()} className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium px-4 rounded-lg transition-colors">
              {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Ask
            </button>
          </div>
          {aiAnswer && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-3">
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
            </motion.div>
          )}
        </div>
      </Section>

      {/* Comments */}
      <Section icon={MessageCircle} title={`Comments (${letter.comments_count || 0})`}>
        <div className="space-y-3 mb-4">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts…"
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 resize-none"
          />
          <button onClick={handleComment} disabled={submittingComment || !commentText.trim()} className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            {submittingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Post Comment
          </button>
        </div>
        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-4">No comments yet. Be the first to share.</p>
          ) : comments.map((c) => (
            <div key={c.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-medium">{c.user_name?.charAt(0)}</div>
                <span className="text-white/70 text-xs font-medium">{c.user_name}</span>
              </div>
              <p className="text-white/60 text-sm">{c.content}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Author CTA */}
      <div className="mt-12 pt-8 border-t border-white/5 text-center">
        {letter.author_is_founder && (
          <Link to="/founders" className="inline-flex items-center gap-1.5 text-amber-400 text-sm hover:underline">
            <Crown size={14} /> View {letter.author_name}'s founder profile
          </Link>
        )}
        <div className="mt-2">
          <Link to="/legacy-library/new" className="inline-flex items-center gap-1.5 text-indigo-400 text-sm hover:underline">
            <PenLine size={14} /> Write your own leadership letter
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} className="text-indigo-400" />
        <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function RecList({ title, items }) {
  return (
    <div>
      <div className="text-white/40 text-xs font-medium mb-2">{title}</div>
      <ul className="space-y-1">{items.map((item, i) => <li key={i} className="text-white/60 text-xs">• {item}</li>)}</ul>
    </div>
  );
}

function InsightList({ title, items, color }) {
  return (
    <div>
      <div className={`text-xs font-semibold mb-1.5 ${color}`}>{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-white/60 text-xs">{item}</span>)}
      </div>
    </div>
  );
}

function safeParse(json) {
  try { return JSON.parse(json || "[]"); } catch { return []; }
}