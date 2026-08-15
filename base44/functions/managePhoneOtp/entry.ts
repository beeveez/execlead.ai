import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

const ADMIN_ROLES = ['admin', 'super_admin', 'platform_admin', 'developer'];

function detectSmsProvider() {
  const twilioSid = secrets.get('TWILIO_ACCOUNT_SID');
  const twilioToken = secrets.get('TWILIO_AUTH_TOKEN');
  const twilioPhone = secrets.get('TWILIO_PHONE_NUMBER');
  if (twilioSid && twilioToken && twilioPhone) {
    return { provider: 'twilio', configured: true, credentials: { sid: twilioSid, token: twilioToken, from: twilioPhone } };
  }
  return { provider: null, configured: false, credentials: null };
}

function toE164(phone) {
  let cleaned = (phone || '').trim();
  if (cleaned.startsWith('+')) return cleaned;
  let digits = cleaned.replace(/\D/g, '');
  if (digits.startsWith('00')) return '+' + digits.substring(2);
  if (digits.startsWith('0')) return '+63' + digits.substring(1);
  if (digits.length === 10) return '+1' + digits;
  if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
  if (digits.length > 6) return '+' + digits;
  return cleaned;
}

function maskPhone(phone) {
  if (!phone || phone.length < 5) return '****';
  return phone.substring(0, 4) + '****' + phone.substring(phone.length - 2);
}

function generateOtp() {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(100000 + (arr[0] % 900000));
}

