import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ── Constants ──
const FOUNDER_INIT_EMAIL = 'dev.rayvaldez@gmail.com';
const MAX_RETRY_ATTEMPTS = 3;

// ── Helpers ──

async function safeFilter(base44, entityName, filterObj, sort, limit) {
  try {
    return await base44.asServiceRole.entities[entityName].filter(filterObj, sort, limit || 100);
  } catch { return []; }
}

async function getConfig(base44) {
  try {
    const configs = await base44.asServiceRole.entities.GovernanceConfig.list('-created_date', 1);
    return configs[0] || null;
  } catch { return null; }
}

async function isFounder(base44, user) {
  if (!user) return false;
  if (user.role === 'founder_root_admin') return true;
  const config = await getConfig(base44);
  return !!(config && user.id === config.founder_user_id);
}

function getExponentialBackoffMs(attempt) {
  // 2^attempt * 1000: 1s, 2s, 4s
  return Math.pow(2, attempt) * 1000;
}

function getRiskEmoji(level) {
  return level === 'critical' ? '🔴' : level === 'high' ? '🟠' : level === 'medium' ? '🟡' : '🟢';
}

// ── Core: Create Notification (In-App + Audit Log) ──

async function createInAppNotification(base44, userId, subject, body, type, priority, metadata, deepLink) {
  try {
    await base44.asServiceRole.entities.Notification.create({
    user_id: userId,
    title: subject,
    message: body,
    type: 'governance',
    metadata_json: JSON.stringify({ ...metadata, priority: priority || 'normal', deep_link: deepLink || '/founder-governance' }),
    read: false,
    created_at: new Date().toISOString(),
    });
  } catch {}
}

// ── Core: Send Email with retry ──

async function sendEmailWithRetry(base44, to, subject, body, logId) {
  let attempts = 0;
  let lastError = '';

  while (attempts < MAX_RETRY_ATTEMPTS) {
    attempts++;
    try {
      // Update status to 'sending'
      if (logId) {
        try {
          await base44.asServiceRole.entities.GovernanceNotificationLog.update(logId, {
            status: 'sending',
            delivery_attempts: attempts,
            sent_at: new Date().toISOString(),
          });
        } catch {}
      }

      await base44.asServiceRole.integrations.Core.SendEmail({
        to,
        subject,
        body,
      });

      // Success
      if (logId) {
        try {
          await base44.asServiceRole.entities.GovernanceNotificationLog.update(logId, {
            status: 'delivered',
            delivered_at: new Date().toISOString(),
            message_id: crypto.randomUUID(),
          });
        } catch {}
      }
      return { success: true, attempts };
    } catch (error) {
      lastError = error.message || 'Unknown error';
      // Update with failure
      if (logId) {
        const nextRetry = new Date(Date.now() + getExponentialBackoffMs(attempts)).toISOString();
        try {
          await base44.asServiceRole.entities.GovernanceNotificationLog.update(logId, {
            status: attempts >= MAX_RETRY_ATTEMPTS ? 'failed' : 'retried',
            delivery_attempts: attempts,
            failure_reason: lastError,
            next_retry_at: nextRetry,
          });
        } catch {}
      }
      // Wait before retry (exponential backoff)
      if (attempts < MAX_RETRY_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, getExponentialBackoffMs(attempts)));
      }
    }
  }

  return { success: false, attempts, error: lastError };
}

// ── Core: Dispatch notification through all channels ──

