import {
  KeyRound, UserCheck, Users, Crown, Target, Briefcase, Code, FileText,
  GraduationCap, Map, Brain, Shuffle, Lightbulb, Shield, CheckCircle,
  ScrollText, Lock, Terminal, Settings, Building, Zap, Bell, Plug,
  BarChart, Gauge, Server, Database, Monitor, ShoppingBag, CreditCard,
  Receipt, FileCheck, Award, Cpu, MoreHorizontal,
} from 'lucide-react';

export const ACTIVITY_CATEGORIES = [
  { value: 'authentication', label: 'Authentication', icon: KeyRound, color: 'text-blue-400' },
  { value: 'identity', label: 'Identity', icon: UserCheck, color: 'text-cyan-400' },
  { value: 'user_management', label: 'User Management', icon: Users, color: 'text-indigo-400' },
  { value: 'executive', label: 'Executive', icon: Crown, color: 'text-amber-400' },
  { value: 'leadership', label: 'Leadership', icon: Target, color: 'text-purple-400' },
  { value: 'career', label: 'Career', icon: Briefcase, color: 'text-teal-400' },
  { value: 'skills', label: 'Skills', icon: Code, color: 'text-green-400' },
  { value: 'resume', label: 'Resume', icon: FileText, color: 'text-sky-400' },
  { value: 'coaching', label: 'Coaching', icon: GraduationCap, color: 'text-orange-400' },
  { value: 'journey', label: 'Journey', icon: Map, color: 'text-rose-400' },
  { value: 'ai', label: 'AI', icon: Brain, color: 'text-fuchsia-400' },
  { value: 'model_router', label: 'Model Router', icon: Shuffle, color: 'text-violet-400' },
  { value: 'recommendation', label: 'Recommendation', icon: Lightbulb, color: 'text-yellow-400' },
  { value: 'governance', label: 'Governance', icon: Shield, color: 'text-red-400' },
  { value: 'approval', label: 'Approval', icon: CheckCircle, color: 'text-emerald-400' },
  { value: 'audit', label: 'Audit', icon: ScrollText, color: 'text-stone-400' },
  { value: 'security', label: 'Security', icon: Lock, color: 'text-red-500' },
  { value: 'developer', label: 'Developer', icon: Terminal, color: 'text-gray-400' },
  { value: 'operations', label: 'Operations', icon: Settings, color: 'text-blue-300' },
  { value: 'enterprise', label: 'Enterprise', icon: Building, color: 'text-cyan-300' },
  { value: 'automation', label: 'Automation', icon: Zap, color: 'text-amber-300' },
  { value: 'notification', label: 'Notification', icon: Bell, color: 'text-pink-400' },
  { value: 'integration', label: 'Integration', icon: Plug, color: 'text-lime-400' },
  { value: 'analytics', label: 'Analytics', icon: BarChart, color: 'text-indigo-300' },
  { value: 'performance', label: 'Performance', icon: Gauge, color: 'text-yellow-300' },
  { value: 'infrastructure', label: 'Infrastructure', icon: Server, color: 'text-slate-400' },
  { value: 'database', label: 'Database', icon: Database, color: 'text-gray-300' },
  { value: 'api', label: 'API', icon: Code, color: 'text-green-300' },
  { value: 'platform', label: 'Platform', icon: Monitor, color: 'text-blue-200' },
  { value: 'configuration', label: 'Configuration', icon: Settings, color: 'text-zinc-400' },
  { value: 'marketplace', label: 'Marketplace', icon: ShoppingBag, color: 'text-orange-300' },
  { value: 'billing', label: 'Billing', icon: CreditCard, color: 'text-emerald-300' },
  { value: 'subscription', label: 'Subscription', icon: Receipt, color: 'text-teal-300' },
  { value: 'compliance', label: 'Compliance', icon: FileCheck, color: 'text-green-200' },
  { value: 'trust', label: 'Trust', icon: Award, color: 'text-yellow-200' },
  { value: 'system', label: 'System', icon: Cpu, color: 'text-slate-300' },
  { value: 'other', label: 'Other', icon: MoreHorizontal, color: 'text-gray-400' },
];

export const SEVERITIES = [
  { value: 'information', label: 'Information', color: 'text-blue-400', bg: 'bg-blue-500/10', dot: 'bg-blue-400' },
  { value: 'success', label: 'Success', color: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' },
  { value: 'warning', label: 'Warning', color: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-400' },
  { value: 'error', label: 'Error', color: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-400' },
  { value: 'critical', label: 'Critical', color: 'text-red-500', bg: 'bg-red-600/20', dot: 'bg-red-500' },
  { value: 'emergency', label: 'Emergency', color: 'text-purple-400', bg: 'bg-purple-600/20', dot: 'bg-purple-500' },
];

export const STATUSES = [
  { value: 'pending', label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { value: 'in_progress', label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { value: 'completed', label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { value: 'failed', label: 'Failed', color: 'text-red-400', bg: 'bg-red-500/10' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-gray-400', bg: 'bg-gray-500/10' },
];

export const BUSINESS_IMPACTS = [
  { value: 'none', label: 'None', color: 'text-gray-400' },
  { value: 'low', label: 'Low', color: 'text-blue-400' },
  { value: 'medium', label: 'Medium', color: 'text-amber-400' },
  { value: 'high', label: 'High', color: 'text-orange-400' },
  { value: 'critical', label: 'Critical', color: 'text-red-400' },
];

export const WORKSPACES = [
  { value: 'executive', label: 'Executive' },
  { value: 'developer', label: 'Developer' },
  { value: 'operations', label: 'Operations' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'platform', label: 'Platform' },
];

export const TIMEFRAMES = [
  { value: 'today', label: 'Today', hours: 24 },
  { value: 'week', label: 'This Week', hours: 168 },
  { value: 'month', label: 'This Month', hours: 720 },
  { value: 'year', label: 'This Year', hours: 8760 },
  { value: 'all', label: 'All Time', hours: null },
];

export const getCategoryConfig = (value) =>
  ACTIVITY_CATEGORIES.find((c) => c.value === value) || ACTIVITY_CATEGORIES[ACTIVITY_CATEGORIES.length - 1];

export const getSeverityConfig = (value) =>
  SEVERITIES.find((s) => s.value === value) || SEVERITIES[0];

export const getStatusConfig = (value) =>
  STATUSES.find((s) => s.value === value) || STATUSES[0];

export const getImpactConfig = (value) =>
  BUSINESS_IMPACTS.find((i) => i.value === value) || BUSINESS_IMPACTS[0];