async function hashOtp(code) {
  const data = new TextEncoder().encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function recalculateTrust(v) {
  const updated = { ...v };
  let score = 0;
  if (updated.email_verified) score += 10;
  if (updated.phone_verified) score += 10;
  if (updated.identity_verified) score += 30;
  if (updated.professional_verified) score += 20;
  if (updated.resume_verified) score += 10;
  if (updated.leadership_dna_complete) score += 10;
  if (updated.profile_published) score += 10;
  if (updated.verified_executive) score += 10;
  updated.trust_score = score;
  let level = 0;
  if (updated.verified_executive) level = 5;
  else if (updated.professional_verified) level = 4;
  else if (updated.identity_verified) level = 3;
  else if (updated.phone_verified) level = 2;
  else if (updated.email_verified) level = 1;
  updated.trust_level = level;
  return updated;
}

async function sendSmsTwilio(credentials, to, message) {
  const auth = btoa(credentials.sid + ':' + credentials.token);
  const resp = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + credentials.sid + '/Messages.json', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ From: credentials.from, To: to, Body: message }),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error('Twilio API error: ' + resp.status + ' ' + errText);
  }
  return await resp.json();
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const action = body.action;

    if (action === 'check_status') {
      const smsProvider = detectSmsProvider();
      return Response.json({
        sms_available: smsProvider.configured,
        sms_provider: smsProvider.provider,
        email_available: true,
        message: smsProvider.configured ? null : 'Phone verification is temporarily unavailable during Beta.',
      });
    }

    if (action === 'send_otp') {
      const phoneNumber = body.phone_number;
      const requestedMethod = body.method || 'email';
      const smsProvider = detectSmsProvider();
      const e164 = toE164(phoneNumber || '');
      let deliveryMethod = requestedMethod === 'sms' && smsProvider.configured ? 'sms' : 'email';
      let verification = null;
      try {
        const records = await base44.entities.IdentityVerification.filter({ user_id: user.id });
        verification = records?.[0] || null;
      } catch {}

      if (requestedMethod === 'sms') {
        const supportedDestination = /^\+(1\d{10}|63\d{10})$/.test(e164);
        const verifiedNumber = verification?.phone_verified
          ? toE164(verification.phone_number || '')
          : '';
        if (!supportedDestination) {
          return Response.json({ status: 'error', message: 'SMS verification is not available for this destination.' }, { status: 400 });
        }
        if (!verifiedNumber || verifiedNumber !== e164) {
          return Response.json({ status: 'error', message: 'SMS can only be sent to your previously verified phone number.' }, { status: 403 });
        }
      }

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const recentOtps = await base44.entities.OtpActivityLog.filter(
        { user_id: user.id, created_date: { $gte: oneHourAgo } }, '-created_date', 5
      );
      if (recentOtps.length >= 5) {
        return Response.json({ status: 'error', message: 'Too many OTP requests. Please try again later.' }, { status: 429 });
      }

      if (requestedMethod === 'sms' && smsProvider.configured) {
        const recentGlobalSms = await base44.asServiceRole.entities.OtpActivityLog.filter(
          { method: 'sms', created_date: { $gte: oneHourAgo } }, '-created_date', 20
        );
        if (recentGlobalSms.length >= 20) {
          return Response.json({ status: 'error', message: 'SMS verification is temporarily unavailable. Please try again later.' }, { status: 429 });
        }
      }

      if (requestedMethod === 'sms' && !smsProvider.configured) {
        await base44.entities.OtpActivityLog.create({
          user_id: user.id,
          user_name: user.full_name || user.email,
          phone_number_masked: phoneNumber ? maskPhone(toE164(phoneNumber)) : '****',
          provider: 'none',
          delivery_status: 'failed',
          failure_reason: 'No SMS provider configured',
          retry_count: 0,
          method: 'sms',
        });
        return Response.json({
          status: 'unavailable',
          message: 'Phone verification is temporarily unavailable during Beta. Please use Email OTP instead.',
        });
      }

      const otpCode = generateOtp();
      const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      let deliveryStatus = 'pending';
      let failureReason = '';
      let provider = deliveryMethod === 'sms' ? smsProvider.provider : 'email';

      if (deliveryMethod === 'sms') {
        try {
          if (smsProvider.provider === 'twilio') {
            await sendSmsTwilio(smsProvider.credentials, e164, 'Your EXECLEAD.AI verification code is: ' + otpCode);
          } else {
            throw new Error('SMS provider ' + smsProvider.provider + ' not implemented yet');
          }
          deliveryStatus = 'sent';
        } catch (err) {
          // SMS failed (trial account, geo restriction, unreachable number, etc.)
          // Auto-fallback to email so OTP delivery never blocks the user
          failureReason = err.message;
          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: user.email,
              subject: 'Your EXECLEAD.AI Verification Code',
              body: 'Your verification code is: ' + otpCode + '\n\nThis code expires in 5 minutes.\n\n(SMS delivery to ' + maskPhone(e164) + ' failed — delivered via email instead.)\n\nIf you did not request this code, please ignore this email.',
            });
            deliveryStatus = 'sent';
            deliveryMethod = 'email';
            provider = 'email';
          } catch (emailErr) {
            deliveryStatus = 'failed';
            failureReason = failureReason + ' | Email fallback also failed: ' + emailErr.message;
          }
        }
      } else {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: user.email,
            subject: 'Your EXECLEAD.AI Verification Code',
            body: 'Your verification code is: ' + otpCode + '\n\nThis code expires in 5 minutes.\n\nIf you did not request this code, please ignore this email.',
          });
          deliveryStatus = 'sent';
        } catch (err) {
          deliveryStatus = 'failed';
          failureReason = err.message;
        }
      }

      if (!verification) {
        verification = await base44.entities.IdentityVerification.create({
          user_id: user.id,
          user_name: user.full_name || user.email,
          user_email: user.email,
          email_verified: true,
          email_verified_date: new Date().toISOString(),
          identity_status: 'pending_upload',
          verification_provider: 'none',
        });
      }

      const otpHash = await hashOtp(otpCode);
      await base44.entities.IdentityVerification.update(verification.id, {
        phone_otp_code: otpHash,
        phone_otp_expires: expires,
        phone_otp_attempts: 0,
        phone_otp_method: deliveryMethod,
        phone_number: e164,
      });

      await base44.entities.OtpActivityLog.create({
        user_id: user.id,
        user_name: user.full_name || user.email,
        phone_number_masked: maskPhone(e164),
        provider: provider,
        delivery_status: deliveryStatus,
        failure_reason: failureReason,
        retry_count: 0,
        method: deliveryMethod,
      });

      if (deliveryStatus === 'failed') {
        return Response.json({ status: 'error', message: failureReason || 'Failed to send OTP' }, { status: 500 });
      }

      return Response.json({
        status: 'success',
        message: deliveryMethod === 'sms' ? 'OTP sent via SMS to ' + maskPhone(e164) : 'OTP sent to ' + user.email,
        method: deliveryMethod,
        expires: expires,
      });
    }

    if (action === 'verify_otp') {
      const otpCode = body.otp_code;
      if (!otpCode) return Response.json({ error: 'otp_code is required' }, { status: 400 });

      let verification = null;
      try {
        const records = await base44.entities.IdentityVerification.filter({ user_id: user.id });
        verification = (records && records[0]) ? records[0] : null;
      } catch (e) {}

      if (!verification) return Response.json({ error: 'Verification record not found' }, { status: 404 });

      const storedHash = verification.phone_otp_code;
      const expires = verification.phone_otp_expires;
      const attempts = (verification.phone_otp_attempts || 0) + 1;
      const method = verification.phone_otp_method || 'email';
      const provider = method === 'sms' ? (detectSmsProvider().provider || 'sms') : 'email';
      const masked = maskPhone(verification.phone_number || '');

      if (!storedHash) {
        return Response.json({ status: 'error', message: 'No OTP requested. Please request a new code.' }, { status: 400 });
      }

      if (expires && new Date(expires) < new Date()) {
        await base44.entities.OtpActivityLog.create({
          user_id: user.id, user_name: verification.user_name,
          phone_number_masked: masked, provider, delivery_status: 'expired',
          failure_reason: 'OTP code expired', retry_count: attempts, method,
        });
        return Response.json({ status: 'error', message: 'OTP code has expired. Please request a new one.' }, { status: 400 });
      }

      if (attempts > 5) {
        await base44.entities.OtpActivityLog.create({
          user_id: user.id, user_name: verification.user_name,
          phone_number_masked: masked, provider, delivery_status: 'failed',
          failure_reason: 'Too many attempts', retry_count: attempts, method,
        });
        return Response.json({ status: 'error', message: 'Too many attempts. Please request a new OTP.' }, { status: 429 });
      }

      const inputHash = await hashOtp(otpCode);
      if (storedHash !== inputHash) {
        await base44.entities.IdentityVerification.update(verification.id, { phone_otp_attempts: attempts });
        await base44.entities.OtpActivityLog.create({
          user_id: user.id, user_name: verification.user_name,
          phone_number_masked: masked, provider, delivery_status: 'failed',
          failure_reason: 'Invalid OTP code', retry_count: attempts, method,
        });
        return Response.json({ status: 'error', message: 'Invalid verification code. ' + (5 - attempts) + ' attempts remaining.' }, { status: 400 });
      }

      const updates = {
        phone_verified: true,
        phone_verified_date: new Date().toISOString(),
        phone_otp_code: '',
        phone_otp_attempts: 0,
      };
      const recalced = recalculateTrust({ ...verification, ...updates });
      await base44.entities.IdentityVerification.update(verification.id, {
        ...updates, trust_score: recalced.trust_score, trust_level: recalced.trust_level,
      });

      try {
        await base44.entities.VerificationLog.create({
          verification_id: verification.id,
          user_id: verification.user_id,
          user_name: verification.user_name,
          action: 'phone_verified',
          decision: 'approved',
          notes: 'Phone verified via ' + method + ' OTP',
        });
      } catch (e) {}

      await base44.entities.OtpActivityLog.create({
        user_id: user.id, user_name: verification.user_name,
        phone_number_masked: masked, provider, delivery_status: 'verified',
        failure_reason: '', retry_count: attempts, method,
      });

      return Response.json({ status: 'success', message: 'Phone verified successfully' });
    }

    if (action === 'diagnostics') {
      if (!ADMIN_ROLES.includes(user.role)) {
        return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });
      }
      const smsProvider = detectSmsProvider();
      let lastAttempt = null;
      try {
        const logs = await base44.asServiceRole.entities.OtpActivityLog.list('-created_date', 1);
        lastAttempt = (logs && logs[0]) ? logs[0] : null;
      } catch (e) {}

      let recentCount = 0;
      try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const recent = await base44.asServiceRole.entities.OtpActivityLog.filter({ created_date: { $gte: oneHourAgo } });
        recentCount = recent.length;
      } catch (e) {}

      return Response.json({
        sms_provider: smsProvider.provider,
        sms_configured: smsProvider.configured,
        email_available: true,
        api_status: smsProvider.configured ? 'configured' : 'not_configured',
        last_otp_attempt: lastAttempt ? {
          time: lastAttempt.created_date,
          status: lastAttempt.delivery_status,
          provider: lastAttempt.provider,
          failure_reason: lastAttempt.failure_reason,
          method: lastAttempt.method,
        } : null,
        last_error: (lastAttempt && lastAttempt.failure_reason) ? lastAttempt.failure_reason : null,
        environment: 'production',
        rate_limit_status: recentCount > 20 ? 'throttled' : 'normal',
        recent_attempts_1h: recentCount,
      });
    }

    if (action === 'get_logs') {
      if (!ADMIN_ROLES.includes(user.role)) {
        return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });
      }
      const logs = await base44.asServiceRole.entities.OtpActivityLog.list('-created_date', 100);
      return Response.json({ logs });
    }

    return Response.json({ error: 'Invalid action. Use check_status, send_otp, verify_otp, diagnostics, or get_logs.' }, { status: 400 });
  } catch (error) {
    console.error('managePhoneOtp error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}