import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const action = body.action;

    // ─── CREATE ────────────────────────────────────────────
    if (action === 'create') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      let profile = {};
      try {
        const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: user.id });
        profile = profiles[0] || {};
      } catch (e) {}

      let founderNumber = '';
      let isFounder = false;
      try {
        const waitlist = await base44.asServiceRole.entities.FoundingWaitlist.filter({ user_id: user.id });
        const founder = waitlist.find(w => w.status !== 'cancelled' && w.status !== 'declined');
        if (founder) { founderNumber = founder.founding_member_number; isFounder = true; }
      } catch (e) {}

      const status = body.submit ? 'pending_review' : 'draft';

      const letter = await base44.asServiceRole.entities.LeadershipLetter.create({
        author_user_id: user.id,
        author_name: body.author_name || profile.full_name || user.full_name || '',
        author_photo: profile.avatar_url || '',
        author_headline: body.author_position || profile.profession || '',
        author_founder_number: founderNumber,
        author_is_founder: isFounder,
        author_verification_badge: profile.verified || false,
        title: body.title || '',
        subtitle: body.subtitle || '',
        category: body.category || '',
        message: body.message || '',
        author_position: body.author_position || profile.profession || '',
        organization: body.organization || profile.company_name || '',
        industry: body.industry || '',
        country: body.country || profile.country || '',
        years_experience: body.years_experience || 0,
        leadership_level: body.leadership_level || '',
        key_lessons: body.key_lessons || [],
        advice: body.advice || '',
        recommended_books: body.recommended_books || [],
        recommended_courses: body.recommended_courses || [],
        recommended_habits: body.recommended_habits || [],
        quotes: body.quotes || [],
        reflection_questions: body.reflection_questions || [],
        closing_message: body.closing_message || '',
        photo_url: body.photo_url || '',
        video_url: body.video_url || '',
        audio_url: body.audio_url || '',
        presentation_url: body.presentation_url || '',
        pdf_url: body.pdf_url || '',
        status,
        tags: body.tags || [],
        views: 0,
        likes: 0,
        bookmarks: 0,
        comments_count: 0,
        shares: 0,
      });

      return Response.json({ success: true, letter });
    }

    // ─── UPDATE ────────────────────────────────────────────
    if (action === 'update') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: body.letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Letter not found' }, { status: 404 });
      if (letter.author_user_id !== user.id && user.role !== 'admin') {
        return Response.json({ error: 'Only the author can edit' }, { status: 403 });
      }
      if (letter.status === 'published') {
        return Response.json({ error: 'Published letters cannot be edited' }, { status: 400 });
      }

      const updates = { ...body.fields };
      if (body.submit) updates.status = 'pending_review';

      const updated = await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, updates);
      return Response.json({ success: true, letter: updated });
    }

    // ─── GET (with view increment) ─────────────────────────
    if (action === 'get') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: body.letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Not found' }, { status: 404 });

      if (letter.status !== 'published') {
        if (letter.author_user_id !== user.id && user.role !== 'admin') {
          return Response.json({ error: 'Not available' }, { status: 403 });
        }
      }

      if (letter.status === 'published' && letter.author_user_id !== user.id) {
        try {
          await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, { views: (letter.views || 0) + 1 });
          letter.views = (letter.views || 0) + 1;
        } catch (e) {}
      }

      let myInteraction = { liked: false, bookmarked: false };
      try {
        const interactions = await base44.asServiceRole.entities.LetterInteraction.filter({ user_id: user.id, letter_id: body.letter_id });
        myInteraction = {
          liked: interactions.some(i => i.interaction_type === 'like'),
          bookmarked: interactions.some(i => i.interaction_type === 'bookmark'),
        };
      } catch (e) {}

      return Response.json({ letter, my_interaction: myInteraction });
    }

    // ─── ENGAGE (like/bookmark/share) ──────────────────────
    if (action === 'engage') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { letter_id, type } = body;
      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Not found' }, { status: 404 });

      if (type === 'share') {
        const newShares = (letter.shares || 0) + 1;
        await base44.asServiceRole.entities.LeadershipLetter.update(letter_id, { shares: newShares });
        return Response.json({ success: true, count: newShares });
      }

      const counterField = type === 'like' ? 'likes' : 'bookmarks';
      const existing = await base44.asServiceRole.entities.LetterInteraction.filter({ user_id: user.id, letter_id, interaction_type: type });

      if (existing.length > 0) {
        await base44.asServiceRole.entities.LetterInteraction.delete(existing[0].id);
        const newCount = Math.max(0, (letter[counterField] || 0) - 1);
        await base44.asServiceRole.entities.LeadershipLetter.update(letter_id, { [counterField]: newCount });
        return Response.json({ success: true, active: false, count: newCount });
      } else {
        await base44.asServiceRole.entities.LetterInteraction.create({ user_id: user.id, letter_id, interaction_type: type });
        const newCount = (letter[counterField] || 0) + 1;
        await base44.asServiceRole.entities.LeadershipLetter.update(letter_id, { [counterField]: newCount });
        return Response.json({ success: true, active: true, count: newCount });
      }
    }

    // ─── COMMENT ───────────────────────────────────────────
    if (action === 'comment') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { letter_id, content } = body;
      if (!content?.trim()) return Response.json({ error: 'Comment cannot be empty' }, { status: 400 });

      const comment = await base44.asServiceRole.entities.LetterComment.create({
        letter_id,
        user_id: user.id,
        user_name: user.full_name || '',
        user_photo: '',
        content: content.trim(),
        status: 'active',
        likes: 0,
      });

      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: letter_id });
      if (letters[0]) {
        await base44.asServiceRole.entities.LeadershipLetter.update(letter_id, { comments_count: (letters[0].comments_count || 0) + 1 });
      }

      return Response.json({ success: true, comment });
    }

    // ─── AI ENHANCE ────────────────────────────────────────
    if (action === 'ai_enhance') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an executive writing assistant. Review and enhance this leadership letter draft. Preserve the author's meaning and voice. Return suggestions only.\n\nTitle: ${body.title || ''}\nMessage: ${body.message || ''}\n\nProvide: 1) An improved version of the message (polished grammar, readability, executive tone, better formatting with paragraphs) 2) 3 alternative headline suggestions 3) A tone analysis note.`,
        response_json_schema: {
          type: 'object',
          properties: {
            improved_message: { type: 'string' },
            headline_suggestions: { type: 'array', items: { type: 'string' } },
            tone_note: { type: 'string' },
          },
        },
      });

      return Response.json({ success: true, enhancement: result });
    }

    // ─── AI INSIGHTS ───────────────────────────────────────
    if (action === 'ai_insights') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: body.letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Not found' }, { status: 404 });
      if (letter.author_user_id !== user.id && user.role !== 'admin') {
        return Response.json({ error: 'Only the author can generate insights' }, { status: 403 });
      }

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Analyze this leadership letter and extract executive insights.\n\nTitle: ${letter.title}\nCategory: ${letter.category}\nMessage: ${letter.message}\nKey Lessons: ${(letter.key_lessons || []).join(', ')}\nAdvice: ${letter.advice}`,
        response_json_schema: {
          type: 'object',
          properties: {
            executive_summary: { type: 'string' },
            leadership_competencies: { type: 'array', items: { type: 'string' } },
            leadership_principles: { type: 'array', items: { type: 'string' } },
            decision_themes: { type: 'array', items: { type: 'string' } },
            communication_style: { type: 'string' },
            executive_skills: { type: 'array', items: { type: 'string' } },
            recommended_audience: { type: 'string' },
            key_takeaways: { type: 'array', items: { type: 'string' } },
            reading_time_minutes: { type: 'number' },
          },
        },
      });

      const updates = {
        ai_summary: result.executive_summary || '',
        ai_competencies_json: JSON.stringify(result.leadership_competencies || []),
        ai_principles_json: JSON.stringify(result.leadership_principles || []),
        ai_decision_themes_json: JSON.stringify(result.decision_themes || []),
        ai_communication_style: result.communication_style || '',
        ai_executive_skills_json: JSON.stringify(result.executive_skills || []),
        ai_recommended_audience: result.recommended_audience || '',
        ai_key_takeaways_json: JSON.stringify(result.key_takeaways || []),
        ai_reading_time_minutes: result.reading_time_minutes || 5,
      };

      await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, updates);
      return Response.json({ success: true, insights: result });
    }

    // ─── AI DISCUSS ────────────────────────────────────────
    if (action === 'ai_discuss') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: body.letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Not found' }, { status: 404 });

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an AI executive coach helping a reader understand a leadership letter. Reference the letter's content specifically in your answer.\n\nLetter: "${letter.title}" by ${letter.author_name}\nCategory: ${letter.category}\nMessage: ${letter.message}\nKey Lessons: ${(letter.key_lessons || []).join(', ')}\nAdvice: ${letter.advice}\n\nReader's question: ${body.question}\n\nProvide a thoughtful, specific answer that references the letter's content.`,
      });

      return Response.json({ success: true, answer: result });
    }

    // ─── ADMIN: LIST ───────────────────────────────────────
    if (action === 'admin_list') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const status = body.status || 'pending_review';
      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ status }, '-created_date', 100);
      return Response.json({ letters });
    }

    // ─── ADMIN: ACTION ─────────────────────────────────────
    if (action === 'admin_action') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const { letter_id, admin_action } = body;
      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Not found' }, { status: 404 });

      let updates = {};
      if (admin_action === 'approve') {
        updates = { status: 'published', approved_by_id: user.id, approved_by_name: user.full_name, published_at: new Date().toISOString() };
      } else if (admin_action === 'reject') {
        updates = { status: 'rejected' };
      } else if (admin_action === 'feature') {
        updates = { featured: true };
      } else if (admin_action === 'unfeature') {
        updates = { featured: false };
      } else if (admin_action === 'archive') {
        updates = { status: 'archived' };
      }

      const updated = await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, updates);
      return Response.json({ success: true, letter: updated });
    }

    // ─── ANALYTICS ─────────────────────────────────────────
    if (action === 'analytics') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const all = await base44.asServiceRole.entities.LeadershipLetter.list('-created_date', 1000);
      const published = all.filter(l => l.status === 'published');
      const pending = all.filter(l => l.status === 'pending_review');

      const totalViews = published.reduce((s, l) => s + (l.views || 0), 0);
      const totalLikes = published.reduce((s, l) => s + (l.likes || 0), 0);
      const totalBookmarks = published.reduce((s, l) => s + (l.bookmarks || 0), 0);
      const totalComments = published.reduce((s, l) => s + (l.comments_count || 0), 0);
      const totalShares = published.reduce((s, l) => s + (l.shares || 0), 0);

      const industries = {};
      published.forEach(l => { if (l.industry) industries[l.industry] = (industries[l.industry] || 0) + 1; });
      const countries = {};
      published.forEach(l => { if (l.country) countries[l.country] = (countries[l.country] || 0) + 1; });

      return Response.json({
        total_letters: all.length,
        published: published.length,
        pending_review: pending.length,
        total_views: totalViews,
        total_likes: totalLikes,
        total_bookmarks: totalBookmarks,
        total_comments: totalComments,
        total_shares: totalShares,
        industries: Object.entries(industries).map(([k, v]) => ({ name: k, count: v })).sort((a, b) => b.count - a.count),
        countries: Object.entries(countries).map(([k, v]) => ({ name: k, count: v })).sort((a, b) => b.count - a.count),
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});