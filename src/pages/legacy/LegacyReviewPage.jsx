import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft, Loader2, Check, X, Star, Archive, RefreshCw, Copy,
  BadgeCheck, Crown, BookOpen, Lightbulb, Quote, HelpCircle, Shield,
  ListChecks, Clock, UserCheck, RotateCcw, Trash2,
  MessageSquare, Bot, Calendar, Eye, FileText
} from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, formatCount } from "@/lib/legacyLibrary";
import ReviewAIPanel from "@/components/legacy/ReviewAIPanel";
import ModeratorChecklist from "@/components/legacy/ModeratorChecklist";
import ModeratorNotes from "@/components/legacy/ModeratorNotes";
import RejectionModal from "@/components/legacy/RejectionModal";
import RevisionModal from "@/components/legacy/RevisionModal";
import AssignReviewerModal from "@/components/legacy/AssignReviewerModal";

export default function LegacyReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const loadLetter = async () => {
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "get", letter_id: id });
      const d = res.data || res;
      setLetter(d.letter);
    } catch (e) {
      toast({ title: "Failed to load letter", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { loadLetter(); }, [id]);

  const handleAction = async (action, extra = {}) => {
    if (action === "reject") { setRejectOpen(true); return; }
    if (action === "request_revision") { setRevisionOpen(true); return; }
    if (action === "assign_reviewer") { setAssignOpen(true); return; }
    if (action === "delete") {
      if (!window.confirm(`Delete "${letter.title}"? This permanently removes the letter.`)) return;
    }

    setActing(action);
    try {
      let payload = { action, letter_id: id, ...extra };
      if (action === "approve_feature") { payload.action = "approve"; payload.feature = true; }
      if (action === "feature") payload.feature_type = "featured";

      const res = await base44.functions.invoke("manageLegacyLibrary", payload);
      const d = res.data || res;

      if (action === "detect_duplicates") {
        if (d.duplicates?.length > 0) {
          toast({ title: `${d.duplicates.length} potential duplicate(s) found`, description: d.duplicates.map((dup) => dup.letter.title).join(", "), variant: "warning" });
        } else {
          toast({ title: "No duplicates found" });
        }
      } else if (d.success !== false) {
        toast({ title: action === "approve_feature" ? "Letter approved & featured" : `Letter ${action.replace("_", " ")}d successfully` });
        if (d.letter) setLetter(d.letter);
        else await loadLetter();
      } else {
        toast({ title: d.error || "Action failed", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Action failed", variant: "destructive" });
    }
    setActing(null);
  };

  const handleReject = async (reason, comments) => {
    setActing("reject");
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "reject", letter_id: id, reason, comments });
      const d = res.data || res;
      if (d.success) {
        toast({ title: "Letter rejected — author notified" });
        setRejectOpen(false);
        if (d.letter) setLetter(d.letter);
        else await loadLetter();
      }
    } catch (e) { toast({ title: "Failed to reject", variant: "destructive" }); }
    setActing(null);
  };

  const handleRequestRevision = async (notes) => {
    setActing("request_revision");
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "request_revision", letter_id: id, revision_notes: notes });
      const d = res.data || res;
      if (d.success) {
        toast({ title: "Revision requested — author notified" });
        setRevisionOpen(false);
        if (d.letter) setLetter(d.letter);
        else await loadLetter();
      }
    } catch (e) { toast({ title: "Failed to request revision", variant: "destructive" }); }
    setActing(null);
  };

  const handleAssign = async (reviewerId, reviewerName) => {
    setActing("assign_reviewer");
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "assign_reviewer", letter_id: id, reviewer_id: reviewerId, reviewer_name: reviewerName });
      const d = res.data || res;
      if (d.success) {
        toast({ title: reviewerId ? `Assigned to ${reviewerName}` : "Reviewer unassigned" });
        setAssignOpen(false);
        if (d.letter) setLetter(d.letter);
        else await loadLetter();
      }
    } catch (e) { toast({ title: "Failed to assign reviewer", variant: "destructive" }); }
    setActing(null);
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  if (!letter) {
    return (
      <div className="text-center py-16">
        <BookOpen size={32} className="text-white/20 mx-auto mb-3" />
        <p className="text-white/40">Letter not found.</p>
        <Link to="/legacy-library/admin" className="text-indigo-400 text-sm mt-2 inline-block hover:underline">Back to Queue</Link>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-16">
        <Shield size={32} className="text-white/20 mx-auto mb-3" />
        <p className="text-white/40">Admin access required to review letters.</p>
        <Link to="/legacy-library" className="text-indigo-400 text-sm mt-2 inline-block hover:underline">Back to Library</Link>
      </div>
    );
  }

  const status = letter.status;
  const isPending = status === "pending_human_review" || status === "pending_ai_review";
  const isPublished = status === "published";

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link to="/legacy-library/admin" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm">
          <ArrowLeft size={16} /> Back to Queue
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          {isPending && (
            <>
              <ActionBtn onClick={() => handleAction("approve")} color="emerald" icon={Check} loading={acting === "approve"}>Approve</ActionBtn>
              <ActionBtn onClick={() => handleAction("approve_feature")} color="amber" icon={Star} loading={acting === "approve_feature"}>Approve & Feature</ActionBtn>
              <ActionBtn onClick={() => handleAction("request_revision")} color="blue" icon={MessageSquare} loading={acting === "request_revision"}>Request Revision</ActionBtn>
              <ActionBtn onClick={() => handleAction("reject")} color="red" icon={X} loading={acting === "reject"}>Reject</ActionBtn>
            </>
          )}
          {isPublished && (
            <>
              <ActionBtn onClick={() => handleAction("feature")} color={letter.featured ? "amberActive" : "subtle"} icon={Star} loading={acting === "feature"}>{letter.featured ? "Unfeature" : "Feature"}</ActionBtn>
              <ActionBtn onClick={() => handleAction("archive")} color="subtle" icon={Archive} loading={acting === "archive"}>Archive</ActionBtn>
              <Link to={`/legacy-library/${letter.id}`} className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white/80 text-xs px-3 py-2 rounded-lg">
                <Eye size={12} /> View Public
              </Link>
            </>
          )}
          {(status === "rejected" || status === "archived") && (
            <ActionBtn onClick={() => handleAction("restore")} color="emerald" icon={RotateCcw} loading={acting === "restore"}>Restore</ActionBtn>
          )}
          <ActionBtn onClick={() => handleAction("assign_reviewer")} color="subtle" icon={UserCheck} loading={acting === "assign_reviewer"}>Assign</ActionBtn>
          <ActionBtn onClick={() => handleAction("detect_duplicates")} color="subtle" icon={Copy} loading={acting === "detect_duplicates"}>Duplicates</ActionBtn>
        </div>
      </div>

      {/* Title + Status */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[status]}`}>{STATUS_LABELS[status]}</span>
          <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-medium">{letter.category}</span>
          {letter.featured && <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-medium"><Star size={10} className="inline" fill="currentColor" /> Featured</span>}
          {letter.review_round > 0 && <span className="px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium">Round {letter.review_round}</span>}
          {letter.locked && <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-white/40 text-xs font-medium">Locked</span>}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">{letter.title}</h1>
        {letter.subtitle && <p className="text-white/50 text-lg">{letter.subtitle}</p>}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Letter content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Author Card */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
            {letter.author_photo ? (
              <img src={letter.author_photo} alt="" className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-medium text-lg">{letter.author_name?.charAt(0)}</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white/90 font-medium">{letter.author_name}</span>
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

          {/* Submission Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetaCard icon={Calendar} label="Submitted" value={letter.submitted_at ? new Date(letter.submitted_at).toLocaleDateString() : "—"} />
            <MetaCard icon={UserCheck} label="Assigned" value={letter.assigned_reviewer_name || "Unassigned"} />
            <MetaCard icon={Bot} label="AI Score" value={letter.ai_reviewed_at ? `${letter.ai_moderation_score}%` : "Not run"} />
            <MetaCard icon={Clock} label="Read Time" value={`${letter.ai_reading_time_minutes || 5} min`} />
          </div>

          {/* Message */}
          <div>
            <SectionLabel icon={FileText}>Letter Content</SectionLabel>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown className="text-white/70 leading-relaxed">{letter.message}</ReactMarkdown>
            </div>
          </div>

          {/* Key Lessons */}
          {letter.key_lessons?.length > 0 && (
            <div>
              <SectionLabel icon={ListChecks}>Key Lessons</SectionLabel>
              <ul className="space-y-2">
                {letter.key_lessons.map((lesson, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    {lesson}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Advice */}
          {letter.advice && (
            <div>
              <SectionLabel icon={Lightbulb}>Advice</SectionLabel>
              <p className="text-white/60 text-sm leading-relaxed">{letter.advice}</p>
            </div>
          )}

          {/* Quotes */}
          {letter.quotes?.length > 0 && (
            <div>
              <SectionLabel icon={Quote}>Memorable Quotes</SectionLabel>
              <div className="space-y-3">
                {letter.quotes.map((q, i) => (
                  <blockquote key={i} className="border-l-2 border-indigo-500/30 pl-4 text-white/70 text-sm italic">"{q}"</blockquote>
                ))}
              </div>
            </div>
          )}

          {/* Reflection Questions */}
          {letter.reflection_questions?.length > 0 && (
            <div>
              <SectionLabel icon={HelpCircle}>Reflection Questions</SectionLabel>
              <ul className="space-y-1.5">
                {letter.reflection_questions.map((q, i) => <li key={i} className="text-white/60 text-sm">• {q}</li>)}
              </ul>
            </div>
          )}

          {/* Closing Message */}
          {letter.closing_message && (
            <div className="bg-gradient-to-br from-indigo-500/5 to-transparent border border-indigo-500/10 rounded-xl p-5">
              <div className="text-indigo-400 text-xs font-medium uppercase tracking-widest mb-2">Closing Message</div>
              <p className="text-white/70 text-sm leading-relaxed">{letter.closing_message}</p>
            </div>
          )}

          {/* Revision Notes (if revision_requested) */}
          {status === "revision_requested" && letter.revision_notes && (
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
              <div className="text-blue-400 text-xs font-medium uppercase tracking-widest mb-2">Revision Instructions Sent to Author</div>
              <p className="text-white/60 text-sm leading-relaxed">{letter.revision_notes}</p>
            </div>
          )}

          {/* Rejection Info */}
          {status === "rejected" && (
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
              <div className="text-red-400 text-xs font-medium uppercase tracking-widest mb-2">Rejection Reason: {letter.rejection_reason}</div>
              {letter.rejection_comments && <p className="text-white/60 text-sm leading-relaxed">{letter.rejection_comments}</p>}
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          <div className="sticky top-20 space-y-4">
            <ReviewAIPanel letter={letter} onRerun={() => handleAction("run_ai_review")} loading={acting === "run_ai_review"} />
            <ModeratorChecklist letterId={id} checklistJson={letter.review_checklist_json} />
            <ModeratorNotes letterId={id} initialNotes={letter.moderator_notes} />

            {/* Published Metrics */}
            {isPublished && (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Eye size={14} className="text-indigo-400" />
                  <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Published Metrics</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Metric label="Views" value={formatCount(letter.views)} />
                  <Metric label="Likes" value={formatCount(letter.likes)} />
                  <Metric label="Bookmarks" value={formatCount(letter.bookmarks)} />
                  <Metric label="Comments" value={formatCount(letter.comments_count)} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {rejectOpen && (
        <RejectionModal letter={letter} onClose={() => setRejectOpen(false)} onReject={handleReject} loading={acting === "reject"} />
      )}
      {revisionOpen && (
        <RevisionModal letter={letter} onClose={() => setRevisionOpen(false)} onRequestRevision={handleRequestRevision} loading={acting === "request_revision"} />
      )}
      {assignOpen && (
        <AssignReviewerModal letter={letter} onClose={() => setAssignOpen(false)} onAssign={handleAssign} loading={acting === "assign_reviewer"} />
      )}
    </div>
  );
}

function ActionBtn({ onClick, color, icon: Icon, children, loading }) {
  const colors = {
    emerald: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400",
    red: "bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400",
    blue: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-400",
    amber: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-400",
    amberActive: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    subtle: "bg-white/5 hover:bg-white/10 border-white/10 text-white/50 hover:text-white/80",
  };
  return (
    <button onClick={onClick} disabled={loading} className={`flex items-center gap-1.5 border text-xs px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ${colors[color]}`}>
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Icon size={12} />} {children}
    </button>
  );
}

function MetaCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <Icon size={12} className="text-white/30 mb-1" />
      <div className="text-white/80 text-xs font-medium truncate">{value}</div>
      <div className="text-white/30 text-[10px]">{label}</div>
    </div>
  );
}

function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className="text-indigo-400" />
      <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider">{children}</h2>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <div className="text-white/80 text-sm font-bold">{value}</div>
      <div className="text-white/30 text-[10px]">{label}</div>
    </div>
  );
}