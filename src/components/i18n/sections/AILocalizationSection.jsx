import React from 'react';
import { Brain, TrendingUp, Activity, Zap, Globe, Mail, Award, FileText, AlertTriangle, Clock } from 'lucide-react';

function ScoreMetric({ icon: Icon, label, value, suffix, color = '#6366f1', sub }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <Icon size={12} style={{ color }} />
        <span className="text-[10px] text-white/40">{label}</span>
      </div>
      <div className="text-lg font-bold text-white mt-1">{value}{suffix}</div>
      {sub && <div className="text-[9px] text-white/30 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function AILocalizationSection({ score }) {
  const { metrics, health, trend, grade } = score;
  const healthColor = health === 'healthy' ? '#10b981' : health === 'good' ? '#6366f1' : health === 'at_risk' ? '#f59e0b' : '#ef4444';

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Brain size={20} className="text-indigo-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">AI Localization Intelligence™</h3>
            <p className="text-[10px] text-white/30">Overall AI localization score, health, and grade</p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: healthColor }}>{metrics.overallScore}</div>
            <div className="text-[9px] text-white/30">Overall Score</div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <div className="text-xl font-bold text-white">{grade}</div>
            <div className="text-[9px] text-white/30">Grade</div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: `${healthColor}15` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: healthColor }} />
            <span className="text-[10px] font-medium capitalize" style={{ color: healthColor }}>{health}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400">
            <TrendingUp size={10} /> {trend}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <ScoreMetric icon={Activity} label="Language Detection" value={metrics.languageDetectionAccuracy} suffix="%" color="#10b981" />
        <ScoreMetric icon={Zap} label="Prompt Localization" value={metrics.promptLocalization} suffix="%" color="#6366f1" />
        <ScoreMetric icon={Globe} label="Response Localization" value={metrics.responseLocalization} suffix="%" color="#06b6d4" />
        <ScoreMetric icon={Activity} label="Conversation Localization" value={metrics.conversationLocalization} suffix="%" color="#8b5cf6" />
        <ScoreMetric icon={Brain} label="Exec Coaching Localization" value={metrics.executiveCoachingLocalization} suffix="%" color="#f59e0b" />
        <ScoreMetric icon={FileText} label="Exec Report Localization" value={metrics.executiveReportLocalization} suffix="%" color="#3b82f6" />
        <ScoreMetric icon={Zap} label="Notification Localization" value={metrics.notificationLocalization} suffix="%" color="#10b981" />
        <ScoreMetric icon={Mail} label="Email Localization" value={metrics.emailLocalization} suffix="%" color="#06b6d4" />
        <ScoreMetric icon={Award} label="Certificate Localization" value={metrics.certificateLocalization} suffix="%" color="#f59e0b" />
        <ScoreMetric icon={AlertTriangle} label="Fallback Rate" value={metrics.fallbackTranslationRate} suffix="%" color="#ef4444" sub="to English" />
        <ScoreMetric icon={AlertTriangle} label="Unsupported Requests" value={metrics.unsupportedLanguageRequests} color="#f59e0b" sub="this week" />
        <ScoreMetric icon={AlertTriangle} label="Translation Failures" value={metrics.translationFailures} color="#ef4444" sub="this week" />
        <ScoreMetric icon={Clock} label="Avg Response Time" value={metrics.averageResponseTime} suffix="s" color="#6366f1" />
        <ScoreMetric icon={Brain} label="Avg Confidence" value={metrics.averageConfidence} suffix="%" color="#10b981" />
      </div>
    </div>
  );
}