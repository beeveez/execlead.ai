/**
 * EXECLEAD.AI — Workspace-Aware Notification Categories
 * Each workspace has its own set of notification categories.
 * Notifications are strictly isolated: an executive notification
 * never appears in the developer workspace, and vice versa.
 */

export const WORKSPACE_CATEGORIES = {
  executive: [
    { value: "resume_updates", label: "Resume Updates", icon: "📄" },
    { value: "wallet", label: "Wallet", icon: "💰" },
    { value: "referrals", label: "Referrals", icon: "🎁" },
    { value: "payments", label: "Payments", icon: "💳" },
    { value: "coaching", label: "Coaching", icon: "💬" },
    { value: "achievements", label: "Achievements", icon: "🏆" },
    { value: "learning", label: "Learning", icon: "📚" },
    { value: "subscription", label: "Subscription", icon: "🔄" },
  ],
  enterprise: [
    { value: "team_invitations", label: "Team Invitations", icon: "👥" },
    { value: "organization_billing", label: "Org Billing", icon: "🏢" },
    { value: "contracts", label: "Contracts", icon: "📋" },
    { value: "seat_management", label: "Seat Management", icon: "💺" },
    { value: "team_analytics", label: "Team Analytics", icon: "📊" },
    { value: "compliance", label: "Compliance", icon: "✅" },
  ],
  developer: [
    { value: "deployments", label: "Deployments", icon: "🚀" },
    { value: "database_migrations", label: "DB Migrations", icon: "🗄️" },
    { value: "api_health", label: "API Health", icon: "🔌" },
    { value: "feature_flags", label: "Feature Flags", icon: "🏁" },
    { value: "payment_gateway", label: "Payment Gateway", icon: "💳" },
    { value: "email_provider", label: "Email Provider", icon: "📧" },
    { value: "audit_events", label: "Audit Events", icon: "📝" },
    { value: "security_alerts", label: "Security Alerts", icon: "🛡️" },
    { value: "system_health", label: "System Health", icon: "❤️" },
    { value: "backup_status", label: "Backup Status", icon: "💾" },
  ],
  platform: [
    { value: "user_management", label: "User Management", icon: "👥" },
    { value: "marketplace", label: "Marketplace", icon: "🏪" },
    { value: "revenue", label: "Revenue", icon: "💰" },
    { value: "security", label: "Security", icon: "🛡️" },
    { value: "system", label: "System", icon: "⚙️" },
  ],
};

export const SEVERITY_STYLES = {
  info: { label: "Info", color: "#3b82f6", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-l-blue-500" },
  low: { label: "Low", color: "#10b981", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-l-emerald-500" },
  medium: { label: "Medium", color: "#f59e0b", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-l-amber-500" },
  high: { label: "High", color: "#f97316", bg: "bg-orange-500/10", text: "text-orange-400", border: "border-l-orange-500" },
  critical: { label: "Critical", color: "#ef4444", bg: "bg-red-500/10", text: "text-red-400", border: "border-l-red-500" },
};

export const WORKSPACE_META = {
  executive: { label: "Executive", icon: "💼", color: "#6366f1" },
  enterprise: { label: "Enterprise", icon: "🏢", color: "#06b6d4" },
  developer: { label: "Developer", icon: "⚡", color: "#10b981" },
  platform: { label: "Platform", icon: "🛡️", color: "#a855f7" },
};

export function getCategoriesForWorkspace(workspace) {
  return WORKSPACE_CATEGORIES[workspace] || [];
}

export function getCategoryMeta(workspace, categoryValue) {
  const cats = WORKSPACE_CATEGORIES[workspace] || [];
  return cats.find((c) => c.value === categoryValue) || { label: categoryValue, icon: "🔔" };
}