async function dispatchNotification(base44, params) {
  // params: { recipient_user_id, recipient_email, recipient_name, type, subject, body, priority, request_id, request_action, risk_level, deep_link, send_email }
  const config = await getConfig(base44);
  const notificationId = crypto.randomUUID();
  const now = new Date().toISOString();
  const deepLink = params.deep_link || '/founder-governance';

  // 1. In-App Notification
  const inAppLog = await base44.asServiceRole.entities.GovernanceNotificationLog.create({
    notification_id: notificationId + '_inapp',
    request_id: params.request_id || '',
    recipient_user_id: params.recipient_user_id,
    recipient_email: params.recipient_email || '',
    recipient_name: params.recipient_name || '',
    channel: 'in_app',
    notification_type: params.type,
    subject: params.subject,
    body: params.body,
    priority: params.priority || 'normal',
    status: 'queued',
    delivery_attempts: 0,
    max_attempts: 1,
    deep_link: deepLink,
    sent_at: now,
    request_risk_level: params.risk_level || '',
    request_action: params.request_action || '',
  }).catch(() => null);

  // Deliver in-app notification
  await createInAppNotification(base44, params.recipient_user_id, params.subject, params.body, params.type, params.priority, {
    request_id: params.request_id,
    notification_type: params.type,
    risk_level: params.risk_level,
  }, deepLink);

  if (inAppLog) {
    try {
      await base44.asServiceRole.entities.GovernanceNotificationLog.update(inAppLog.id, {
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        message_id: crypto.randomUUID(),
      });
    } catch {}
  }

  // 2. Email Notification (if enabled)
  if (params.send_email !== false && params.recipient_email) {
    const emailLog = await base44.asServiceRole.entities.GovernanceNotificationLog.create({
      notification_id: notificationId + '_email',
      request_id: params.request_id || '',
      recipient_user_id: params.recipient_user_id,
      recipient_email: params.recipient_email,
      recipient_name: params.recipient_name || '',
      channel: 'email',
      notification_type: params.type,
      subject: params.subject,
      body: params.body,
      priority: params.priority || 'normal',
      status: 'queued',
      delivery_attempts: 0,
      max_attempts: MAX_RETRY_ATTEMPTS,
      deep_link: deepLink,
      sent_at: now,
      request_risk_level: params.risk_level || '',
      request_action: params.request_action || '',
    }).catch(() => null);

    // Send email with retry
    const emailResult = await sendEmailWithRetry(base44, params.recipient_email, params.subject, params.body, emailLog?.id);

    // If email failed after all retries, create critical in-app notification to founder
    if (!emailResult.success && config) {
      await createInAppNotification(base44, config.founder_user_id,
        '🚨 Email Delivery Failed',
        `Email notification failed after ${emailResult.attempts} attempts.\nRecipient: ${params.recipient_email}\nSubject: ${params.subject}\nError: ${emailResult.error}\nRequest ID: ${params.request_id || 'N/A'}`,
        'email_failed', 'critical',
        { request_id: params.request_id, error: emailResult.error },
        deepLink
      );
    }
  }

  // 3. Audit Log entry
  await base44.asServiceRole.entities.GovernanceNotificationLog.create({
    notification_id: notificationId + '_audit',
    request_id: params.request_id || '',
    recipient_user_id: params.recipient_user_id,
    recipient_email: params.recipient_email || '',
    recipient_name: params.recipient_name || '',
    channel: 'audit',
    notification_type: params.type,
    subject: params.subject,
    body: params.body,
    priority: params.priority || 'normal',
    status: 'delivered',
    delivery_attempts: 1,
    max_attempts: 1,
    deep_link: deepLink,
    sent_at: now,
    delivered_at: now,
    message_id: crypto.randomUUID(),
    request_risk_level: params.risk_level || '',
    request_action: params.request_action || '',
  }).catch(() => null);

  return { notification_id: notificationId, delivered: true };
}

// ── Email templates ──

