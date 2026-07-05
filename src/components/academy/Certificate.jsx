import React, { useRef } from "react";
import { Award, Download, CheckCircle } from "lucide-react";
import html2canvas from "html2canvas";

export default function Certificate({ certificate, course }) {
  const certRef = useRef(null);

  const download = async () => {
    if (!certRef.current) return;
    const canvas = await html2canvas(certRef.current, { backgroundColor: "#0a0a0f", scale: 2 });
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `EXECLEAD_Certificate_${course.slug}.png`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div ref={certRef} className="relative bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] border-2 border-indigo-500/20 rounded-2xl p-8 md:p-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 mb-4"><Award className="text-indigo-400" size={32} /></div>
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">EXECLEAD.AI</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Certificate of Completion</h2>
          <p className="text-white/40 text-sm mb-8">This certifies that</p>
          <p className="text-xl md:text-2xl font-semibold text-indigo-400 mb-2">{certificate.user_name}</p>
          <p className="text-white/40 text-sm mb-6">has successfully completed</p>
          <p className="text-lg md:text-xl font-semibold text-white mb-8">{course.title}</p>
          <div className="flex items-center justify-center gap-8 text-xs text-white/40">
            <div><p className="text-white/60 font-medium">{certificate.completion_date}</p><p className="text-white/20 mt-0.5">Completion Date</p></div>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(certificate.verification_url)}`} alt="Verification QR" className="w-20 h-20 rounded-lg bg-white p-1" />
            <div><p className="text-white/60 font-medium font-mono">{certificate.certificate_id}</p><p className="text-white/20 mt-0.5">Certificate ID</p></div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400 text-sm"><CheckCircle size={16} /> Course completed</div>
        <button onClick={download} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Download size={14} /> Download Certificate</button>
      </div>
    </div>
  );
}