import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Lock, Clock, Shield, Trash2, AlertTriangle, Loader2, Fingerprint, Calendar } from "lucide-react";

function calculateTimeLeft(unlockDate) {
  const diff = new Date(unlockDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    years: Math.floor(diff / (1000 * 60 * 60 * 24 * 365)),
    days: Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function CountdownUnit({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-4xl font-bold text-amber-400 tabular-nums">{String(value).padStart(2, "0")}</div>
      <div className="text-white/30 text-[10px] md:text-xs uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}

export default function CapsuleSealed({ capsule, founderNumber }) {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(capsule.unlock_date));
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft(capsule.unlock_date)), 1000);
    return () => clearInterval(timer);
  }, [capsule.unlock_date]);

  const unlockDate = new Date(capsule.unlock_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const sealedDate = capsule.sealed_at ? new Date(capsule.sealed_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

  const handleDelete = async () => {
    if (deleteConfirm !== capsule.capsule_id) {
      toast({ title: "Confirmation mismatch", description: `Type ${capsule.capsule_id} exactly`, variant: "destructive" });
      return;
    }
    setDeleting(true);
    try {
      const res = await base44.functions.invoke("manageTimeCapsule", { action: "delete", confirmation: deleteConfirm });
      const d = res.data || res;
      if (d.success) {
        toast({ title: "Capsule deleted" });
        window.location.reload();
      } else {
        toast({ title: d.error || "Delete failed", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
    setDeleting(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Sealed Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4 gold-glow">
          <Lock size={14} className="text-amber-400" />
          <span className="text-amber-400 text-xs font-medium">Sealed</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Your Time Capsule is Sealed</h2>
        <p className="text-white/40 text-sm">It will open on {unlockDate}</p>
      </motion.div>

      {/* Countdown */}
      {timeLeft && (
        <div className="bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/10 rounded-2xl p-6 md:p-8 mb-6">
          <div className="text-center mb-4">
            <Clock size={20} className="text-amber-400 mx-auto mb-2" />
            <div className="text-white/40 text-xs uppercase tracking-widest">Time Remaining</div>
          </div>
          <div className="grid grid-cols-5 gap-2 md:gap-4">
            <CountdownUnit value={timeLeft.years} label="Years" />
            <CountdownUnit value={timeLeft.days} label="Days" />
            <CountdownUnit value={timeLeft.hours} label="Hours" />
            <CountdownUnit value={timeLeft.minutes} label="Min" />
            <CountdownUnit value={timeLeft.seconds} label="Sec" />
          </div>
        </div>
      )}

      {/* Capsule Info */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6 space-y-3">
        <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest mb-2">
          <Shield size={12} className="text-amber-400" /> Digital Legacy
        </div>
        <InfoRow icon={Fingerprint} label="Capsule ID" value={capsule.capsule_id} />
        <InfoRow icon={Shield} label="Founder Number" value={founderNumber || capsule.founding_member_number} />
        <InfoRow icon={Calendar} label="Sealed On" value={sealedDate} />
        <InfoRow icon={Clock} label="Unlocks On" value={unlockDate} />
        {capsule.digital_signature && (
          <InfoRow icon={Fingerprint} label="Digital Signature" value={`${capsule.digital_signature.substring(0, 24)}...`} mono />
        )}
      </div>

      {/* Sealed Notice */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-start gap-3 mb-6">
        <Lock size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-white/40 leading-relaxed">
          This capsule is sealed and immutable. It cannot be edited or viewed until the unlock date. Only you control its visibility.
        </div>
      </div>

      {/* Delete */}
      <div className="text-center">
        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            className="inline-flex items-center gap-1.5 text-white/20 hover:text-red-400 text-xs transition-colors"
          >
            <Trash2 size={12} /> Delete Capsule
          </button>
        ) : (
          <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-red-400" />
              <span className="text-red-400 text-sm font-medium">Delete Time Capsule</span>
            </div>
            <p className="text-white/40 text-xs mb-3">
              This action is permanent. Type your Capsule ID to confirm: <span className="text-amber-400 font-mono">{capsule.capsule_id}</span>
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={capsule.capsule_id}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/90 text-sm font-mono mb-3 focus:outline-none focus:border-red-500/50"
            />
            <div className="flex gap-2">
              <button onClick={() => { setShowDelete(false); setDeleteConfirm(""); }} className="flex-1 py-2 rounded-lg text-xs text-white/50 bg-white/5 hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete Forever
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={14} className="text-white/30 flex-shrink-0" />
      <span className="text-white/40 text-xs w-32 flex-shrink-0">{label}</span>
      <span className={`text-white/70 text-sm ${mono ? "font-mono" : ""} truncate`}>{value}</span>
    </div>
  );
}