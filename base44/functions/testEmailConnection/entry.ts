import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const recipient = body.testEmail || user.email;

    const settingsList = await base44.asServiceRole.entities.EmailSettings.list();
    const config = settingsList[0];

    // Not configured — log and return
    if (!config || !config.is_active || !config.from_email) {
      await base44.asServiceRole.entities.EmailEvent.create({
        recipient,
        subject: 'EXECLEAD.AI — Email Connection Test',
        delivery_status: 'not_configured',
        error_message: 'Email provider not configured',
        email_type: 'test_connection',
        provider: config?.provider || 'none',
        template: 'test_connection',
        provider_response: 'Provider not configured',
        retry_count: 0,
      }).catch(() => {});

      if (config?.id) {
        await base44.asServiceRole.entities.EmailSettings.update(config.id, {
          connection_status: 'disconnected',
          last_tested_at: new Date().toISOString(),
          last_test_result: 'Email provider not configured',
        }).catch(() => {});
      }

      return Response.json({ success: false, message: 'Email provider not configured. Configure a provider and activate it first.' });
    }

    const provider = config.provider || 'resend';
    const testSubject = 'EXECLEAD.AI — Email Connection Test';
    const testBody = `<html><body style="font-family: Arial, sans-serif; background: #f4f4f5; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
    <div style="background: #0a0a0f; padding: 30px;">
      <h1 style="color: white; margin: 0; font-size: 24px;">EXECLEAD.AI</h1>
      <p style="color: #10b981; margin: 5px 0 0; font-size: 14px;">Email Connection Test — Successful</p>
    </div>
    <div style="padding: 30px;">
      <p style="color: #333; font-size: 15px;">This is a test email from EXECLEAD.AI's Email Center.</p>
      <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="color: #71717a; padding: 6px 0;">Provider:</td><td style="font-weight: bold; text-align: right; color: #333;">${provider}</td></tr>
          <tr><td style="color: #71717a; padding: 6px 0;">From:</td><td style="text-align: right; color: #333;">${config.from_name || 'EXECLEAD.AI'} &lt;${config.from_email}&gt;</td></tr>
          <tr><td style="color: #71717a; padding: 6px 0;">Tested At:</td><td style="text-align: right; color: #333;">${new Date().toISOString()}</td></tr>
        </table>
      </div>
      <p style="color: #a1a1aa; font-size: 12px;">If you received this email, your email provider is correctly configured.</p>
    </div>
  </div>
</body></html>`;

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: recipient,
        subject: testSubject,
        body: testBody,
        from_name: config.from_name || 'EXECLEAD.AI',
      });

      await base44.asServiceRole.entities.EmailEvent.create({
        recipient,
        subject: testSubject,
        delivery_status: 'delivered',
        error_message: '',
        email_type: 'test_connection',
        provider,
        template: 'test_connection',
        provider_response: 'OK — test email sent successfully',
        retry_count: 0,
      }).catch(() => {});

      await base44.asServiceRole.entities.EmailSettings.update(config.id, {
        connection_status: 'connected',
        last_tested_at: new Date().toISOString(),
        last_test_result: 'Connected — test email sent successfully',
      }).catch(() => {});

      return Response.json({ success: true, message: `Connected — test email sent to ${recipient}`, provider });
    } catch (sendError) {
      const errorMsg = sendError?.message || String(sendError) || 'Failed to send test email';

      await base44.asServiceRole.entities.EmailEvent.create({
        recipient,
        subject: testSubject,
        delivery_status: 'failed',
        error_message: errorMsg,
        email_type: 'test_connection',
        provider,
        template: 'test_connection',
        provider_response: errorMsg,
        retry_count: 0,
      }).catch(() => {});

      await base44.asServiceRole.entities.EmailSettings.update(config.id, {
        connection_status: 'error',
        last_tested_at: new Date().toISOString(),
        last_test_result: 'Connection Failed: ' + errorMsg,
      }).catch(() => {});

      return Response.json({ success: false, message: 'Connection Failed: ' + errorMsg, provider });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});