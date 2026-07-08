import { base44 } from "@/api/base44Client";

// ============================================================
// WORKSPACE-AWARE NOTIFICATION ENGINE
// Notifications are strictly isolated by workspace. The backend
// function enforces this: when a workspace is specified, only
// notifications tagged with that workspace (or "all") are returned.
//
// Every notification carries:
//   - workspace:    executive | enterprise | platform | developer | all
//   - category:     workspace-specific category (e.g. wallet, deployments)
//   - severity:     info | low | medium | high | critical
//   - user_id:      personal notification (only that user)
//   - organization_id: target org (for visibility="organization")
//   - visibility:   private | organization | workspace | public
//   - role_scope:   comma-separated role keys
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
  severity = "info",
  category = "",
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
    severity,
    category,
    read: false,
  });
}

/**
 * Fetch notifications scoped to the current user via the server-side
 * backend function. When a workspace is specified, only notifications
 * for that workspace are returned (strict isolation).
 *
 * Returns: { notifications, unreadCounts, totalUnread }
 *   - notifications:  array filtered by the requested workspace
 *   - unreadCounts:   { executive: N, enterprise: N, ... }
 *   - totalUnread:    total across all workspaces
 */
export async function getScopedNotifications(workspace = null) {
  const response = await base44.functions.invoke("getScopedNotifications", { workspace });
  return {
    notifications: response.data?.notifications || [],
    unreadCounts: response.data?.unreadCounts || {},
    totalUnread: response.data?.totalUnread || 0,
  };
}

/**
 * Mark a notification as read (client-side update — safe because
 * the user can only update notifications they can see, and the
 * list is already server-scoped).
 */
export async function markNotificationRead(id) {
  return await base44.entities.Notification.update(id, { read: true });
}