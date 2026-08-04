import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import SuccessStoryView from '@/components/success-stories/SuccessStoryView';

export default function SuccessStoryPublic() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.ExecutiveSuccessStory.get(id)
      .then((s) => setStory(s))
      .catch(() => setStory(null))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="pt-28">
      <SuccessStoryView
        story={story}
        loading={loading}
        isOwner={false}
        publicView
        backLink="/success-stories"
      />
    </div>
  );
}