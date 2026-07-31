import React, { useRef, useState } from 'react';
import { Download, Image as ImageIcon, Link2, Share2, Check } from 'lucide-react';

export default function ReadinessShareReport({ results, shareSlug }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(null);
  const [copied, setCopied] = useState(false);
  const { overall, classification, gap, forecast } = results;

  const exportPNG = async () => {
    if (!ref.current) return;
    setBusy('png');
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(ref.current, { backgroundColor: '#0a0a0f', scale: 2 });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url; a.download = 'executive-readiness-report.png'; a.click();
    } finally { setBusy(null); }
  };

  const exportPDF = async () => {
    if (!ref.current) return;
    setBusy('pdf');
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(ref.current, { backgroundColor: '#0a0a0f', scale: 2 });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(img, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save('executive-readiness-report.pdf');
    } finally { setBusy(null); }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/assessment?share=${shareSlug || ''}`;
    navigator.clipboard?.writeText(link);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button onClick={exportPNG} disabled={!!busy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/70 font-medium transition-colors disabled:opacity-50">
          {busy === 'png' ? '…' : <ImageIcon size={13} />} PNG
        </button>
        <button onClick={exportPDF} disabled={!!busy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/70 font-medium transition-colors disabled:opacity-50">
          {busy === 'pdf' ? '…' : <Download size={13} />} PDF
        </button>
        <button onClick={copyLink} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/70 font-medium transition-colors">
          {copied ? <Check size={13} className="text-emerald-400" /> : <Link2 size={13} />} {copied ? 'Copied' : 'Copy Link'}
        </button>
        <span className="flex items-center gap-1 text-[10px] text-white/30 ml-auto"><Share2 size={11} /> LinkedIn-ready image</span>
      </div>

      <div ref={ref} className="rounded-2xl overflow-hidden border border-white/10" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #14121c 100%)' }}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-accent-orange/20 flex items-center justify-center text-accent-orange font-bold text-sm">E</div>
              <span className="text-sm font-semibold text-white tracking-wide">EXECLEAD.AI</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-white/40">Executive Readiness Report™</span>
          </div>

          <div className="text-center my-8">
            <div className="text-[11px] uppercase tracking-widest text-accent-orange mb-2">Executive Readiness</div>
            <div className="text-7xl font-bold text-white leading-none">{overall}<span className="text-3xl text-white/40">%</span></div>
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-accent-orange/15 border border-accent-orange/30 text-sm font-medium text-accent-orange">{classification.label}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/[0.04] rounded-xl p-4">
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Promotion Target</div>
              <div className="text-sm font-semibold text-white">{forecast.targetLevel}</div>
              <div className="text-xs text-emerald-400 mt-1">{forecast.estimatedMonths}</div>
            </div>
            <div className="bg-white/[0.04] rounded-xl p-4">
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Confidence</div>
              <div className="text-sm font-semibold text-white">{forecast.confidence}</div>
              <div className="text-xs text-white/40 mt-1">{gap.confidence} signal reliability</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-400 mb-2">Top Strengths</div>
              {gap.strengths.map((s) => (
                <div key={s.label} className="flex items-center justify-between text-xs text-white/80 py-1 border-b border-white/5">
                  <span>{s.label}</span><span className="text-emerald-400 font-bold">{s.score}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-amber-400 mb-2">Growth Opportunities</div>
              {gap.opportunities.map((s) => (
                <div key={s.label} className="flex items-center justify-between text-xs text-white/80 py-1 border-b border-white/5">
                  <span>{s.label}</span><span className="text-amber-400 font-bold">{s.score}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 text-center text-[10px] text-white/30">
            Generated by EXECLEAD.AI · The AI Executive Leadership Operating System™
          </div>
        </div>
      </div>
    </div>
  );
}