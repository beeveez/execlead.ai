import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import SuccessStoryView from '@/components/success-stories/SuccessStoryView';
import PageMetadata from '@/components/marketing/PageMetadata';

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
      <PageMetadata
        title={story?.title ? `${story.title} | EXECLEAD.AI` : 'Executive Success Story | EXECLEAD.AI'}
        description="Discover executive leadership success stories and real-world leadership transformation powered by EXECLEAD.AI."
        path={`/success-stories/${id}`}
      />
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