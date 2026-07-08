import { base44 } from "@/api/base44Client";

// ============================================================
// NOTIFICATION SCOPING ENGINE
// Enforces strict multi-tenant isolation. Every notification
// carries metadata that determines who can see it:
//   - user_id:      personal notification (only that user)
//   - visibility:   private | organization | workspace | public
//   - organization_id: target org (for visibility="organization")
//   - workspace:    executive | enterprise | platform | developer
//   - role_scope:   comma-separated role keys (e.g. "platform_admin,super_admin")
//
// Server-side enforcement lives in the getScopedNotifications
// backend function. This helper ensures every creation site
// includes the required scoping metadata.
// ============================================================

export const NOTIFICATION_VISIBILITY = {
  PRIVATE: "private",
  ORGANIZATION: "organization",
  WORKSPACE: "workspace",
  PUBLIC: "public",
};

export const NOTIFICATION_WORKSPACES = {
  EXECUTIVE: "executive",
  ENTERPRISE: "enterprise",
  PLATFORM: "platform",
  DEVELOPER: "developer",
  ALL: "all",
};

/**
 * Create a notification with proper scoping metadata.
 * Defaults to private (only the target user can see it).
 */
export async function createNotification({
  type,
  title,
  message,
  icon = "🔔",
  action_url = "",
  userId = "",
  organizationId = "",
  workspace = "executive",
  visibility = "private",
  roleScope = "",
}) {
  return await base44.entities.Notification.create({
    type,
    title,
    message,
    icon,
    action_url,
    user_id: userId,
    organization_id: organizationId,
    workspace,
    visibility,
    role_scope: roleScope,
    read: false,
  });
}

/**
 * Fetch notifications scoped to the current user via the server-side
 * backend function. This performs authorization checks server-side —
 * the client never receives notifications it shouldn't see.
 */
export async function getScopedNotifications() {
  const response = await base44.functions.invoke("getScopedNotifications", {});
  return response.data?.notifications || [];
}

/**
 * Mark a notification as read (client-side update — safe because
 * the user can only update notifications they can see, and the
 * list is already server-scoped).
 */
export async function markNotificationRead(id) {
  return await base44.entities.Notification.update(id, { read: true });
}