import React, { useState } from 'react';
import { Download, Link2, Star, Lock, User, Globe, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useToast } from '@/components/ui/use-toast';
import { safeParse } from '@/lib/executiveSuccessStoryEngine';

const VIS_OPTIONS = [
  { value: 'private', label: 'Private', icon: Lock },
  { value: 'anonymous', label: 'Anonymous Public', icon: Globe },
  { value: 'named', label: 'Named Public', icon: User },
];

export default function StoryExportBar({ story, isOwner, onUpdate, canFeature }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  if (!story) return null;

  const exportPdf = () => {
    setBusy(true);
    try {
      const doc = new jsPDF();
      let y = 20;
      const need = (n) => { if (y + n > 275) { doc.addPage(); y = 20; } };

      doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(20);
      doc.splitTextToSize(story.title || 'Executive Success Story', 180).forEach((l) => { need(8); doc.text(l, 14, y); y += 8; });
      y += 3;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(110);
      if (story.user_name) { doc.text(`Member: ${story.user_name}`, 14, y); y += 6; }
      if (story.journey_start) { doc.text(`Journey: ${story.journey_start} → ${story.journey_end || 'present'}`, 14, y); y += 6; }
      y += 2; doc.setTextColor(40);
      doc.splitTextToSize(story.summary || '', 180).forEach((l) => { need(5); doc.text(l, 14, y); y += 5; });
      y += 4;

      doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
      doc.text('Executive Narrative', 14, y); y += 7;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
      const nar = (story.narrative || '').replace(/[#*`>_\u2022-]/g, '');
      doc.splitTextToSize(nar, 180).forEach((l) => { need(5); doc.text(l, 14, y); y += 5; });
      y += 5;

      const m = safeParse(story.metrics_snapshot_json, {});
      need(24);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
      doc.text('Success Metrics', 14, y); y += 7;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(60);
      const rows = [
        `Executive Readiness: ${m.readinessBeginning || 0} → ${m.readinessCurrent || 0} (+${m.improvement || 0})`,
        `Journey Level: ${m.journeyLevel || '—'}`,
        `Evidence Records: ${m.counts?.evidence || 0}   Learning Sessions: ${m.counts?.lessons || 0}`,
        `Simulations: ${m.counts?.simulations || 0}   Decision Labs: ${m.counts?.decisionLabs || 0}`,
        `Challenges: ${m.counts?.challenges || 0}   Achievements: ${m.counts?.achievements || 0}   Outcomes: ${m.counts?.outcomes || 0}`,
      ];
      rows.forEach((r) => { need(6); doc.text(r, 14, y); y += 6; });

      doc.save(`${story.story_id || 'success-story'}.pdf`);
      toast({ title: 'PDF downloaded' });
    } catch (e) {
      toast({ title: 'PDF export failed', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/success-stories/${story.story_id}`;
    navigator.clipboard?.writeText(url);
    toast({ title: 'Share link copied' });
  };

  const setVisibility = (v) => {
    const published = v !== 'private';
    const patch = {
      visibility: v,
      published,
      consent_status: published ? 'granted' : 'not_requested',
      share_url: published ? `/success-stories/${story.story_id}` : '',
      user_name: v === 'anonymous' ? '' : (story.user_name || ''),
    };
    onUpdate?.(story.id, patch);
    toast({ title: published ? 'Story published' : 'Story set to private' });
  };

  const toggleFeatured = () => {
    onUpdate?.(story.id, { featured: !story.featured });
    toast({ title: story.featured ? 'Removed from featured' : 'Marked as featured' });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 bg-white/[0.02] border border-white/8 rounded-xl p-3">
      <button
        onClick={exportPdf}
        disabled={busy}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-orange/15 text-accent-orange text-xs font-medium hover:bg-accent-orange/25 transition-colors disabled:opacity-50"
      >
        {busy ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} Download PDF
      </button>
      {story.published && (
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors"
        >
          <Link2 size={13} /> Copy Share Link
        </button>
      )}
      {isOwner && (
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[10px] text-white/40 mr-1">Consent:</span>
          {VIS_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setVisibility(o.value)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                story.visibility === o.value
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-white/5 text-white/50 hover:text-white/80 border border-transparent'
              }`}
            >
              <o.icon size={12} /> {o.label}
            </button>
          ))}
          {canFeature && (
            <button
              onClick={toggleFeatured}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                story.featured ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-white/50 border border-transparent'
              }`}
            >
              <Star size={12} /> Featured
            </button>
          )}
        </div>
      )}
    </div>
  );
}