import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import SuccessStoryView from '@/components/success-stories/SuccessStoryView';
import PageMetadata from '@/components/marketing/PageMetadata';

export default function SuccessStoryDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const s = await base44.entities.ExecutiveSuccessStory.get(id);
      setStory(s);
    } catch (e) { setStory(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const onUpdate = async (sid, patch) => {
    const updated = await base44.entities.ExecutiveSuccessStory.update(sid, patch);
    setStory(updated);
  };

  const isOwner = user && story && story.user_id === user.id;
  const canFeature = isOwner;

  return (
    <>
      <PageMetadata
        title="Member Success Story | EXECLEAD.AI"
        description="Private member success-story workspace."
        path={`/executive-success-stories/${id}`}
        indexable={false}
      />
      <SuccessStoryView
        story={story}
        loading={loading}
        isOwner={isOwner}
        onUpdate={onUpdate}
        canFeature={canFeature}
        backLink="/executive-success-stories"
      />
    </>
  );
}