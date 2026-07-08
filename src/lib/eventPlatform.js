import {
  MessageCircle, Trophy, GraduationCap, Monitor, Flame, Users, Wrench,
  HelpCircle, Cpu, Building2, Package, Rocket, TrendingUp, Heart, Plane,
  Calendar, Target, Award,
} from 'lucide-react';

export const EVENT_TYPES = [
  { id: 'roundtable', label: 'Executive Roundtable', short: 'Roundtable', icon: MessageCircle, color: 'indigo' },
  { id: 'summit', label: 'Leadership Summit', short: 'Summit', icon: Trophy, color: 'purple' },
  { id: 'masterclass', label: 'Masterclass', short: 'Masterclass', icon: GraduationCap, color: 'blue' },
  { id: 'webinar', label: 'Webinar', short: 'Webinar', icon: Monitor, color: 'cyan' },
  { id: 'fireside_chat', label: 'Fireside Chat', short: 'Fireside', icon: Flame, color: 'orange' },
  { id: 'networking', label: 'Executive Networking', short: 'Networking', icon: Users, color: 'green' },
  { id: 'workshop', label: 'Workshop', short: 'Workshop', icon: Wrench, color: 'amber' },
  { id: 'ama', label: 'AMA Session', short: 'AMA', icon: HelpCircle, color: 'teal' },
  { id: 'ai_briefing', label: 'AI Leadership Briefing', short: 'AI Briefing', icon: Cpu, color: 'violet' },
  { id: 'boardroom', label: 'Boardroom Session', short: 'Boardroom', icon: Building2, color: 'slate' },
  { id: 'product_demo', label: 'Product Demo', short: 'Demo', icon: Package, color: 'pink' },
  { id: 'founder_meetup', label: 'Founder Meetup', short: 'Founders', icon: Rocket, color: 'rose' },
  { id: 'investor_pitch', label: 'Investor Pitch', short: 'Pitch', icon: TrendingUp, color: 'emerald' },
  { id: 'community_meetup', label: 'Community Meetup', short: 'Community', icon: Heart, color: 'red' },
  { id: 'retreat', label: 'Executive Retreat', short: 'Retreat', icon: Plane, color: 'lime' },
  { id: 'ai_strategy', label: 'AI Strategy', short: 'AI Strategy', icon: Target, color: 'violet' },
  { id: 'career_accelerator', label: 'Career Accelerator', short: 'Career', icon: Award, color: 'indigo' },
];

export const COLOR_CLASSES = {
  indigo: { badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20', dot: 'bg-indigo-400', gradient: 'from-indigo-500/20 to-indigo-600/5' },
  purple: { badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20', dot: 'bg-purple-400', gradient: 'from-purple-500/20 to-purple-600/5' },
  blue: { badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20', dot: 'bg-blue-400', gradient: 'from-blue-500/20 to-blue-600/5' },
  cyan: { badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20', dot: 'bg-cyan-400', gradient: 'from-cyan-500/20 to-cyan-600/5' },
  orange: { badge: 'bg-orange-500/10 text-orange-300 border-orange-500/20', dot: 'bg-orange-400', gradient: 'from-orange-500/20 to-orange-600/5' },
  green: { badge: 'bg-green-500/10 text-green-300 border-green-500/20', dot: 'bg-green-400', gradient: 'from-green-500/20 to-green-600/5' },
  amber: { badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20', dot: 'bg-amber-400', gradient: 'from-amber-500/20 to-amber-600/5' },
  teal: { badge: 'bg-teal-500/10 text-teal-300 border-teal-500/20', dot: 'bg-teal-400', gradient: 'from-teal-500/20 to-teal-600/5' },
  violet: { badge: 'bg-violet-500/10 text-violet-300 border-violet-500/20', dot: 'bg-violet-400', gradient: 'from-violet-500/20 to-violet-600/5' },
  slate: { badge: 'bg-slate-500/10 text-slate-300 border-slate-500/20', dot: 'bg-slate-400', gradient: 'from-slate-500/20 to-slate-600/5' },
  pink: { badge: 'bg-pink-500/10 text-pink-300 border-pink-500/20', dot: 'bg-pink-400', gradient: 'from-pink-500/20 to-pink-600/5' },
  rose: { badge: 'bg-rose-500/10 text-rose-300 border-rose-500/20', dot: 'bg-rose-400', gradient: 'from-rose-500/20 to-rose-600/5' },
  emerald: { badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', dot: 'bg-emerald-400', gradient: 'from-emerald-500/20 to-emerald-600/5' },
  red: { badge: 'bg-red-500/10 text-red-300 border-red-500/20', dot: 'bg-red-400', gradient: 'from-red-500/20 to-red-600/5' },
  lime: { badge: 'bg-lime-500/10 text-lime-300 border-lime-500/20', dot: 'bg-lime-400', gradient: 'from-lime-500/20 to-lime-600/5' },
};

export function getEventType(typeId) {
  return EVENT_TYPES.find(t => t.id === typeId) || { id: typeId, label: typeId, short: typeId, icon: Calendar, color: 'slate' };
}

export function getColor(color) {
  return COLOR_CLASSES[color] || COLOR_CLASSES.slate;
}

export const safeParse = (json, fallback) => {
  try { return JSON.parse(json) || fallback; } catch { return fallback; }
};

export function formatDate(dateStr) {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function formatDuration(minutes) {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function toICSDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function generateICS(event) {
  const start = toICSDate(event.start_date);
  const end = toICSDate(event.end_date) || toICSDate(new Date(new Date(event.start_date).getTime() + (event.duration_minutes || 60) * 60000).toISOString());
  const location = event.is_virtual ? (event.meeting_url || 'Virtual') : (event.venue_address || event.location || '');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//EXECLEAD.AI//Event//EN',
    'BEGIN:VEVENT', `UID:${event.id}@execlead.ai`, `DTSTAMP:${start}`,
    `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${event.title}`,
    `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`, 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

export function getGoogleCalendarUrl(event) {
  const start = toICSDate(event.start_date);
  const end = toICSDate(event.end_date) || toICSDate(new Date(new Date(event.start_date).getTime() + (event.duration_minutes || 60) * 60000).toISOString());
  const location = event.is_virtual ? (event.meeting_url || 'Virtual') : (event.venue_address || event.location || '');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(location)}`;
}

export function getOutlookUrl(event) {
  const start = new Date(event.start_date).toISOString();
  const end = new Date(event.end_date || new Date(new Date(event.start_date).getTime() + (event.duration_minutes || 60) * 60000)).toISOString();
  const location = event.is_virtual ? (event.meeting_url || 'Virtual') : (event.venue_address || event.location || '');
  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${start}&enddt=${end}&body=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(location)}`;
}

export function downloadICS(event) {
  const ics = generateICS(event);
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}