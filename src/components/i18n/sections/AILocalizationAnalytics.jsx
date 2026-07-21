import React from 'react';
import { BarChart3, Activity, Zap, Globe, ArrowRightLeft, AlertTriangle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AILocalizationAnalytics({ analytics }) {
  const chartData = analytics.requestsPerLanguage.map((l) => ({ name: l.code, requests: l.requests, conversations: l.conversations, fallbacks: l.fallbacks }));

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">AI Localization Analytics™</h3>
        <span className="text-[10px] text-white/30 ml-auto">{analytics.totalRequests.toLocaleString()} total requests</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
          <Activity size={14} className="text-indigo-400" />
          <div className="text-lg font-bold text-white mt-1">{analytics.totalConversations.toLocaleString()}</div>
          <div className="text-[10px] text-white/30">AI Conversations</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
          <ArrowRightLeft size={14} className="text-cyan-400" />
          <div className="text-lg font-bold text-white mt-1">{analytics.languageSwitching.totalSwitches}</div>
          <div className="text-[10px] text-white/30">Language Switches ({analytics.languageSwitching.switchesToday} today)</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
          <AlertTriangle size={14} className="text-amber-400" />
          <div className="text-lg font-bold text-white mt-1">{analytics.totalFallbacks}</div>
          <div className="text-[10px] text-white/30">Fallback Events</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
          <AlertTriangle size={14} className="text-rose-400" />
          <div className="text-lg font-bold text-white mt-1">{analytics.errors.total}</div>
          <div className="text-[10px] text-white/30">Localization Errors</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Requests Per Language</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }} />
            <Bar dataKey="requests" fill="#6366f1" radius={[4, 4, 0, 0]} name="Requests" />
            <Bar dataKey="conversations" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Conversations" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
          <div className="flex items-center gap-1.5 mb-2"><Zap size={12} className="text-violet-400" /><span className="text-[10px] text-white/40">Prompt Translation</span></div>
          <div className="text-sm font-bold text-white">{analytics.promptTranslationUsage.totalCalls.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-400">{analytics.promptTranslationUsage.successRate}% success</div>
          <div className="text-[9px] text-white/30 mt-1">Avg size: {analytics.promptTranslationUsage.avgPromptSizeChars} chars</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
          <div className="flex items-center gap-1.5 mb-2"><Globe size={12} className="text-cyan-400" /><span className="text-[10px] text-white/40">Response Translation</span></div>
          <div className="text-sm font-bold text-white">{analytics.responseTranslationUsage.totalCalls.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-400">{analytics.responseTranslationUsage.successRate}% success</div>
          <div className="text-[9px] text-white/30 mt-1">Avg size: {analytics.responseTranslationUsage.avgResponseSizeChars} chars</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
          <div className="flex items-center gap-1.5 mb-2"><Clock size={12} className="text-indigo-400" /><span className="text-[10px] text-white/40">Latency</span></div>
          <div className="text-sm font-bold text-white">{analytics.latency.avgTotalMs}ms</div>
          <div className="text-[10px] text-white/40">Avg total · P95: {analytics.latency.p95Ms}ms</div>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Most Requested Languages</div>
        <div className="flex flex-wrap gap-1.5">
          {analytics.mostRequestedLanguages.map((l, i) => (
            <span key={l.code} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/60">{i + 1}. {l.name} ({l.requests.toLocaleString()})</span>
          ))}
        </div>
      </div>
    </div>
  );
}