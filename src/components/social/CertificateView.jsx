import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Award, Download, Share2, X, Check } from "lucide-react";
import { ACHIEVEMENT_TYPES, getQrUrl, generateCertificateNumber } from "@/lib/socialShare";
import ShareModal from "./ShareModal";

export default function CertificateView({ userName, achievementType, achievementTitle, completionDate, certificateNumber, referralCode }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef(null);

  const achievement = ACHIEVEMENT_TYPES[achievementType] || ACHIEVEMENT_TYPES.certificate_earned;
  const certNum = certificateNumber || generateCertificateNumber();
  const date = completionDate || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const verifyUrl = `https://execlead.ai/verify/${certNum}`;

  const handleDownloadPdf = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(certRef.current, { backgroundColor: "#ffffff", useCORS: true, scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${certNum}.pdf`);
    } catch (e) {}
    setDownloading(false);
  };

  return (
    <div>
      <div ref={certRef} style={{ background: "#fff", borderRadius: 12, padding: 48, position: "relative", overflow: "hidden", fontFamily: "Georgia, serif" }}>
        <div style={{ position: "absolute", inset: 12, border: `3px solid ${achievement.color}`, borderRadius: 8, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 18, border: `1px solid ${achievement.color}60`, borderRadius: 6, pointerEvents: "none" }} />

        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 12, letterSpacing: "0.3em", color: "#94a3b8", textTransform: "uppercase" }}>EXECLEAD.AI</div>
          <div style={{ fontSize: 10, color: "#cbd5e1", marginTop: 2 }}>Executive Leadership Operating System</div>
        </div>

        <div style={{ textAlign: "center", margin: "24px 0" }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#0f172a", fontFamily: "Georgia, serif" }}>Certificate of Achievement</div>
          <div style={{ width: 60, height: 3, background: achievement.color, margin: "12px auto" }} />
        </div>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>This certifies that</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: achievement.color, margin: "8px 0", fontFamily: "Georgia, serif" }}>{userName || "Executive Leader"}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>has successfully</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginTop: 6 }}>{achievementTitle || achievement.label}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 32 }}>
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>Completion Date</div>
            <div style={{ fontSize: 14, color: "#0f172a", fontWeight: 600, marginTop: 2 }}>{date}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>Certificate Number</div>
            <div style={{ fontSize: 12, color: "#475569", fontFamily: "monospace", marginTop: 2 }}>{certNum}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <img src={getQrUrl(verifyUrl)} alt="Verify" crossOrigin="anonymous" style={{ width: 72, height: 72 }} />
            <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 4 }}>Scan to verify</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 36, color: achievement.color }}>{achievement.badge}</div>
            <div style={{ fontSize: 14, color: "#0f172a", fontFamily: "Georgia, serif", fontStyle: "italic", marginTop: 4, borderBottom: "1px solid #cbd5e1", paddingBottom: 2, minWidth: 120 }}>EXECLEAD.AI</div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Digital Signature</div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-4 justify-center">
        <button onClick={handleDownloadPdf} disabled={downloading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors disabled:opacity-40">
          {downloading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={16} />}
          Download PDF
        </button>
        <button onClick={() => setShareOpen(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors">
          <Share2 size={16} /> Share on LinkedIn
        </button>
      </div>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} achievement={achievementType || "certificate_earned"} achievementTitle={achievementTitle || achievement.label} userName={userName} referralCode={referralCode} />
    </div>
  );
}