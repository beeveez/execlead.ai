// Beta Feedback Intelligence™ — client-side constants & helpers.

export const FEEDBACK_CATEGORIES = [
  'UX',
  'Executive Readiness Assessment™',
  'Executive Coach™',
  'Executive Simulations™',
  'Executive Decision Lab™',
  'Executive Identity™',
  'Executive Portfolio™',
  'Executive Success Stories™',
  'Executive Outcomes™',
  'Marketing',
  'Performance',
  'Security',
  'AI Quality',
  'Bug',
  'Feature Request',
  'Enhancement',
  'Other',
];

export const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];
export const PRIORITIES = ['Immediate', 'Next Sprint', 'Backlog', 'Future'];
export const STATUSES = [
  'New', 'Triaged', 'Investigating', 'Planned', 'In Development',
  'Testing', 'Resolved', 'Released', 'Rejected', 'Duplicate',
];

export const KANBAN_COLUMNS = [
  { key: 'New', label: 'New', statuses: ['New'], accent: 'border-t-white/30' },
  { key: 'Triaged', label: 'Triaged', statuses: ['Triaged', 'Investigating'], accent: 'border-t-sky-500/60' },
  { key: 'Planned', label: 'Planned', statuses: ['Planned'], accent: 'border-t-indigo-500/60' },
  { key: 'In Development', label: 'Development', statuses: ['In Development'], accent: 'border-t-amber-500/60' },
  { key: 'Testing', label: 'Testing', statuses: ['Testing'], accent: 'border-t-violet-500/60' },
  { key: 'Released', label: 'Released', statuses: ['Released'], accent: 'border-t-emerald-500/60' },
  { key: 'Closed', label: 'Closed', statuses: ['Resolved', 'Rejected', 'Duplicate'], accent: 'border-t-white/15' },
];

export const ROADMAP_RECOMMENDATIONS = [
  'Ship Immediately', 'Next Sprint', 'Future Release',
  'Needs Investigation', 'Duplicate', "Won't Fix",
];

export function columnForStatus(status) {
  const col = KANBAN_COLUMNS.find((c) => c.statuses.includes(status));
  return col ? col.key : 'New';
}

export function statusForColumn(colKey) {
  const col = KANBAN_COLUMNS.find((c) => c.key === colKey);
  return col ? col.statuses[0] : 'New';
}

export const severityColor = {
  Critical: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
  High: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  Medium: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
  Low: 'text-white/50 border-white/15 bg-white/5',
};

export const impactColor = {
  Critical: 'text-rose-400',
  High: 'text-amber-400',
  Medium: 'text-sky-400',
  Low: 'text-white/50',
};

export const statusColor = {
  New: 'text-white/70 bg-white/5 border-white/15',
  Triaged: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
  Investigating: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
  Planned: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
  'In Development': 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  Testing: 'text-violet-400 bg-violet-500/10 border-violet-500/25',
  Resolved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  Released: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
  Rejected: 'text-white/40 bg-white/5 border-white/15',
  Duplicate: 'text-white/40 bg-white/5 border-white/15',
};

export function genFeedbackId() {
  return 'BF-' + Date.now().toString().slice(-6);
}

export function parseJson(str, fallback) {
  try {
    const v = JSON.parse(str);
    return v == null ? fallback : v;
  } catch {
    return fallback;
  }
}

export function detectBrowser() {
  if (typeof navigator === 'undefined') return '';
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return 'Edge';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua)) return 'Safari';
  if (/Firefox\//.test(ua)) return 'Firefox';
  return ua.slice(0, 40);
}

export function detectDevice() {
  if (typeof navigator === 'undefined') return '';
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) return 'Android';
  if (/Mac/.test(ua)) return 'Mac';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown';
}

// Deterministic Feedback Confidence™ mirror (the backend function is the source of truth).
export function computeConfidence(fb, duplicateCount = 0) {
  const sevWeight = { Critical: 40, High: 30, Medium: 20, Low: 10 }[fb.severity] || 15;
  const attachments = parseJson(fb.attachments_json, []).length;
  const ageDays = fb.submitted_at
    ? (Date.now() - new Date(fb.submitted_at).getTime()) / 86400000
    : 999;
  const recencyBonus = ageDays < 7 ? 20 : ageDays < 30 ? 10 : 0;
  return Math.min(100, Math.round(sevWeight + duplicateCount * 5 + attachments * 5 + recencyBonus));
}