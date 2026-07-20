import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const ADMIN_ROLES = ['admin', 'super_admin', 'platform_admin', 'developer'];
    if (!ADMIN_ROLES.includes(user.role)) {
      return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { recipient, subject, html_body, text_body } = body;

    if (!recipient || !subject) {
      return Response.json({ error: 'Missing recipient or subject' }, { status: 400 });
    }

    // Get Gmail OAuth token via the authorized connector
    let accessToken;
    let senderEmail = 'noreply@execlead.ai';
    try {
      const connection = await base44.asServiceRole.connectors.getConnection('gmail');
      if (typeof connection === 'string') {
        accessToken = connection;
      } else {
        accessToken = connection.accessToken || connection.access_token || connection.token || connection;
        senderEmail = connection.email || senderEmail;
      }
    } catch (connErr) {
      return Response.json({
        status: 'failed',
        failure_reason: 'Gmail connector not available: ' + (connErr.message || 'unknown error'),
        provider: 'gmail',
      }, { status: 200 });
    }

    if (!accessToken) {
      return Response.json({
        status: 'failed',
        failure_reason: 'No Gmail access token available',
        provider: 'gmail',
      }, { status: 200 });
    }

    // Build RFC 2822 email message
    const messageBody = html_body || text_body || '';
    const contentType = html_body ? 'text/html; charset=UTF-8' : 'text/plain; charset=UTF-8';

    const lines = [
      `To: ${recipient}`,
      `From: EXECLEAD.AI <${senderEmail}>`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      `Content-Type: ${contentType}`,
      '',
      messageBody,
    ];
    const rawMessage = lines.join('\r\n');

    // Base64url encode the message
    const bytes = new TextEncoder().encode(rawMessage);
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    const encoded = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // Send via Gmail API
    const gmailResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encoded }),
    });

    if (!gmailResponse.ok) {
      const errorText = await gmailResponse.text();
      return Response.json({
        status: 'failed',
        failure_reason: `Gmail API error (${gmailResponse.status}): ${errorText}`,
        provider: 'gmail',
      }, { status: 200 });
    }

    const result = await gmailResponse.json();
    return Response.json({
      status: 'delivered',
      message_id: result.id,
      provider: 'gmail',
      sent_at: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({
      status: 'failed',
      failure_reason: error.message || 'Unknown error during email delivery',
      provider: 'gmail',
    }, { status: 500 });
  }
});