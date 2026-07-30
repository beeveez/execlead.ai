import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import SuccessStoryCard from '@/components/success-stories/SuccessStoryCard';
import GenerateStoryModal from '@/components/success-stories/GenerateStoryModal';
import { Sparkles, BookOpen, Loader2 } from 'lucide-react';

export default function ExecutiveSuccessStories() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGen, setShowGen] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const all = await base44.entities.ExecutiveSuccessStory.filter({ user_id: user.id }, '-generated_date', 50);
      setStories(all || []);
    } catch (e) {
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-accent-orange/15 flex items-center justify-center">
              <BookOpen size={18} className="text-accent-orange" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white">Executive Success Stories™</h1>
          </div>
          <p className="text-sm text-white/50 max-w-2xl">AI-generated case studies of your leadership journey, built from your verified evidence, outcomes, and growth.</p>
        </div>
        <button
          onClick={() => setShowGen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold transition-colors"
        >
          <Sparkles size={16} /> Generate My Success Story
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 size={24} className="animate-spin text-accent-orange" /></div>
      ) : stories.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] border border-white/8 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-accent-orange/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={24} className="text-accent-orange" />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">No success stories yet</h3>
          <p className="text-sm text-white/50 max-w-md mx-auto mb-6">Generate your first Executive Success Story™ from your verified leadership journey, coaching, simulations, and measurable outcomes.</p>
          <button onClick={() => setShowGen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold transition-colors">
            <Sparkles size={15} /> Generate My Success Story
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((s) => <SuccessStoryCard key={s.id} story={s} ownerLink />)}
        </div>
      )}

      <GenerateStoryModal open={showGen} onClose={() => setShowGen(false)} onGenerated={load} />
    </div>
  );
}