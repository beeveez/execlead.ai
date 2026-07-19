import React from 'react';
import { Briefcase, Lightbulb, Target, Compass, BookOpen, TrendingUp } from 'lucide-react';

function Section({ icon: Icon, title, color, children }) {
  if (!children) return null;
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={color} />
        <h4 className={`text-sm font-semibold ${color}`}>{title}</h4>
      </div>
      {children}
    </div>
  );
}

function parseJSON(str, fallback) {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

export default function ArticleExecutiveFeatures({ article }) {
  const keyInsights = parseJSON(article.key_insights_json, []);
  const leadershipLessons = parseJSON(article.leadership_lessons_json, []);
  const recommendedActions = parseJSON(article.recommended_actions_json, []);
  const relatedModules = parseJSON(article.related_modules_json, []);

  const hasContent = article.executive_summary || keyInsights.length || leadershipLessons.length || recommendedActions.length || relatedModules.length || article.suggested_learning_path;

  if (!hasContent) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Briefcase size={14} className="text-amber-400" />
        <h3 className="text-white font-semibold text-sm">Executive Features™</h3>
      </div>

      {article.executive_summary && (
        <Section icon={Briefcase} title="Executive Summary" color="text-amber-400">
          <p className="text-white/50 text-sm leading-relaxed">{article.executive_summary}</p>
        </Section>
      )}

      {keyInsights.length > 0 && (
        <Section icon={Lightbulb} title="Key Insights" color="text-indigo-400">
          <ul className="space-y-1.5">
            {keyInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-white/50 text-sm">
                <span className="text-indigo-400/50 mt-1 text-xs">◆</span> {insight}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {leadershipLessons.length > 0 && (
        <Section icon={Compass} title="Leadership Lessons" color="text-emerald-400">
          <ul className="space-y-1.5">
            {leadershipLessons.map((lesson, i) => (
              <li key={i} className="flex items-start gap-2 text-white/50 text-sm">
                <span className="text-emerald-400/50 mt-1 text-xs">▸</span> {lesson}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {recommendedActions.length > 0 && (
        <Section icon={Target} title="Recommended Actions" color="text-accent-orange">
          <ul className="space-y-1.5">
            {recommendedActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-white/50 text-sm">
                <span className="text-accent-orange/50 mt-1 text-xs">→</span> {action}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {relatedModules.length > 0 && (
        <Section icon={BookOpen} title="Related EXECLEAD.AI Modules" color="text-blue-400">
          <div className="flex flex-wrap gap-2">
            {relatedModules.map((mod, i) => (
              <a key={i} href={mod.path || '#'} className="text-xs px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors">
                {mod.label}
              </a>
            ))}
          </div>
        </Section>
      )}

      {article.suggested_learning_path && (
        <Section icon={TrendingUp} title="Suggested Learning Path" color="text-purple-400">
          <p className="text-white/50 text-sm leading-relaxed">{article.suggested_learning_path}</p>
        </Section>
      )}
    </div>
  );
}