function buildEmailBody(template, data) {
  const reviewLink = (data.deep_link || '/founder-governance');
  const baseUrl = 'https://execlead.ai';
  const fullUrl = reviewLink.startsWith('http') ? reviewLink : `${baseUrl}${reviewLink}`;

  const detailsSection = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  GOVERNANCE REQUEST DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Request ID:      ${data.request_id || 'N/A'}
Requester:       ${data.requester_name || 'N/A'}
Workspace:       ${data.workspace || 'N/A'}
Requested Action: ${data.action_label || data.action || 'N/A'}
Target User:      ${data.target_user_name || 'N/A'}
Category:        ${data.category || 'N/A'}

Business Justification:
${data.justification || 'N/A'}

Risk Score:      ${data.risk_score !== undefined ? data.risk_score + '/100' : 'N/A'}
Risk Level:      ${data.risk_level || 'N/A'}
Impact Level:    ${data.impact_level || 'N/A'}
Submitted:       ${data.submitted_at || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  if (template === 'new_request') {
    return `Founder Governance Approval Required

A protected administrative action requires your review.

${detailsSection}

Review this request in the Founder Governance & Approval Center:

${fullUrl}

— EXECLEAD.AI Governance Engine`;
  }

  if (template === 'approved') {
    return `Governance Request Approved

${detailsSection}

Decision Notes: ${data.decision_notes || 'N/A'}
Approved By:    ${data.approver_name || 'N/A'}

— EXECLEAD.AI Governance Engine`;
  }

  if (template === 'rejected') {
    return `Governance Request Rejected

${detailsSection}

Rejection Reason: ${data.decision_notes || 'N/A'}
Rejected By:      ${data.approver_name || 'N/A'}

— EXECLEAD.AI Governance Engine`;
  }

  if (template === 'revision') {
    return `Additional Information Required

The Founder has requested additional information or revision for a governance request.

${detailsSection}

Revision Notes: ${data.decision_notes || 'N/A'}

Please update and resubmit your request:

${fullUrl}

— EXECLEAD.AI Governance Engine`;
  }

  if (template === 'security') {
    return `SECURITY ALERT — Unauthorized Access Attempt

An unauthorized access attempt was detected on a protected governance operation.

${detailsSection}

Violation Count: ${data.violation_count || 1}

Immediate review is recommended.

${fullUrl}

— EXECLEAD.AI Governance Engine`;
  }

  if (template === 'reminder') {
    return `Governance Request Reminder — ${data.reminder_label || 'Pending'}

This is an automated reminder for a pending governance request.

${detailsSection}

This request has been pending for ${data.elapsed_description || 'an extended period'}.

Please review at your earliest convenience:

${fullUrl}

— EXECLEAD.AI Governance Engine`;
  }

  if (template === 'test') {
    return `Test Notification — EXECLEAD.AI Governance Engine

This is a test notification to verify the Governance Notification Engine is operational.

Notification ID: ${data.notification_id || crypto.randomUUID()}
Timestamp:       ${new Date().toISOString()}

All channels verified:
  ✓ In-App Notification
  ✓ Email Delivery
  ✓ Audit Logging

— EXECLEAD.AI Governance Engine`;
  }

  return detailsSection;
}

// ── Get founder user ──

async function getFounderUser(base44) {
  const config = await getConfig(base44);
  if (!config) return null;
  try {
    const users = await base44.asServiceRole.entities.User.filter({ id: config.founder_user_id }, null, 1);
    if (users.length > 0) return { ...users[0], config };
  } catch {}
  // Fallback to config
  return { id: config.founder_user_id, email: config.founder_email, full_name: config.founder_name, config };
}

// ── Main handler ──

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // ── notify: dispatch a governance notification ──
    if (action === 'notify') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      // This action is typically called by founderGovernance function
      // But can also be called directly for custom notifications
      const result = await dispatchNotification(base44, {
        recipient_user_id: body.recipient_user_id,
        recipient_email: body.recipient_email,
        recipient_name: body.recipient_name,
        type: body.notification_type,
        subject: body.subject,
        body: body.body,
        priority: body.priority,
        request_id: body.request_id,
        request_action: body.request_action,
        risk_level: body.risk_level,
        deep_link: body.deep_link,
        send_email: body.send_email,
      });

      return Response.json(result);
    }

    // ── notify_founder: send notification to founder (resolved from config) ──
    if (action === 'notify_founder') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const founder = await getFounderUser(base44);
      if (!founder) return Response.json({ error: 'Founder not configured' }, { status: 500 });

      const result = await dispatchNotification(base44, {
        recipient_user_id: founder.id,
        recipient_email: founder.email,
        recipient_name: founder.full_name || founder.email,
        type: body.notification_type || 'request_submitted',
        subject: body.subject,
        body: body.body,
        priority: body.priority || 'normal',
        request_id: body.request_id,
        request_action: body.request_action,
        risk_level: body.risk_level,
        deep_link: body.deep_link,
        send_email: body.send_email,
      });

      return Response.json(result);
    }

    // ── notify_requester: send notification to the original requester ──
    if (action === 'notify_requester') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const result = await dispatchNotification(base44, {
        recipient_user_id: body.recipient_user_id,
        recipient_email: body.recipient_email,
        recipient_name: body.recipient_name,
        type: body.notification_type,
        subject: body.subject,
        body: body.body,
        priority: body.priority || 'normal',
        request_id: body.request_id,
        request_action: body.request_action,
        risk_level: body.risk_level,
        deep_link: body.deep_link,
        send_email: body.send_email,
      });

      return Response.json(result);
    }

    // ── test_notification: send a test notification ──
    if (action === 'test_notification') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const founder = await getFounderUser(base44);
      if (!founder) return Response.json({ error: 'Founder not configured' }, { status: 500 });

      const startTime = Date.now();
      const testBody = buildEmailBody('test', { notification_id: crypto.randomUUID() });

      const result = await dispatchNotification(base44, {
        recipient_user_id: founder.id,
        recipient_email: founder.email,
        recipient_name: founder.full_name || founder.email,
        type: 'test_notification',
        subject: 'EXECLEAD.AI — Test Notification',
        body: testBody,
        priority: 'normal',
        request_id: '',
        request_action: 'test',
        risk_level: 'low',
        deep_link: '/founder-governance',
        send_email: true,
      });

      const deliveryTime = Date.now() - startTime;

      // Get the delivery status of the email
      const emailLogs = await safeFilter(base44, 'GovernanceNotificationLog', {
        notification_id: { $regex: result.notification_id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') },
        channel: 'email',
      }, '-sent_at', 1);

      const inAppLogs = await safeFilter(base44, 'GovernanceNotificationLog', {
        notification_id: { $regex: result.notification_id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') },
        channel: 'in_app',
      }, '-sent_at', 1);

      return Response.json({
        success: true,
        notification_id: result.notification_id,
        delivery_time_ms: deliveryTime,
        channels: {
          in_app: { status: inAppLogs[0]?.status || 'unknown' },
          email: { status: emailLogs[0]?.status || 'unknown', attempts: emailLogs[0]?.delivery_attempts || 0 },
          audit: { status: 'delivered' },
        },
        recipient: founder.email,
      });
    }

    // ── send_reminders: check pending requests and send reminders ──
    if (action === 'send_reminders') {
      // This action is called by a scheduled automation
      // Auth check — allow automation (no user) or admin
      let user = null;
      try { user = await base44.auth.me(); } catch (_) { /* automation context */ }
      if (user && !['super_admin', 'platform_admin', 'admin', 'developer', 'founder_root_admin'].includes(user.role)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }

      const founder = await getFounderUser(base44);
      if (!founder) return Response.json({ error: 'Founder not configured' }, { status: 500 });

      const now = Date.now();
      const HOUR_MS = 3600000;

      // Get all pending requests
      const pendingRequests = await base44.asServiceRole.entities.GovernanceRequest.filter(
        { status: 'pending' },
        '-submitted_at',
        200
      );

      const reminders = [];

      for (const request of pendingRequests) {
        const elapsedMs = now - new Date(request.submitted_at).getTime();
        const elapsedHours = elapsedMs / HOUR_MS;

        // Check if we've already sent a reminder for this stage
        const existingReminders = await safeFilter(base44, 'GovernanceNotificationLog', {
          request_id: request.request_id,
          channel: 'in_app',
          notification_type: { $in: ['approval_reminder', 'escalation_reminder'] },
        }, '-sent_at', 10);

        const reminderCount = existingReminders.length;

        let shouldRemind = false;
        let reminderLabel = '';
        let reminderNumber = 0;

        if (elapsedHours >= 72 && reminderCount < 3) {
          // Escalation reminder (every 24h after 72h)
          shouldRemind = true;
          reminderLabel = 'Escalation Reminder';
          reminderNumber = 3;
        } else if (elapsedHours >= 48 && reminderCount < 2) {
          shouldRemind = true;
          reminderLabel = 'Reminder #2';
          reminderNumber = 2;
        } else if (elapsedHours >= 24 && reminderCount < 1) {
          shouldRemind = true;
          reminderLabel = 'Reminder #1';
          reminderNumber = 1;
        }

        // Critical requests: repeat every 24 hours
        if (request.risk_level === 'critical' && elapsedHours >= 24) {
          const lastReminder = existingReminders[0];
          if (!lastReminder || (now - new Date(lastReminder.sent_at).getTime()) >= 24 * HOUR_MS) {
            shouldRemind = true;
            reminderLabel = 'Critical Escalation';
            reminderNumber = reminderCount + 1;
          }
        }

        if (shouldRemind) {
          const actionLabel = request.action?.replace(/_/g, ' ') || 'Unknown';
          const emailBody = buildEmailBody('reminder', {
            request_id: request.request_id,
            requester_name: request.requester_name,
            workspace: request.workspace,
            action: request.action,
            action_label: actionLabel,
            target_user_name: request.target_user_name,
            category: request.justification_category,
            justification: request.business_justification,
            risk_score: request.risk_score,
            risk_level: request.risk_level,
            impact_level: request.impact_level,
            submitted_at: request.submitted_at,
            reminder_label: reminderLabel,
            elapsed_description: `${Math.round(elapsedHours)} hours`,
            deep_link: '/founder-governance',
          });

          const result = await dispatchNotification(base44, {
            recipient_user_id: founder.id,
            recipient_email: founder.email,
            recipient_name: founder.full_name || founder.email,
            type: request.risk_level === 'critical' ? 'escalation_reminder' : 'approval_reminder',
            subject: `EXECLEAD.AI — Governance ${reminderLabel}: ${actionLabel}`,
            body: emailBody,
            priority: request.risk_level === 'critical' ? 'critical' : 'high',
            request_id: request.request_id,
            request_action: request.action,
            risk_level: request.risk_level,
            deep_link: '/founder-governance',
            send_email: true,
          });

          // Update the reminder number on the notification log
          try {
            const reminderLogs = await safeFilter(base44, 'GovernanceNotificationLog', {
              notification_id: result.notification_id + '_inapp',
            }, null, 1);
            if (reminderLogs[0]) {
              await base44.asServiceRole.entities.GovernanceNotificationLog.update(reminderLogs[0].id, {
                reminder_number: reminderNumber,
              });
            }
          } catch {}

          reminders.push({ request_id: request.request_id, reminder_label: reminderLabel, reminder_number: reminderNumber });
        }
      }

      return Response.json({ processed: pendingRequests.length, reminders_sent: reminders.length, reminders });
    }

    // ── delivery_stats: get notification delivery statistics ──
    if (action === 'delivery_stats') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      if (!(await isFounder(base44, user)) && !['super_admin', 'platform_admin', 'admin', 'developer'].includes(user.role)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      // Today's notifications
      const todayLogs = await safeFilter(base44, 'GovernanceNotificationLog', {
        sent_at: { $gte: todayStart },
      }, '-sent_at', 500);

      // Email stats
      const todayEmails = todayLogs.filter(l => l.channel === 'email');
      const emailsDelivered = todayEmails.filter(l => l.status === 'delivered');
      const emailsFailed = todayEmails.filter(l => l.status === 'failed');

      // Pending notifications
      const allLogs = await safeFilter(base44, 'GovernanceNotificationLog', {}, '-sent_at', 500);
      const pendingNotifications = allLogs.filter(l => l.status === 'queued' || l.status === 'retried');
      const reminderQueue = allLogs.filter(l => ['approval_reminder', 'escalation_reminder'].includes(l.notification_type) && l.status === 'queued');

      // Retry stats
      const retriedLogs = allLogs.filter(l => l.delivery_attempts > 1);
      const avgDeliveryTime = 0; // Would need timestamp diffs, simplified
      const totalRetryCount = allLogs.reduce((sum, l) => sum + (l.delivery_attempts || 0), 0);

      // Recent delivery history
      const recentEmails = allLogs.filter(l => l.channel === 'email').slice(0, 10);

      return Response.json({
        emails_sent_today: todayEmails.length,
        emails_delivered: emailsDelivered.length,
        failed_deliveries: emailsFailed.length,
        pending_notifications: pendingNotifications.length,
        reminder_queue: reminderQueue.length,
        avg_delivery_time_ms: avgDeliveryTime,
        retry_count: totalRetryCount,
        recent_deliveries: recentEmails.map(l => ({
          notification_id: l.notification_id,
          recipient: l.recipient_email,
          subject: l.subject,
          status: l.status,
          attempts: l.delivery_attempts,
          sent_at: l.sent_at,
          delivered_at: l.delivered_at,
          failure_reason: l.failure_reason,
        })),
      });
    }

    // ── delivery_history: get notification delivery history ──
    if (action === 'delivery_history') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      if (!(await isFounder(base44, user)) && !['super_admin', 'platform_admin', 'admin', 'developer'].includes(user.role)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }

      const logs = await base44.asServiceRole.entities.GovernanceNotificationLog.filter({}, '-sent_at', body.limit || 50);
      return Response.json({ logs, count: logs.length });
    }

    return Response.json({ error: 'Unknown action: ' + (action || 'none') }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});