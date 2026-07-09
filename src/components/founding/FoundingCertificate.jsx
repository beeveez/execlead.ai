import React, { forwardRef } from "react";
import { Trophy } from "lucide-react";

const PLAN_LABELS = {
  professional: "Professional",
  executive: "Executive",
  founding_member: "Founding Member",
  enterprise: "Enterprise",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const FoundingCertificate = forwardRef(({ reservation }, ref) => {
  if (!reservation) return null;
  const verifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify/${reservation.verification_id}`
    : `https://execlead.ai/verify/${reservation.verification_id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=2&data=${encodeURIComponent(verifyUrl)}`;
  const isActivated = reservation.activated || reservation.status === "activated";

  return (
    <div ref={ref} className="w-full" style={{ background: "#0a0a0f" }}>
      <div
        className="relative mx-auto"
        style={{
          width: "800px",
          maxWidth: "100%",
          aspectRatio: "10 / 7",
          background: "linear-gradient(135deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0f 100%)",
          border: "3px solid",
          borderImage: "linear-gradient(135deg, #f59e0b, #fde68a, #f59e0b) 1",
          padding: "32px",
        }}
      >
        {/* Inner gold border */}
        <div className="absolute inset-3 border border-amber-500/20 rounded-lg pointer-events-none" />

        {/* Corner decorations */}
        <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-amber-500/40 rounded-tl-lg" />
        <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-amber-500/40 rounded-tr-lg" />
        <div className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-amber-500/40 rounded-bl-lg" />
        <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-amber-500/40 rounded-br-lg" />

        <div className="relative h-full flex flex-col items-center text-center px-8">
          {/* Logo */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-2xl font-bold tracking-tight text-white">EXECLEAD</span>
            <span className="text-2xl font-bold text-amber-400">.AI</span>
          </div>

          {/* Founder badge icon */}
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-2">
            <Trophy size={18} className="text-amber-400" />
          </div>

          {/* Title */}
          <h2 className="gold-shimmer text-xl font-bold tracking-[0.2em] uppercase mb-1">
            Founding Member Reservation
          </h2>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mb-4" />

          {/* Body text */}
          <p className="text-white/40 text-xs mb-1">This certifies that</p>
          <p className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Georgia, serif" }}>
            {reservation.full_name || "Founding Member"}
          </p>
          <p className="text-white/40 text-xs mb-5 max-w-md">
            has successfully reserved a Founding Membership in EXECLEAD.AI, securing lifetime founding benefits and a place in our founding chapter.
          </p>

          {/* Details grid */}
          <div className="grid grid-cols-3 gap-x-6 gap-y-3 mb-5 w-full max-w-lg">
            <DetailItem label="Reservation Number" value={reservation.founding_member_number} gold />
            <DetailItem label="Selected Plan" value={PLAN_LABELS[reservation.preferred_plan] || reservation.preferred_plan} />
            <DetailItem label="Reservation Date" value={formatDate(reservation.reservation_date)} />
            <DetailItem label="Current Status" value={isActivated ? "Activated" : "Reserved"} />
            <DetailItem label="Lifetime Benefits" value="✓ Reserved" gold />
            <DetailItem label="Payment" value={isActivated ? "Completed" : "Pending"} />
          </div>

          {/* Bottom: QR + Signature */}
          <div className="mt-auto w-full flex items-end justify-between">
            {/* QR Code */}
            <div className="flex flex-col items-center">
              <img src={qrUrl} alt="Verification QR" className="w-20 h-20 rounded-lg" crossOrigin="anonymous" />
              <p className="text-amber-400/60 text-[8px] mt-1 tracking-wider uppercase">Scan to Verify</p>
            </div>

            {/* Center divider */}
            <div className="flex-1 mx-6 flex flex-col items-center">
              <div className="w-24 h-px bg-amber-500/20 mb-1" />
              <p className="text-white/20 text-[8px] tracking-[0.3em] uppercase">Authentic & Verified</p>
            </div>

            {/* Signature */}
            <div className="flex flex-col items-center">
              <p className="text-amber-400/80 text-sm italic mb-1" style={{ fontFamily: "Georgia, serif" }}>EXECLEAD.AI</p>
              <div className="w-28 h-px bg-white/10 mb-1" />
              <p className="text-white/30 text-[8px] tracking-wider uppercase">Authorized Signature</p>
            </div>
          </div>

          {/* Certificate ID + Verification ID */}
          <div className="flex items-center gap-4 mt-3 text-[8px] text-white/20 tracking-wider">
            <span>CERT ID: {reservation.certificate_id}</span>
            <span className="text-amber-500/30">•</span>
            <span>VERIFY: {reservation.verification_id?.slice(0, 12)}…</span>
          </div>
        </div>
      </div>
    </div>
  );
});

function DetailItem({ label, value, gold }) {
  return (
    <div className="text-center">
      <p className="text-white/30 text-[8px] uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-xs font-semibold ${gold ? "text-amber-400" : "text-white/80"}`}>{value}</p>
    </div>
  );
}

export default FoundingCertificate;