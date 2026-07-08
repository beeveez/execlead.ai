import React, { useState } from "react";
import { Users, DollarSign, Wallet, Check, Loader2, X, Clock, Sparkles, Ticket, Crown } from "lucide-react";
import AddToCalendar from "@/components/events/AddToCalendar";
import { formatDuration } from "@/lib/eventPlatform";

export default function RegistrationPanel({ event, myRegistration, discount, spotsRemaining, onRegister, onCancel, onCheckIn, loading }) {
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const basePrice = event.price || 0;
  const finalPrice = discount?.final_price ?? basePrice;
  const discountPercent = discount?.percent || 0;
  const isFree = finalPrice === 0;
  const isPast = event.start_date && new Date(event.start_date) < new Date();
  const isLive = event.status === 'live';

  if (isPast && !myRegistration) {
    return (
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-center">
        <Clock size={20} className="mx-auto text-white/20 mb-2" />
        <p className="text-white/40 text-sm">This event has ended.</p>
        {event.recording_url && (
          <a href={event.recording_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-medium hover:bg-indigo-500/20 transition-colors">
            Watch Recording
          </a>
        )}
      </div>
    );
  }

  // Already registered
  if (myRegistration) {
    return (
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
            <Check size={16} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">
              {myRegistration.status === 'waitlisted' ? 'On Waitlist' : 'Registered'}
            </p>
            <p className="text-white/30 text-xs">
              {myRegistration.ticket_type === 'vip' ? 'VIP Ticket' : 'General Admission'}
              {myRegistration.amount_paid > 0 && ` · $${myRegistration.amount_paid}`}
            </p>
          </div>
        </div>

        {myRegistration.attended ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs">
            <Check size={13} /> Attendance confirmed
            {myRegistration.certificate_issued && <span>· Certificate issued</span>}
          </div>
        ) : (isLive || isPast) && myRegistration.status !== 'waitlisted' ? (
          <button
            onClick={onCheckIn}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
          >
            <Check size={15} /> Check In
          </button>
        ) : null}

        {myRegistration.status !== 'waitlisted' && event.meeting_url && (
          <a href={event.meeting_url} target="_blank" rel="noreferrer" className="block w-full text-center px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
            Join {event.meeting_platform ? event.meeting_platform.charAt(0).toUpperCase() + event.meeting_platform.slice(1) : 'Meeting'}
          </a>
        )}

        <AddToCalendar event={event} />

        <button onClick={onCancel} className="w-full text-xs text-red-400/70 hover:text-red-400 transition-colors py-1">
          Cancel Registration
        </button>
      </div>
    );
  }

  // Registration form
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 space-y-4">
      {/* Price */}
      <div>
        {isFree ? (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">Free</span>
            {basePrice > 0 && <span className="text-sm text-white/30 line-through">${basePrice}</span>}
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">${finalPrice}</span>
            {discountPercent > 0 && basePrice !== finalPrice && (
              <span className="text-sm text-white/30 line-through">${basePrice}</span>
            )}
            <span className="text-sm text-white/40">{event.currency || 'USD'}</span>
          </div>
        )}
        {discountPercent > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${discount.tier === 'founding' ? 'bg-amber-500/15 text-amber-300' : 'bg-indigo-500/15 text-indigo-300'}`}>
              {discount.tier === 'founding' ? <><Crown size={9} className="inline" /> Founding Member</> : `${discount.tier.charAt(0).toUpperCase() + discount.tier.slice(1)} Plan`}
            </span>
            <span className="text-xs text-emerald-400">{discountPercent}% off</span>
          </div>
        )}
      </div>

      {/* Capacity */}
      {spotsRemaining >= 0 && (
        <div className="flex items-center gap-2 text-xs">
          <Users size={12} className="text-white/30" />
          {spotsRemaining === 0 ? (
            <span className="text-amber-400">Event full — join waitlist</span>
          ) : spotsRemaining <= 10 ? (
            <span className="text-amber-400">Only {spotsRemaining} spots remaining</span>
          ) : (
            <span className="text-white/40">{spotsRemaining} spots available</span>
          )}
        </div>
      )}

      {/* Payment method for paid events */}
      {basePrice > 0 && !isFree && spotsRemaining !== 0 && (
        <div className="space-y-2">
          <label className="text-xs text-white/40 uppercase tracking-wider">Payment Method</label>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => setPaymentMethod('wallet')}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-all ${paymentMethod === 'wallet' ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-white/10 hover:bg-white/5'}`}
            >
              <Wallet size={15} className={paymentMethod === 'wallet' ? 'text-indigo-400' : 'text-white/40'} />
              <div className="flex-1">
                <div className="text-xs text-white/70 font-medium">Executive Wallet</div>
                <div className="text-[10px] text-white/30">Pay with wallet balance</div>
              </div>
              {paymentMethod === 'wallet' && <Check size={14} className="text-indigo-400" />}
            </button>
          </div>
        </div>
      )}

      {/* Action button */}
      <button
        onClick={() => onRegister(basePrice > 0 && !isFree ? paymentMethod : 'free')}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : spotsRemaining === 0 ? (
          <><Users size={15} /> Join Waitlist</>
        ) : isFree ? (
          <><Ticket size={15} /> Reserve Seat</>
        ) : (
          <><DollarSign size={15} /> Purchase Ticket</>
        )}
      </button>

      {/* Perks */}
      <div className="space-y-1.5 pt-2 border-t border-white/5">
        {[
          event.networking_enabled && 'Executive networking access',
          event.certificate_enabled && 'Digital attendance certificate',
          event.discussions_enabled && 'Event discussion board',
        ].filter(Boolean).map((perk, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-white/40">
            <Sparkles size={11} className="text-indigo-400/50" /> {perk}
          </div>
        ))}
      </div>
    </div>
  );
}