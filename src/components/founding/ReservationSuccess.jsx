import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Trophy, Download, Share2, Printer, Link2, Check, X, Sparkles, Award } from "lucide-react";
import FoundingCertificate from "./FoundingCertificate";
import ReservationCountdown from "./ReservationCountdown";

export default function ReservationSuccess({ reservation, onClose }) {
  const certRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const colors = ["#f59e0b", "#fbbf24", "#fde68a", "#6366f1", "#ffffff"];
    const duration = 3000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    // Central burst
    setTimeout(() => confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 }, colors }), 300);
  }, []);

  const verifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify/${reservation.verification_id}`
    : `https://execlead.ai/verify/${reservation.verification_id}`;

  const captureCanvas = async () => {
    if (!certRef.current) return null;
    return html2canvas(certRef.current, { scale: 2, backgroundColor: "#0a0a0f", useCORS: true, logging: false });
  };

  const downloadPNG = async () => {
    setDownloading("png");
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `EXECLEAD-Founding-Member-${reservation.founding_member_number}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) { console.error(e); }
    setDownloading(null);
  };

  const downloadPDF = async () => {
    setDownloading("pdf");
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`EXECLEAD-Founding-Member-${reservation.founding_member_number}.pdf`);
    } catch (e) { console.error(e); }
    setDownloading(null);
  };

  const printCertificate = async () => {
    setDownloading("print");
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const imgData = canvas.toDataURL("image/png");
      const w = window.open("", "_blank");
      if (!w) return;
      w.document.write(`<html><head><title>EXECLEAD.AI — Founding Member Certificate</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0a0a0f;"><img src="${imgData}" style="max-width:100%;height:auto;" onload="window.print()" /></body></html>`);
      w.document.close();
    } catch (e) { console.error(e); }
    setDownloading(null);
  };

  const handleShare = async () => {
    const shareData = {
      title: "My EXECLEAD.AI Founding Membership",
      text: `I'm Founding Member ${reservation.founding_member_number} of EXECLEAD.AI! Join me in the founding chapter.`,
      url: verifyUrl,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) {}
    } else {
      copyLink();
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(verifyUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gold-glow">
          <Trophy size={28} className="text-amber-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">Congratulations! 🎉</h3>
        <p className="text-white/40 text-sm max-w-md mx-auto">
          You have successfully reserved your place as a Founding Member of EXECLEAD.AI. Your lifetime founding benefits have been reserved.
        </p>
      </motion.div>

      {/* Founder Reservation Number */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
        <p className="text-amber-400/60 text-xs uppercase tracking-widest mb-1">Founder Reservation Number</p>
        <p className="gold-shimmer text-3xl font-bold tracking-wider">{reservation.founding_member_number}</p>
      </motion.div>

      {/* Countdown */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex justify-center">
        <ReservationCountdown expiresAt={reservation.pricing_expires_at} />
      </motion.div>

      {/* Certificate */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="overflow-x-auto pb-2">
        <FoundingCertificate ref={certRef} reservation={reservation} />
      </motion.div>

      {/* Action buttons */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-wrap items-center justify-center gap-2">
        <button onClick={downloadPDF} disabled={!!downloading} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-white text-sm font-medium transition-colors">
          {downloading === "pdf" ? <Sparkles size={16} className="animate-pulse" /> : <Download size={16} />} Download PDF
        </button>
        <button onClick={downloadPNG} disabled={!!downloading} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40 text-white/70 text-sm font-medium transition-colors">
          {downloading === "png" ? <Sparkles size={16} className="animate-pulse" /> : <Download size={16} />} PNG
        </button>
        <button onClick={printCertificate} disabled={!!downloading} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40 text-white/70 text-sm font-medium transition-colors">
          <Printer size={16} /> Print
        </button>
        <button onClick={handleShare} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm font-medium transition-colors">
          <Share2 size={16} /> Share
        </button>
        <button onClick={copyLink} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm font-medium transition-colors">
          {copied ? <><Check size={16} className="text-emerald-400" /> Copied!</> : <><Link2 size={16} /> Copy Link</>}
        </button>
      </motion.div>

      {/* Founder Benefits preview */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Award size={14} className="text-amber-400" />
          <h4 className="text-white/80 text-sm font-semibold">Your Reserved Lifetime Benefits</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {["25% Lifetime Discount", "Founder Badge", "Founder Portal", "Priority Roadmap Voting", "Exclusive Events", "Founder Community", "Beta Features", "Recognition Wall"].map((b) => (
            <div key={b} className="flex items-center gap-1.5 text-xs text-white/50">
              <Check size={12} className="text-amber-400 flex-shrink-0" /> {b}
            </div>
          ))}
        </div>
      </motion.div>

      <p className="text-center text-white/30 text-xs">
        Complete payment when invitations open to activate your membership. Your reserved pricing is locked in.
      </p>

      <button onClick={onClose} className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm font-medium transition-colors">
        Done
      </button>
    </div>
  );
}