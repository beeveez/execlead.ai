import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import DemoHero from '@/components/demo/DemoHero';
import DemoVideoStage from '@/components/demo/DemoVideoStage';
import DemoWalkthrough from '@/components/demo/DemoWalkthrough';
import DemoHighlights from '@/components/demo/DemoHighlights';
import DemoSocialProof from '@/components/demo/DemoSocialProof';
import DemoFinalCTA from '@/components/demo/DemoFinalCTA';

export default function Demo() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { (async () => { try { setAuthed(await base44.auth.isAuthenticated()); } catch (e) {} })(); }, []);
  useEffect(() => { try { base44.analytics.track({ eventName: 'demo_page_viewed' }); } catch (e) {} }, []);
  return (
    <div className="bg-[#0a0a0f]">
      <DemoHero authed={authed} />
      <DemoVideoStage authed={authed} />
      <DemoWalkthrough />
      <DemoHighlights />
      <DemoSocialProof />
      <DemoFinalCTA authed={authed} />
    </div>
  );
}