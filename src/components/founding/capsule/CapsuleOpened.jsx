import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Unlock, Sparkles, Loader2, ArrowRight, Globe, Users, Lock, Crown, ImageIcon, Video, Mic, FileText, Download } from "lucide-react";

const VISIBILITY_OPTIONS = [
  { value: "private", label: "Private", icon: Lock },
  { value: "friends", label: "Friends", icon: Users },
  { value: "founders", label: "Founders", icon: Crown },
  { value: "public", label: "Public", icon: Globe },
];

function ThenVsNow({ snapshot, current }) {
  const rows = [
    { label: "Role", then: snapshot.profession, now: current.profession },
    { label: "Company", then: snapshot.company, now: current.company },
    { label: "Industry", then: snapshot.industry, now: current.industry },
    { label: "Country", then: snapshot.country, now: current.country },
    { label: "Plan", then: snapshot.subscription_plan, now: current.subscription_plan },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="text-amber-400/60 text-xs font-medium uppercase tracking-widest mb-3">Then</div>
        <div className="text-white/30 text-xs mb-1">Sealed on {snapshot.sealed_at ? new Date(snapshot.sealed_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}</div>
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
            <span className="text-white/40 text-xs">{r.label}</span>
            <span className="text-white/60 text-xs font-medium">{r.then || "—"}</span>
          </div>
        ))}
      </div>
      <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
        <div className="text-amber-400 text-xs font-medium uppercase tracking-widest mb-3">Now</div>
        <div className="text-white/30 text-xs mb-1">Today</div>
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
            <span className="text-white/40 text-xs">{r.label}</span>
            <span className="text-white/70 text-xs font-medium">{r.now || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CapsuleOpened({ capsule, founderNumber, currentProfile, onUpdate }) {
  const { toast } = useToast();
  const [opened, setOpened] = useState(capsule.status === "opened");
  const [generating, setGenerating] = useState(false);
  const [reflection, setReflection] = useState(
    capsule.ai_reflection_json ? JSON.parse(capsule.ai_reflection_json) : null
  );
  const [publishing, setPublishing] = useState(false);
  const [visibility, setVisibility] = useState(capsule.legacy_visibility || "private");

  const snapshot = capsule.snapshot_json ? JSON.parse(capsule.snapshot_json) : {};
  const sealedDate = capsule.sealed_at ? new Date(capsule.sealed_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
  const yearsAsFounder = capsule.sealed_at ? ((Date.now() - new Date(capsule.sealed_at).getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1) : "0";

  const handleOpen = () => setOpened(true);

  const handleGenerateReflection = async () => {
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("manageTimeCapsule", { action: "generate_reflection" });
      const d = res.data || res;
      if (d.success) {
        setReflection(d.reflection);
        setOpened(true);
        toast({ title: "Reflection generated" });
      } else {
        toast({ title: d.error || "Failed to generate reflection", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Failed to generate reflection", variant: "destructive" });
    }
    setGenerating(false);
  };

  const handlePublish = async (vis) => {
    setVisibility(vis);
    setPublishing(true);
    try {
      await base44.functions.invoke("manageTimeCapsule", { action: "publish", visibility: vis });
      toast({ title: vis === "private" ? "Capsule set to private" : "Capsule published" });
      onUpdate?.();
    } catch (e) {
      toast({ title: "Failed to update visibility", variant: "destructive" });
    }
    setPublishing(false);
  };

  // Not yet opened — show opening ceremony button
  if (!opened) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center gold-glow"
        >
          <Unlock size={36} className="text-amber-400" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-3 gold-shimmer">Your Time Capsule is Ready</h2>
        <p className="text-white/40 text-sm max-w-md mx-auto mb-6">
          Sealed on {sealedDate}. The time has come to open your capsule and reflect on your executive journey.
        </p>
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-medium px-8 py-3.5 rounded-xl transition-colors"
        >
          <Unlock size={18} /> Open My Capsule
        </button>
      </div>
    );
  }

  // Opened — show full experience
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full mb-3">
          <Unlock size={14} className="text-amber-400" />
          <span className="text-amber-400 text-xs font-medium">Opened</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-1">Your Executive Journey</h2>
        <p className="text-white/40 text-sm">Sealed {sealedDate} · {yearsAsFounder} years as founder</p>
        {founderNumber && <p className="text-amber-400/60 text-xs mt-1">{founderNumber}</p>}
      </motion.div>

      {/* Original Messages */}
      <div className="space-y-4">
        <h3 className="text-white/60 text-xs font-semibold uppercase tracking-widest flex items-center gap-2">
          <Sparkles size={12} className="text-amber-400" /> Your Original Message
        </h3>
        <CapsuleMessage label="Why I joined EXECLEAD.AI" content={capsule.why_joined} />
        <CapsuleMessage label="My career goals at the time" content={capsule.career_goals_today} />
        <CapsuleMessage label="My leadership principle" content={capsule.leadership_principle} />
        <CapsuleMessage label="Where I hoped to be in 5 years" content={capsule.hope_5_years} />
        <CapsuleMessage label="Where I hoped to be in 10 years" content={capsule.hope_10_years} />
        <CapsuleMessage label="Where I hoped to be in 20 years" content={capsule.hope_20_years} />
        <CapsuleMessage label="Advice to my future self" content={capsule.advice_future_self} />
        <CapsuleMessage label="What I believed EXECLEAD.AI would become" content={capsule.belief_execlead_future} />
      </div>

      {/* Media */}
      {(capsule.photo_url || capsule.video_url || capsule.audio_url || capsule.document_url) && (
        <div className="space-y-3">
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-widest flex items-center gap-2">
            <ImageIcon size={12} className="text-amber-400" /> Original Media
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {capsule.photo_url && <MediaCard url={capsule.photo_url} type="photo" />}
            {capsule.video_url && <MediaCard url={capsule.video_url} type="video" />}
            {capsule.audio_url && <MediaCard url={capsule.audio_url} type="audio" />}
            {capsule.document_url && <MediaCard url={capsule.document_url} type="document" />}
          </div>
        </div>
      )}

      {/* Then vs Now */}
      <div className="space-y-3">
        <h3 className="text-white/60 text-xs font-semibold uppercase tracking-widest flex items-center gap-2">
          <ArrowRight size={12} className="text-amber-400" /> Then vs Now
        </h3>
        <ThenVsNow snapshot={snapshot} current={currentProfile || snapshot} />
      </div>

      {/* AI Reflection */}
      <div className="space-y-3">
        <h3 className="text-white/60 text-xs font-semibold uppercase tracking-widest flex items-center gap-2">
          <Sparkles size={12} className="text-amber-400" /> AI Executive Journey Reflection
        </h3>
        {reflection ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/10 rounded-2xl p-6 space-y-4">
            <p className="text-white/70 text-sm leading-relaxed">{reflection.summary}</p>
            {reflection.highlights?.length > 0 && <ReflectionSection title="Highlights" items={reflection.highlights} color="text-emerald-400" />}
            {reflection.growth_areas?.length > 0 && <ReflectionSection title="Growth Areas" items={reflection.growth_areas} color="text-amber-400" />}
            {reflection.milestones?.length > 0 && <ReflectionSection title="Milestones" items={reflection.milestones} color="text-indigo-400" />}
            {reflection.recommendations?.length > 0 && <ReflectionSection title="Recommendations" items={reflection.recommendations} color="text-purple-400" />}
          </motion.div>
        ) : (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center">
            <Sparkles size={24} className="text-amber-400/50 mx-auto mb-3" />
            <p className="text-white/40 text-sm mb-4">Generate a personalized AI reflection analyzing your executive journey — comparing your original goals with your current achievements.</p>
            <button
              onClick={handleGenerateReflection}
              disabled={generating}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {generating ? "Generating..." : "Generate AI Reflection"}
            </button>
          </div>
        )}
      </div>

      {/* Legacy Publishing */}
      <div className="space-y-3">
        <h3 className="text-white/60 text-xs font-semibold uppercase tracking-widest flex items-center gap-2">
          <Globe size={12} className="text-amber-400" /> Founder Legacy
        </h3>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <p className="text-white/40 text-xs mb-3">Choose who can see your capsule story:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {VISIBILITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handlePublish(opt.value)}
                disabled={publishing}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${visibility === opt.value ? "bg-amber-500/10 border-amber-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}
              >
                <opt.icon size={16} className={visibility === opt.value ? "text-amber-400" : "text-white/30"} />
                <span className={`text-xs ${visibility === opt.value ? "text-amber-400" : "text-white/50"}`}>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CapsuleMessage({ label, content }) {
  if (!content) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="text-amber-400/60 text-xs font-medium mb-2">{label}</div>
      <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
    </motion.div>
  );
}

function ReflectionSection({ title, items, color }) {
  return (
    <div>
      <div className={`text-xs font-semibold mb-2 ${color}`}>{title}</div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-white/60 text-sm flex items-start gap-2">
            <span className={`mt-1.5 w-1 h-1 rounded-full ${color.replace("text-", "bg-")} flex-shrink-0`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MediaCard({ url, type }) {
  const icons = { photo: ImageIcon, video: Video, audio: Mic, document: FileText };
  const labels = { photo: "Photo", video: "Video", audio: "Audio", document: "Document" };
  const Icon = icons[type];

  if (type === "photo") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden hover:border-amber-500/30 transition-all">
        <img src={url} alt="Capsule photo" className="w-full h-24 object-cover" />
      </a>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg p-4 h-24 hover:border-amber-500/30 transition-all">
      <Icon size={20} className="text-amber-400/60" />
      <span className="text-white/40 text-xs">{labels[type]}</span>
      <Download size={12} className="text-white/20" />
    </a>
  );
}