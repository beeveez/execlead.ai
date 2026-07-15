import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Phone, Mail, Loader2, AlertCircle, ShieldAlert, Check, ArrowLeft } from 'lucide-react';

export default function PhoneVerificationModal({ verification, onClose, onSuccess }) {
  const [step, setStep] = useState('input');
  const [method, setMethod] = useState('email');
  const [smsAvailable, setSmsAvailable] = useState(false);
  const [smsProvider, setSmsProvider] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => { checkStatus(); }, []);

  const checkStatus = async () => {
    try {
      const response = await base44.functions.invoke('managePhoneOtp', { action: 'check_status' });
      setSmsAvailable(response.data.sms_available);
      setSmsProvider(response.data.sms_provider);
      setMethod(response.data.sms_available ? 'sms' : 'email');
    } catch {
      setMethod('email');
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const response = await base44.functions.invoke('managePhoneOtp', {
        action: 'send_otp', phone_number: phoneNumber, method,
      });
      const data = response.data;
      if (data.status === 'unavailable') {
        setError(data.message);
        setMethod('email');
        return;
      }
      if (data.status === 'error') {
        setError(data.message);
        return;
      }
      setStep('otp');
      setOtpCode('');
      setInfo(data.message || (method === 'email' ? 'Code sent to your email' : 'Code sent via SMS'));
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await base44.functions.invoke('managePhoneOtp', { action: 'verify_otp', otp_code: otpCode });
      if (response.data.status === 'success') {
        onSuccess();
      } else {
        setError(response.data.message || 'Verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-white font-semibold text-sm mb-4">Phone Verification</h3>

        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /><span>{error}</span>
          </div>
        )}
        {info && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <Check size={14} className="flex-shrink-0 mt-0.5" /><span>{info}</span>
          </div>
        )}

        {!smsAvailable && step !== 'otp' && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
            <ShieldAlert size={14} className="flex-shrink-0 mt-0.5" />
            <span>Phone verification is temporarily unavailable during Beta. Use Email OTP to verify your phone number.</span>
          </div>
        )}

        {step === 'otp' ? (
          <>
            <p className="text-xs text-white/40 mb-3">Enter the 6-digit code sent {method === 'email' ? 'to your email' : `to your phone`}</p>
            <div className="flex justify-center mb-4">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus>
                <InputOTPGroup>
                  <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                  <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setStep('input'); setOtpCode(''); setError(''); setInfo(''); }} className="flex items-center gap-1 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium">
                <ArrowLeft size={14} /> Back
              </button>
              <button onClick={handleVerifyOtp} disabled={loading || otpCode.length < 6} className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={14} className="animate-spin" /> Verifying...</> : <>Verify <Check size={14} /></>}
              </button>
            </div>
            <button onClick={handleSendOtp} disabled={loading} className="w-full mt-3 text-xs text-white/30 hover:text-white/60">Resend code</button>
          </>
        ) : (
          <>
            {smsAvailable && (
              <div className="flex gap-2 mb-4">
                <button onClick={() => setMethod('sms')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${method === 'sms' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-white/40 hover:text-white/60'}`}>
                  <Phone size={12} className="inline mr-1" /> SMS {smsProvider && `(${smsProvider})`}
                </button>
                <button onClick={() => setMethod('email')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${method === 'email' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-white/40 hover:text-white/60'}`}>
                  <Mail size={12} className="inline mr-1" /> Email
                </button>
              </div>
            )}

            {method === 'sms' && smsAvailable ? (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/30 mb-1.5 block">Phone Number</label>
                <input type="tel" placeholder="+63 917 000 0000" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50" />
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white/60">
                <Mail size={12} className="inline mr-1.5 text-white/30" />
                Verification code will be sent to: <span className="text-white/80">{verification?.user_email || 'your email'}</span>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium">Cancel</button>
              <button onClick={handleSendOtp} disabled={loading || (method === 'sms' && !phoneNumber.trim())} className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : 'Send Code'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}