import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { History, TrendingUp, Award, Star, BookOpen } from "lucide-react";

/**
 * GrowthTimelineCard — answers "How much have I improved?"
 *
 * Displays recent improvements, milestones unlocked, skills strengthened,
 * and executive achievements — a compact view of recent growth signals.
 */
export default function GrowthTimelineCard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [achievements, journeyEvents, lessons] = await Promise.allSettled([
          base44.entities.Achievement.filter({}, "-created_date", 5),
          base44.entities.JourneyEvent.filter({}, "-created_date", 5),
          base44.entities.LessonProgress.filter({ status: "completed" }, "-updated_date", 5),
        ]);
        const merged = [];
        if (achievements.status === "fulfilled") achievements.value.forEach((a) => merged.push({ id: a.id, type: "achievement", title: a.name || a.description || "Achievement unlocked", icon: a.icon || "🏆", date: a.created_date, path: "/executive-portfolio" }));
        if (journeyEvents.status === "fulfilled") journeyEvents.value.forEach((e) => merged.push({ id: e.id, type: "milestone", title: e.event_label || e.event_type || "Milestone reached", icon: "🚀", date: e.created_date, path: "/journey" }));
        if (lessons.status === "fulfilled") lessons.value.forEach((l) => merged.push({ id: l.id, type: "skill", title: `Completed: ${l.lesson_title || l.course_title || "lesson"}`, icon: "📚", date: l.updated_date || l.created_date, path: "/academy" }));
        merged.sort((a, b) => new Date(b.date) - new Date(a.date));
        setItems(merged.slice(0, 6));
      } catch {}
      setLoading(false);
    })();
  }, []);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History size={16} className="text-cyan-400" />
          <h3 className="text-white font-semibold text-sm">Growth Timeline</h3>
        </div>
        <Link to="/executive-portfolio" className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors">View portfolio →</Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-white/[0.02] rounded-lg shimmer-bg" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8">
          <TrendingUp size={24} className="mx-auto text-white/10 mb-2" />
          <p className="text-white/30 text-xs">Complete challenges, lessons, or simulations to populate your growth timeline.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link key={item.id} to={item.path} className="flex items-center gap-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-lg p-2.5 transition-all group">
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white/80 text-xs truncate group-hover:text-cyan-400 transition-colors">{item.title}</div>
                <div className="text-white/30 text-[10px] mt-0.5">{timeAgo(item.date)}</div>
              </div>
              <Badge type={item.type} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Badge({ type }) {
  const map = {
    achievement: { icon: Award, color: "text-amber-400" },
    milestone: { icon: Star, color: "text-violet-400" },
    skill: { icon: BookOpen, color: "text-emerald-400" },
  };
  const m = map[type] || map.milestone;
  const Icon = m.icon;
  return <Icon size={12} className={`${m.color} flex-shrink-0`} />;
}

function timeAgo(date) {
  if (!date) return "—";
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}