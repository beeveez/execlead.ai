import React, { useState, useMemo } from "react";
import { parseJSON } from "@/lib/reputationConfig";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceDot, Area, ComposedChart,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Trophy, ArrowUpRight, Calendar, Activity } from "lucide-react";

const TIME_FILTERS = [
  { id: '30d', label: '30 Days', days: 30 },
  { id: '90d', label: '90 Days', days: 90 },
  { id: '1y', label: '1 Year', days: 365 },
  { id: 'lifetime', label: 'Lifetime', days: null },
];

export default function ReputationHistory({ rep, history }) {
  const [filter, setFilter] = useState('90d');

  const { chartData, milestones, stats } = useMemo(() => {
    return buildChartData(rep, history, filter);
  }, [rep, history, filter]);

  const TrendIcon = stats.trend === 'up' ? TrendingUp : stats.trend === 'down' ? TrendingDown : Minus;
  const trendColor = stats.trend === 'up' ? 'text-emerald-400' : stats.trend === 'down' ? 'text-red-400' : 'text-white/40';

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-indigo-400" />
          <h2 className="text-sm font-semibold text-white/90">Reputation History</h2>
        </div>
        <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
          {TIME_FILTERS.map((tf) => (
            <button key={tf.id} onClick={() => setFilter(tf.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${filter === tf.id ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/40 hover:text-white/60'}`}>
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard icon={Trophy} label="Highest Achieved" value={stats.highest} color="text-amber-400" />
        <StatCard icon={ArrowUpRight} label="Total Gained" value={`+${stats.totalGained}`} color="text-emerald-400" />
        <StatCard icon={Activity} label="Largest Increase" value={`+${stats.largestIncrease}`} color="text-cyan-400" />
        <StatCard icon={TrendIcon} label="Growth Trend" value={stats.trend} color={trendColor} />
      </div>

      {/* Chart */}
      {chartData.length > 1 ? (
        <div className="w-full h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="repGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} tickLine={false} interval="preserveStartEnd" minTickGap={30} />
              <YAxis domain={[0, 'dataMax + 50']} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.3)', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="score" stroke="none" fill="url(#repGradient)" />
              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#6366f1', stroke: '#0a0a0f', strokeWidth: 2 }} />
              {milestones.map((m, i) => (
                <ReferenceDot key={i} x={m.label} y={m.score} r={5} fill={m.color} stroke="#0a0a0f" strokeWidth={2} isFront />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-48 flex flex-col items-center justify-center text-center">
          <Calendar size={24} className="text-white/20 mb-2" />
          <p className="text-white/40 text-sm">Not enough history data yet.</p>
          <p className="text-white/30 text-xs mt-1">Your reputation trend will appear here as you earn recognition over time.</p>
        </div>
      )}

      {/* Milestone Legend */}
      {milestones.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px]">
          <span className="flex items-center gap-1 text-white/40"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Badge Earned</span>
          <span className="flex items-center gap-1 text-white/40"><span className="w-2 h-2 rounded-full bg-indigo-400" /> Tier Up</span>
          <span className="flex items-center gap-1 text-white/40"><span className="w-2 h-2 rounded-full bg-amber-400" /> Legacy Milestone</span>
          <span className="flex items-center gap-1 text-white/40"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Verification</span>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3">
      <div className="flex items-center gap-1 text-white/30 text-[10px] mb-1"><Icon size={11} /> {label}</div>
      <div className={`text-sm font-bold capitalize ${color}`}>{value}</div>
    </div>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const change = d.change;
  return (
    <div className="bg-[#0d0d14] border border-white/10 rounded-lg p-3 shadow-xl text-xs">
      <div className="text-white/50 mb-1">{d.fullDate}</div>
      <div className="text-white/90 font-bold text-sm">{d.score} <span className="text-white/30 font-normal text-[10px]">/ 1000</span></div>
      {change !== 0 && change !== undefined && (
        <div className={`text-[11px] font-semibold ${change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {change > 0 ? '+' : ''}{change} pts
        </div>
      )}
      {d.event && (
        <div className="text-indigo-400 text-[11px] mt-1 flex items-center gap-1">
          <span>{d.eventIcon}</span> {d.event}
        </div>
      )}
    </div>
  );
}

/* ── Chart data builder ────────────────────────────────────── */
function buildChartData(rep, auditHistory, filterId) {
  const qualityHistory = parseJSON(rep?.quality_history_json, {});
  const monthly = qualityHistory.monthly || [];
  const filterDays = TIME_FILTERS.find(t => t.id === filterId)?.days;
  const now = Date.now();
  const cutoff = filterDays ? now - filterDays * 86400000 : 0;

  // Build score timeline from audit history (recalculations, adjustments)
  const scorePoints = [];
  const startScore = rep?.previous_score || 0;
  const currentScore = rep?.reputation_score || 0;

  // If we have audit entries, use them; otherwise synthesize start → current
  const auditPoints = (auditHistory || [])
    .filter(h => h.timestamp)
    .map(h => ({ ts: new Date(h.timestamp).getTime(), score: h.new_score || 0, change: h.change_amount || 0, reason: h.reason, source: h.source, action_type: h.action_type }))
    .filter(p => p.ts >= cutoff)
    .sort((a, b) => a.ts - b.ts);

  // Start point: either first audit or a synthetic baseline
  if (auditPoints.length > 0) {
    scorePoints.push({ ts: auditPoints[0].ts - 86400000, score: startScore, change: 0, event: null });
    auditPoints.forEach(p => scorePoints.push(p));
  } else {
    // No audit history — synthesize from monthly quality data
    const baseTs = rep?.created_date ? new Date(rep.created_date).getTime() : now - 90 * 86400000;
    scorePoints.push({ ts: baseTs, score: startScore, change: 0, event: null });
    if (currentScore !== startScore) {
      scorePoints.push({ ts: now, score: currentScore, change: currentScore - startScore, event: null });
    }
  }

  // Always ensure current score is represented at the end
  const lastPoint = scorePoints[scorePoints.length - 1];
  if (!lastPoint || lastPoint.score !== currentScore) {
    scorePoints.push({ ts: now, score: currentScore, change: currentScore - (lastPoint?.score || 0), event: null });
  }

  // Map to chart format
  const chartData = scorePoints.map((p, i) => {
    const date = new Date(p.ts);
    return {
      ts: p.ts,
      score: p.score,
      change: i === 0 ? 0 : p.score - scorePoints[i - 1].score,
      label: formatLabel(date, filterId),
      fullDate: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      event: p.source ? formatEvent(p.source, p.reason) : null,
      eventIcon: getEventIcon(p.source),
    };
  });

  // Build milestone markers from badges, achievements, tier changes, verification
  const milestones = [];
  const badges = parseJSON(rep?.badges_json, []);
  const achievements = parseJSON(rep?.achievements_json, []);
  const milestonesData = parseJSON(rep?.milestones_json, []);

  badges.forEach(b => {
    if (!b.earned_at) return;
    const ts = new Date(b.earned_at).getTime();
    if (ts < cutoff) return;
    const point = findNearestPoint(chartData, ts);
    if (point) milestones.push({ ...point, label: point.label, color: '#10b981', type: 'badge', name: b.id });
  });
  achievements.forEach(a => {
    if (!a.earned_at) return;
    const ts = new Date(a.earned_at).getTime();
    if (ts < cutoff) return;
    const point = findNearestPoint(chartData, ts);
    if (point) milestones.push({ ...point, label: point.label, color: '#10b981', type: 'achievement', name: a.id });
  });
  milestonesData.forEach(m => {
    if (!m.earned_at) return;
    const ts = new Date(m.earned_at).getTime();
    if (ts < cutoff) return;
    const point = findNearestPoint(chartData, ts);
    if (point) milestones.push({ ...point, label: point.label, color: '#f59e0b', type: 'legacy', name: m.id });
  });

  // Tier change milestones from audit history
  (auditHistory || []).forEach(h => {
    if (!h.timestamp) return;
    const ts = new Date(h.timestamp).getTime();
    if (ts < cutoff) return;
    if (h.source === 'recalculation' || h.source === 'badge_earned') {
      // Check if this caused a tier change by comparing score to tier boundaries
      const point = findNearestPoint(chartData, ts);
      if (point && h.change_amount > 0) {
        // Only mark significant jumps
      }
    }
  });

  // Verification milestone
  if (rep?.created_date && rep?.last_calculated_at) {
    // Approximate verification — if verified_executive badge exists
    const verBadge = badges.find(b => b.id === 'verified_executive');
    if (verBadge?.earned_at) {
      const ts = new Date(verBadge.earned_at).getTime();
      if (ts >= cutoff) {
        const point = findNearestPoint(chartData, ts);
        if (point) milestones.push({ ...point, label: point.label, color: '#06b6d4', type: 'verification', name: 'Identity Verified' });
      }
    }
  }

  // Deduplicate milestones by label+type
  const seen = new Set();
  const uniqueMilestones = milestones.filter(m => {
    const key = `${m.label}-${m.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Stats
  const scores = chartData.map(d => d.score);
  const highest = scores.length > 0 ? Math.max(...scores) : 0;
  const totalGained = (scores[scores.length - 1] || 0) - (scores[0] || 0);
  const increases = chartData.filter(d => d.change > 0).map(d => d.change);
  const largestIncrease = increases.length > 0 ? Math.max(...increases) : 0;
  const trend = totalGained > 5 ? 'up' : totalGained < -5 ? 'down' : 'stable';

  return {
    chartData,
    milestones: uniqueMilestones,
    stats: { highest, totalGained: Math.max(0, totalGained), largestIncrease, trend },
  };
}

function findNearestPoint(chartData, targetTs) {
  if (!chartData.length) return null;
  let nearest = chartData[0];
  let minDiff = Math.abs(chartData[0].ts - targetTs);
  for (const p of chartData) {
    const diff = Math.abs(p.ts - targetTs);
    if (diff < minDiff) { minDiff = diff; nearest = p; }
  }
  return nearest;
}

function formatLabel(date, filterId) {
  if (filterId === 'lifetime' || filterId === '1y') {
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatEvent(source, reason) {
  const map = {
    recalculation: 'Recalculated',
    badge_earned: 'Badge Earned',
    badge_revoked: 'Badge Revoked',
    manual_adjustment: 'Score Adjusted',
    community_recognition: 'Award Received',
    suspension: 'Suspended',
    restoration: 'Restored',
    feature: 'Featured',
    achievement_earned: 'Achievement',
    milestone_reached: 'Milestone',
  };
  return map[source] || reason || 'Update';
}

function getEventIcon(source) {
  const map = {
    badge_earned: '🎉', badge_revoked: '❌', manual_adjustment: '✏️',
    community_recognition: '🏆', suspension: '⚠️', restoration: '✅',
    feature: '⭐', recalculation: '📊', achievement_earned: '🏆', milestone_reached: '🎯',
  };
  return map[source] || '📊';
}