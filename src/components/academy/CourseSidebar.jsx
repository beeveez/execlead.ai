import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAcademy } from "@/hooks/useAcademy";
import { flattenLessons } from "@/lib/courseCatalog";
import { Check, Bookmark, NotebookPen, X, ListOrdered } from "lucide-react";

export default function CourseSidebar({ course, currentLessonId, onClose, notes, onSaveNotes }) {
  const { isCompleted, getCourseProgress, getBookmarkedLessons } = useAcademy();
  const [tab, setTab] = useState("outline");
  const [notesVal, setNotesVal] = useState(notes);
  const progress = getCourseProgress(course);
  const flat = flattenLessons(course);
  const bookmarks = getBookmarkedLessons().filter(b => b.course_id === course.slug);

  const tabs = [
    { id: "outline", label: "Outline", icon: ListOrdered },
    { id: "bookmarks", label: "Saved", icon: Bookmark },
    { id: "notes", label: "Notes", icon: NotebookPen }
  ];

  return (
    <div className="lg:bg-white/[0.02] lg:border lg:border-white/5 lg:rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <h3 className="text-white font-semibold text-sm">{course.title}</h3>
        <button onClick={onClose} className="text-white/30"><X size={16} /></button>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5"><span className="text-white/40">Progress</span><span className="text-white/60 font-medium">{progress.percent}%</span></div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${progress.percent}%`, background: course.color }} /></div>
      </div>

      <div className="flex gap-1 mb-4 bg-white/5 rounded-lg p-1">
        {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all ${tab === t.id ? "bg-white/10 text-white/80" : "text-white/30"}`}><t.icon size={12} /> {t.label}</button>)}
      </div>

      <div className="flex-1 overflow-y-auto -mr-2 pr-2">
        {tab === "outline" && flat.map((f, i) => {
          const done = isCompleted(course.slug, f.module.id, f.lesson.id);
          const active = `${f.module.id}_${f.lesson.id}` === currentLessonId;
          return (
            <Link key={i} to={`/academy/${course.slug}/${f.module.id}_${f.lesson.id}`} onClick={onClose} className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-colors mb-0.5 ${active ? "bg-indigo-500/10 text-indigo-400" : "text-white/50 hover:bg-white/5 hover:text-white/80"}`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-emerald-500/20" : "bg-white/5"}`}>{done && <Check size={10} className="text-emerald-400" />}</div>
              <span className="line-clamp-1">{f.lesson.title}</span>
            </Link>
          );
        })}

        {tab === "bookmarks" && (bookmarks.length === 0 ? (
          <p className="text-white/20 text-xs text-center py-8">No bookmarks yet</p>
        ) : bookmarks.map(b => (
          <Link key={b.id} to={`/academy/${course.slug}/${b.lesson_id.replace(`${course.slug}_`, "")}`} onClick={onClose} className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-white/50 hover:bg-white/5 mb-0.5">
            <Bookmark size={12} className="text-amber-400 flex-shrink-0" /> <span className="line-clamp-1">{b.lesson_title}</span>
          </Link>
        )))}

        {tab === "notes" && (
          <div>
            <textarea value={notesVal} onChange={e => setNotesVal(e.target.value)} placeholder="Take notes on this lesson..." rows={10} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-indigo-500/50 resize-none" />
            <button onClick={() => onSaveNotes(notesVal)} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300">Save Notes</button>
          </div>
        )}
      </div>
    </div>
  );
}