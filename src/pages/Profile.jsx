import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { getLevel, checkAchievements, ACHIEVEMENTS } from "@/lib/gamification";
import { UserCircle, Loader2, Camera, Linkedin, FileText, Upload, Trophy, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const profiles = await base44.entities.UserProfile.list();
        if (profiles.length > 0) {
          setProfile(profiles[0]);
          setForm({
            bio: profiles[0].bio || "",
            linkedin_url: profiles[0].linkedin_url || "",
            skills: (profiles[0].skills || []).join(", "),
          });
        }
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !profile) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.UserProfile.update(profile.id, { profile_photo: file_url });
      setProfile({ ...profile, profile_photo: file_url });
    } catch (e) {}
    setUploading(false);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !profile) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.UserProfile.update(profile.id, { resume_url: file_url });
      setProfile({ ...profile, resume_url: file_url });
    } catch (e) {}
    setUploading(false);
  };

  const saveProfile = async () => {
    try {
      const skills = form.skills.split(",").map(s => s.trim()).filter(Boolean);
      await base44.entities.UserProfile.update(profile.id, {
        bio: form.bio, linkedin_url: form.linkedin_url, skills,
      });
      setProfile({ ...profile, bio: form.bio, linkedin_url: form.linkedin_url, skills });
      setEditing(false);
    } catch (e) {}
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  if (!profile) return null;

  const levelInfo = getLevel(profile.xp_points || 0);
  const unlocked = checkAchievements(profile);
  const locked = ACHIEVEMENTS.filter(a => !unlocked.find(u => u.id === a.id));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <UserCircle size={12} className="text-indigo-400" /> Executive Profile
        </div>
        <h1 className="text-2xl font-bold text-white">{profile.full_name || "Executive"}</h1>
      </div>

      {/* Profile Header */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center text-2xl font-bold text-indigo-400 overflow-hidden">
              {profile.profile_photo ? <img src={profile.profile_photo} alt="" className="w-full h-full object-cover" /> : (profile.full_name || "U").charAt(0)}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-600 transition-colors">
              {uploading ? <Loader2 size={14} className="animate-spin text-white" /> : <Camera size={14} className="text-white" />}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{profile.full_name}</h2>
            <p className="text-white/40 text-sm">{profile.current_role || "Executive"} at {profile.current_company || "—"}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg">{levelInfo.current.icon}</span>
              <span className="text-sm text-white/60">Level {levelInfo.current.level} · {levelInfo.current.title}</span>
              <span className="text-white/30 text-xs">· {profile.xp_points || 0} XP</span>
            </div>
            <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden max-w-xs">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700" style={{ width: `${levelInfo.progress}%` }} />
            </div>
            {levelInfo.next && <p className="text-white/30 text-xs mt-1">{levelInfo.next.xp - (profile.xp_points || 0)} XP to {levelInfo.next.title}</p>}
          </div>
        </div>
      </div>

      {/* Career Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Current Position</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-white/40">Role</span><span className="text-white/70">{profile.current_role || "—"}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Company</span><span className="text-white/70">{profile.current_company || "—"}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Experience</span><span className="text-white/70">{profile.years_experience || 0} years</span></div>
            <div className="flex justify-between"><span className="text-white/40">Industry</span><span className="text-white/70">{profile.industry || "—"}</span></div>
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Target</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-white/40">Role</span><span className="text-indigo-400">{profile.target_role || "—"}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Company</span><span className="text-white/70">{profile.target_company || "—"}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Country</span><span className="text-white/70">{profile.country || "—"}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Learning</span><span className="text-white/70">{profile.preferred_learning_style || "—"}</span></div>
          </div>
        </div>
      </div>

      {/* Bio & Links */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">About</h3>
          <button onClick={() => setEditing(!editing)} className="text-xs text-indigo-400 hover:text-indigo-300">{editing ? "Cancel" : "Edit"}</button>
        </div>
        {editing ? (
          <div className="space-y-3">
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Executive bio..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none" />
            <input value={form.linkedin_url} onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))} placeholder="LinkedIn URL" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
            <input value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} placeholder="Skills (comma separated)" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
            <button onClick={saveProfile} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors">Save</button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-white/60 text-sm leading-relaxed">{profile.bio || "No bio added yet. Click edit to add your executive bio."}</p>
            {profile.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/10 text-indigo-400">{s}</span>)}
              </div>
            )}
            <div className="flex items-center gap-3 pt-2">
              {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300"><Linkedin size={14} /> LinkedIn</a>}
              <label className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 cursor-pointer">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {profile.resume_url ? "Resume uploaded" : "Upload resume"}
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Challenges", value: profile.challenges_completed || 0, icon: Star, color: "text-yellow-400" },
          { label: "Sessions", value: profile.sessions_completed || 0, icon: Trophy, color: "text-indigo-400" },
          { label: "Streak", value: profile.streak_days || 0, icon: Star, color: "text-orange-400" },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
            <s.icon size={18} className={`${s.color} mx-auto`} />
            <div className="text-2xl font-bold text-white mt-1">{s.value}</div>
            <div className="text-white/30 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div>
        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Achievements</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = unlocked.find(u => u.id === ach.id);
            return (
              <motion.div key={ach.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-xl border p-4 text-center transition-all ${isUnlocked ? "bg-indigo-500/5 border-indigo-500/15" : "bg-white/[0.02] border-white/5 opacity-40"}`}>
                <div className="text-3xl mb-2" style={{ filter: isUnlocked ? "none" : "grayscale(1)" }}>{ach.icon}</div>
                <p className="text-white/70 text-xs font-medium">{ach.name}</p>
                <p className="text-white/30 text-[10px] mt-0.5">{ach.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}