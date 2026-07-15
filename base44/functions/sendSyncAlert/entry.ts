import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const allowedRoles = ['admin', 'super_admin', 'platform_admin', 'developer'];
    if (!allowedRoles.includes(user.role)) {
      return Response.json({ error: 'Forbidden — leadership access required' }, { status: 403 });
    }

    const body = await req.json();
    const { health, status, duration, timestamp, knowledgeVersion, errors, warnings, components } = body;

    // Backend safety check — only send for critical status
    if (status !== 'critical') {
      return Response.json({ sent: false, reason: 'Status is not critical — no alert needed' });
    }

    // Get Gmail OAuth token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    if (!accessToken) return Response.json({ error: 'Gmail connection not available' }, { status: 503 });

    // Fetch leadership emails (admins + super admins)
    const admins = await base44.asServiceRole.entities.User.filter({ role: { $in: ['admin', 'super_admin'] } }, '-created_date', 50);
    const recipients = admins.filter(a => a.email).map(a => a.email);
    if (recipients.length === 0) {
      return Response.json({ sent: false, reason: 'No leadership emails found' });
    }

    // Build alert email
    const subject = `CRITICAL ALERT — EXEC Knowledge Sync Health at ${health}%`;
    const componentLines = (components || [])
      .map(c => `  • ${c.name}: ${c.score}% (weight ${c.weight})`)
      .join('\n');
    const textBody = [
      'EXEC™ KNOWLEDGE SYNCHRONIZATION — CRITICAL ALERT',
      '',
      `Health Score: ${health}%`,
      `Status: ${status.toUpperCase()}`,
      `Timestamp: ${timestamp}`,
      `Duration: ${duration}ms`,
      `Knowledge Version: ${knowledgeVersion}`,
      `Errors: ${errors}`,
      `Warnings: ${warnings}`,
      '',
      'Component Breakdown:',
      componentLines || '  (no component data available)',
      '',
      'Immediate action required. Review the Knowledge Sync dashboard:',
      'https://app.execlead.ai/developer/knowledge-sync',
      '',
      '— EXEC™ Platform Guardian',
    ].join('\n');

    // Build RFC 2822 message with proper UTF-8 encoding
    const encodedSubject = '=?UTF-8?B?' + btoa(String.fromCharCode(...new TextEncoder().encode(subject))) + '?=';
    const rawMessage = [
      'To: ' + recipients.join(', '),
      'Subject: ' + encodedSubject,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      textBody,
    ].join('\r\n');

    const bytes = new TextEncoder().encode(rawMessage);
    let binary = '';
    for (const b of bytes) binary += String.fromCharCode(b);
    const raw = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // Send via Gmail API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return Response.json({ error: 'Gmail API error: ' + errText }, { status: 502 });
    }

    const data = await response.json();
    return Response.json({ sent: true, messageId: data.id, recipients });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});