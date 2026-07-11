import React, { useRef } from "react";
import { Maximize2, Download, FileDown } from "lucide-react";
import DomainMaturityRadar from "@/components/dashboard/DomainMaturityRadar";
import { Radar } from "lucide-react";

export default function IntelligenceRadarSection() {
  const captureRef = useRef(null);

  const handleExportPNG = async () => {
    if (!captureRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(captureRef.current, { backgroundColor: "#0a0a0f", scale: 2 });
    const link = document.createElement("a");
    link.download = "executive-intelligence-radar.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleExportPDF = async () => {
    if (!captureRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const canvas = await html2canvas(captureRef.current, { backgroundColor: "#0a0a0f", scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("executive-intelligence-radar.pdf");
  };

  const handleFullscreen = () => {
    if (!captureRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else captureRef.current.requestFullscreen?.();
  };

  return (
    <section id="section-radar" className="scroll-mt-20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radar size={16} className="text-indigo-400" />
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Interactive Radar</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleFullscreen} title="Fullscreen"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] text-white/60 hover:text-white text-xs transition-all">
            <Maximize2 size={12} />
          </button>
          <button onClick={handleExportPNG} title="Export PNG"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] text-white/60 hover:text-white text-xs transition-all">
            <Download size={12} /> PNG
          </button>
          <button onClick={handleExportPDF} title="Export PDF"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] text-white/60 hover:text-white text-xs transition-all">
            <FileDown size={12} /> PDF
          </button>
        </div>
      </div>
      <div ref={captureRef} className="rounded-xl overflow-hidden">
        <DomainMaturityRadar />
      </div>
    </section>
  );
}