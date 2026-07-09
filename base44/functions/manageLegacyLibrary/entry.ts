import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const action = body.action;

    // ─── Helper: Log audit entry ───────────────────────────
    async function logAudit(letterId, letterTitle, actionType, user, details, prevStatus, newStatus) {
      try {
        await base44.asServiceRole.entities.LegacyAuditLog.create({
          letter_id: letterId,
          letter_title: letterTitle || '',
          action: actionType,
          user_id: user.id,
          user_name: user.full_name || '',
          user_role: user.role === 'admin' ? 'admin' : 'author',
          details_json: JSON.stringify(details || {}),
          previous_status: prevStatus || '',
          new_status: newStatus || '',
          timestamp: new Date().toISOString(),
        });
      } catch (e) {}
    }

    // ─── Helper: Get user profile ──────────────────────────
    async function getUserProfile(userId) {
      try {
        const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: userId });
        return profiles[0] || {};
      } catch (e) { return {}; }
    }

    // ─── Helper: Check founder status ──────────────────────
    async function getFounderInfo(userId) {
      try {
        const waitlist = await base44.asServiceRole.entities.FoundingWaitlist.filter({ user_id: userId });
        const founder = waitlist.find(w => w.status !== 'cancelled' && w.status !== 'declined');
        if (founder) return { number: founder.founding_member_number, isFounder: true };
      } catch (e) {}
      return { number: '', isFounder: false };
    }

    // ─── Helper: Generate slug ─────────────────────────────
    function slugify(text) {
      return (text || '').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 80);
    }

    // ─── CREATE ────────────────────────────────────────────
    if (action === 'create') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const profile = await getUserProfile(user.id);
      const founder = await getFounderInfo(user.id);

      const letter = await base44.asServiceRole.entities.LeadershipLetter.create({
        author_user_id: user.id,
        author_name: body.author_name || profile.full_name || user.full_name || '',
        author_photo: profile.avatar_url || '',
        author_headline: body.author_position || profile.profession || '',
        author_founder_number: founder.number,
        author_is_founder: founder.isFounder,
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
        status: 'draft',
        tags: body.tags || [],
        views: 0, likes: 0, bookmarks: 0, comments_count: 0, shares: 0,
        version_number: 1,
        review_round: 0,
        revision_count: 0,
      });

      await logAudit(letter.id, letter.title, 'created', user, { category: letter.category }, '', 'draft');
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
      if (letter.locked) {
        return Response.json({ error: 'Letter is locked — revision requested. Use the revision flow.' }, { status: 400 });
      }
      if (letter.status === 'published') {
        return Response.json({ error: 'Published letters cannot be edited' }, { status: 400 });
      }

      const updates = { ...body.fields };
      const updated = await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, updates);
      await logAudit(letter.id, letter.title, 'updated', user, { fields: Object.keys(updates) }, letter.status, letter.status);
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

    // ═══════════════════════════════════════════════════════
    // ─── MODERATION WORKFLOW ───────────────────────────────
    // ═══════════════════════════════════════════════════════

    // ─── SUBMIT FOR REVIEW ─────────────────────────────────
    if (action === 'submit_for_review') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: body.letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Not found' }, { status: 404 });
      if (letter.author_user_id !== user.id && user.role !== 'admin') {
        return Response.json({ error: 'Only the author can submit' }, { status: 403 });
      }
      if (letter.status !== 'draft' && letter.status !== 'revision_requested') {
        return Response.json({ error: 'Only drafts or revision-requested letters can be submitted' }, { status: 400 });
      }

      const prevStatus = letter.status;
      const now = new Date().toISOString();
      const newRound = letter.status === 'revision_requested' ? (letter.review_round || 0) + 1 : (letter.review_round || 0);

      await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, {
        status: 'pending_ai_review',
        locked: true,
        submitted_at: now,
        review_round: newRound,
        revision_notes: '',
      });

      await logAudit(letter.id, letter.title, 'submitted', user, { round: newRound }, prevStatus, 'pending_ai_review');

      // Auto-run AI review
      try {
        const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are an AI content moderation system for an executive leadership library. Evaluate this leadership letter submission across multiple dimensions.

Title: ${letter.title}
Category: ${letter.category}
Author: ${letter.author_name} (${letter.author_position || 'Unknown position'}, ${letter.organization || 'Unknown org'})
Message: ${letter.message}
Key Lessons: ${(letter.key_lessons || []).join(', ')}
Advice: ${letter.advice || 'N/A'}

Evaluate and score (0-100) across these dimensions:
1. grammar_score: Grammar, spelling, punctuation quality
2. tone_score: Professional, executive-appropriate tone
3. leadership_value_score: Genuine leadership insight and value to readers
4. originality_score: Original content (not generic/cliché)
5. risk_score: Risk level (0=safe, 100=high risk) — check for hate speech, spam, confidential info, plagiarism signals, sensitive personal info

Also provide:
- overall_score: Weighted average (0-100)
- recommendation: "approve" if overall >= 70 and risk <= 30, "needs_review" if overall >= 50 or risk <= 50, "reject" if overall < 50 or risk > 50
- suggested_tags: 3-5 relevant tag strings
- flags: object with boolean fields { toxicity, spam, plagiarism, sensitive_info, copyright_concern }
- executive_summary: 2-3 sentence summary of the letter's core message
- reading_time_minutes: estimated reading time
- review_notes: brief explanation of the scores and recommendation`,
          response_json_schema: {
            type: 'object',
            properties: {
              grammar_score: { type: 'number' },
              tone_score: { type: 'number' },
              leadership_value_score: { type: 'number' },
              originality_score: { type: 'number' },
              risk_score: { type: 'number' },
              overall_score: { type: 'number' },
              recommendation: { type: 'string', enum: ['approve', 'needs_review', 'reject'] },
              suggested_tags: { type: 'array', items: { type: 'string' } },
              flags: {
                type: 'object',
                properties: {
                  toxicity: { type: 'boolean' },
                  spam: { type: 'boolean' },
                  plagiarism: { type: 'boolean' },
                  sensitive_info: { type: 'boolean' },
                  copyright_concern: { type: 'boolean' },
                },
              },
              executive_summary: { type: 'string' },
              reading_time_minutes: { type: 'number' },
              review_notes: { type: 'string' },
            },
          },
        });

        const aiUpdates = {
          ai_moderation_score: result.overall_score || 0,
          ai_grammar_score: result.grammar_score || 0,
          ai_tone_score: result.tone_score || 0,
          ai_leadership_value_score: result.leadership_value_score || 0,
          ai_originality_score: result.originality_score || 0,
          ai_risk_score: result.risk_score || 0,
          ai_recommendation: result.recommendation || 'needs_review',
          ai_suggested_tags: result.suggested_tags || [],
          ai_reviewed_at: now,
          ai_review_json: JSON.stringify(result),
          ai_flags_json: JSON.stringify(result.flags || {}),
          ai_summary: result.executive_summary || letter.ai_summary || '',
          ai_reading_time_minutes: result.reading_time_minutes || 5,
          status: 'pending_human_review',
        };

        const updated = await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, aiUpdates);
        await logAudit(letter.id, letter.title, 'ai_reviewed', user, {
          score: result.overall_score,
          recommendation: result.recommendation,
          flags: result.flags,
        }, 'pending_ai_review', 'pending_human_review');

        return Response.json({ success: true, letter: updated, ai_review: result });
      } catch (aiError) {
        // AI review failed — still move to human review so it's not stuck
        const updated = await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, { status: 'pending_human_review', ai_reviewed_at: now });
        return Response.json({ success: true, letter: updated, ai_review: null, ai_error: aiError.message });
      }
    }

    // ─── RE-RUN AI REVIEW ──────────────────────────────────
    if (action === 'run_ai_review') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: body.letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Not found' }, { status: 404 });

      const now = new Date().toISOString();
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an AI content moderation system for an executive leadership library. Evaluate this leadership letter submission across multiple dimensions.

Title: ${letter.title}
Category: ${letter.category}
Author: ${letter.author_name} (${letter.author_position || 'Unknown position'}, ${letter.organization || 'Unknown org'})
Message: ${letter.message}
Key Lessons: ${(letter.key_lessons || []).join(', ')}
Advice: ${letter.advice || 'N/A'}

Evaluate and score (0-100) across these dimensions:
1. grammar_score: Grammar, spelling, punctuation quality
2. tone_score: Professional, executive-appropriate tone
3. leadership_value_score: Genuine leadership insight and value to readers
4. originality_score: Original content (not generic/cliché)
5. risk_score: Risk level (0=safe, 100=high risk)

Also provide: overall_score, recommendation (approve/needs_review/reject), suggested_tags, flags {toxicity, spam, plagiarism, sensitive_info, copyright_concern}, executive_summary, reading_time_minutes, review_notes.`,
        response_json_schema: {
          type: 'object',
          properties: {
            grammar_score: { type: 'number' },
            tone_score: { type: 'number' },
            leadership_value_score: { type: 'number' },
            originality_score: { type: 'number' },
            risk_score: { type: 'number' },
            overall_score: { type: 'number' },
            recommendation: { type: 'string', enum: ['approve', 'needs_review', 'reject'] },
            suggested_tags: { type: 'array', items: { type: 'string' } },
            flags: {
              type: 'object',
              properties: {
                toxicity: { type: 'boolean' },
                spam: { type: 'boolean' },
                plagiarism: { type: 'boolean' },
                sensitive_info: { type: 'boolean' },
                copyright_concern: { type: 'boolean' },
              },
            },
            executive_summary: { type: 'string' },
            reading_time_minutes: { type: 'number' },
            review_notes: { type: 'string' },
          },
        },
      });

      const aiUpdates = {
        ai_moderation_score: result.overall_score || 0,
        ai_grammar_score: result.grammar_score || 0,
        ai_tone_score: result.tone_score || 0,
        ai_leadership_value_score: result.leadership_value_score || 0,
        ai_originality_score: result.originality_score || 0,
        ai_risk_score: result.risk_score || 0,
        ai_recommendation: result.recommendation || 'needs_review',
        ai_suggested_tags: result.suggested_tags || [],
        ai_reviewed_at: now,
        ai_review_json: JSON.stringify(result),
        ai_flags_json: JSON.stringify(result.flags || {}),
        ai_summary: result.executive_summary || letter.ai_summary || '',
        ai_reading_time_minutes: result.reading_time_minutes || 5,
      };

      const updated = await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, aiUpdates);
      await logAudit(letter.id, letter.title, 'ai_reviewed', user, { score: result.overall_score, recommendation: result.recommendation }, letter.status, letter.status);
      return Response.json({ success: true, letter: updated, ai_review: result });
    }

    // ─── APPROVE ───────────────────────────────────────────
    if (action === 'approve') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: body.letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Not found' }, { status: 404 });

      const now = new Date().toISOString();
      const slug = slugify(letter.title);
      const pubDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const citation = `${letter.author_name}. "${letter.title}" EXECLEAD.AI Leadership Legacy Library. ${pubDate}.`;

      const updates = {
        status: 'published',
        published_at: now,
        approved_by_id: user.id,
        approved_by_name: user.full_name,
        reviewed_at: now,
        reviewed_by_id: user.id,
        reviewed_by_name: user.full_name,
        publication_url: slug,
        seo_title: letter.title,
        seo_description: (letter.ai_summary || letter.message || '').substring(0, 160),
        seo_keywords: letter.ai_suggested_tags || letter.tags || [],
        executive_citation: citation,
        featured: body.feature ? true : letter.featured,
        featured_types: body.feature ? (letter.featured_types || []).concat(['featured']) : (letter.featured_types || []),
        scheduled_publish_at: body.scheduled_at || null,
      };

      const updated = await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, updates);
      await logAudit(letter.id, letter.title, 'approved', user, { featured: !!body.feature, scheduled: !!body.scheduled_at }, letter.status, 'published');
      await logAudit(letter.id, letter.title, 'published', user, { publication_url: slug }, 'pending_human_review', 'published');
      return Response.json({ success: true, letter: updated });
    }

    // ─── REQUEST REVISION ──────────────────────────────────
    if (action === 'request_revision') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: body.letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Not found' }, { status: 404 });

      const now = new Date().toISOString();
      const prevStatus = letter.status;
      const updated = await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, {
        status: 'revision_requested',
        revision_notes: body.revision_notes || '',
        revision_requested_at: now,
        revision_count: (letter.revision_count || 0) + 1,
        reviewed_at: now,
        reviewed_by_id: user.id,
        reviewed_by_name: user.full_name,
        locked: false,
      });

      await logAudit(letter.id, letter.title, 'revision_requested', user, { notes: body.revision_notes, round: (letter.revision_count || 0) + 1 }, prevStatus, 'revision_requested');

      // Notify author
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: '', // will be filled by user lookup if needed
          subject: 'Your Leadership Letter Requires Revisions',
          body: `Your submission "${letter.title}" has been reviewed and requires revisions.\n\nReviewer Comments:\n${body.revision_notes || 'No additional notes.'}\n\nPlease log in to EXECLEAD.AI, edit your letter, and resubmit for review.`,
        });
      } catch (e) {}

      return Response.json({ success: true, letter: updated });
    }

    // ─── REJECT ────────────────────────────────────────────
    if (action === 'reject') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: body.letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Not found' }, { status: 404 });

      const now = new Date().toISOString();
      const prevStatus = letter.status;
      const updated = await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, {
        status: 'rejected',
        rejection_reason: body.reason || 'other',
        rejection_comments: body.comments || '',
        rejected_at: now,
        rejected_by_id: user.id,
        rejected_by_name: user.full_name,
        reviewed_at: now,
        reviewed_by_id: user.id,
        reviewed_by_name: user.full_name,
      });

      await logAudit(letter.id, letter.title, 'rejected', user, { reason: body.reason, comments: body.comments }, prevStatus, 'rejected');
      return Response.json({ success: true, letter: updated });
    }

    // ─── ARCHIVE ───────────────────────────────────────────
    if (action === 'archive') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: body.letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Not found' }, { status: 404 });

      const prevStatus = letter.status;
      const updated = await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, { status: 'archived' });
      await logAudit(letter.id, letter.title, 'archived', user, {}, prevStatus, 'archived');
      return Response.json({ success: true, letter: updated });
    }

    // ─── RESTORE ───────────────────────────────────────────
    if (action === 'restore') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: body.letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Not found' }, { status: 404 });

      const prevStatus = letter.status;
      const newStatus = letter.published_at ? 'published' : 'pending_human_review';
      const updated = await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, { status: newStatus });
      await logAudit(letter.id, letter.title, 'restored', user, {}, prevStatus, newStatus);
      return Response.json({ success: true, letter: updated });
    }

    // ─── FEATURE / UNFEATURE ───────────────────────────────
    if (action === 'feature') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: body.letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Not found' }, { status: 404 });

      const currentTypes = letter.featured_types || [];
      let newTypes;
      if (currentTypes.includes(body.feature_type || 'featured')) {
        newTypes = currentTypes.filter(t => t !== (body.feature_type || 'featured'));
      } else {
        newTypes = [...currentTypes, body.feature_type || 'featured'];
      }

      const updated = await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, {
        featured: newTypes.length > 0,
        featured_types: newTypes,
      });

      await logAudit(letter.id, letter.title, newTypes.length > 0 ? 'featured' : 'unfeatured', user, { type: body.feature_type || 'featured' }, letter.status, letter.status);
      return Response.json({ success: true, letter: updated });
    }

    // ─── ASSIGN REVIEWER ───────────────────────────────────
    if (action === 'assign_reviewer') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: body.letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Not found' }, { status: 404 });

      const updated = await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, {
        assigned_reviewer_id: body.reviewer_id || '',
        assigned_reviewer_name: body.reviewer_name || '',
      });

      await logAudit(letter.id, letter.title, 'assigned_reviewer', user, { reviewer: body.reviewer_name }, letter.status, letter.status);
      return Response.json({ success: true, letter: updated });
    }

    // ─── SAVE MODERATOR NOTES ──────────────────────────────
    if (action === 'save_review_notes') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: body.letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Not found' }, { status: 404 });

      const updated = await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, { moderator_notes: body.notes || '' });
      await logAudit(letter.id, letter.title, 'notes_saved', user, {}, letter.status, letter.status);
      return Response.json({ success: true, letter: updated });
    }

    // ─── SAVE CHECKLIST ────────────────────────────────────
    if (action === 'save_checklist') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: body.letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Not found' }, { status: 404 });

      const updated = await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, { review_checklist_json: JSON.stringify(body.checklist || {}) });
      await logAudit(letter.id, letter.title, 'checklist_saved', user, {}, letter.status, letter.status);
      return Response.json({ success: true, letter: updated });
    }

    // ─── DETECT DUPLICATES ─────────────────────────────────
    if (action === 'detect_duplicates') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: body.letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Not found' }, { status: 404 });

      // Find potential duplicates by title similarity
      const all = await base44.asServiceRole.entities.LeadershipLetter.list('-created_date', 500);
      const titleLower = letter.title.toLowerCase();
      const messageStart = (letter.message || '').substring(0, 200).toLowerCase();

      const duplicates = all
        .filter(l => l.id !== letter.id)
        .map(l => {
          let score = 0;
          const lTitle = (l.title || '').toLowerCase();
          const lMessage = (l.message || '').substring(0, 200).toLowerCase();
          if (lTitle === titleLower) score += 60;
          else if (lTitle.includes(titleLower) || titleLower.includes(lTitle)) score += 40;
          if (lMessage === messageStart && messageStart.length > 50) score += 40;
          else if (lMessage.includes(messageStart.substring(0, 100)) && messageStart.length > 50) score += 25;
          if (l.author_user_id === letter.author_user_id) score += 10;
          return { letter: l, score };
        })
        .filter(d => d.score > 20)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      return Response.json({ success: true, duplicates });
    }

    // ─── REPORT CONTENT ────────────────────────────────────
    if (action === 'report') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: body.letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Not found' }, { status: 404 });

      const report = await base44.asServiceRole.entities.LetterReport.create({
        letter_id: body.letter_id,
        letter_title: letter.title,
        reporter_id: user.id,
        reporter_name: user.full_name || '',
        report_type: body.report_type || 'other',
        reason: body.reason || '',
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      await logAudit(letter.id, letter.title, 'report_filed', user, { report_type: body.report_type, report_id: report.id }, letter.status, letter.status);
      return Response.json({ success: true, report });
    }

    // ─── ADMIN: LIST REPORTS ───────────────────────────────
    if (action === 'admin_reports') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const status = body.status || 'pending';
      const reports = await base44.asServiceRole.entities.LetterReport.filter({ status }, '-created_date', 100);
      return Response.json({ reports });
    }

    // ─── RESOLVE REPORT ────────────────────────────────────
    if (action === 'resolve_report') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const reports = await base44.asServiceRole.entities.LetterReport.filter({ id: body.report_id });
      const report = reports[0];
      if (!report) return Response.json({ error: 'Report not found' }, { status: 404 });

      const updated = await base44.asServiceRole.entities.LetterReport.update(report.id, {
        status: body.resolution === 'dismiss' ? 'dismissed' : 'resolved',
        resolved_by_id: user.id,
        resolved_by_name: user.full_name,
        resolution_notes: body.notes || '',
        resolved_at: new Date().toISOString(),
      });

      if (report.letter_id) {
        const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: report.letter_id });
        if (letters[0]) {
          await logAudit(letters[0].id, letters[0].title, 'report_resolved', user, { report_id: report.id, resolution: body.resolution }, letters[0].status, letters[0].status);
        }
      }

      return Response.json({ success: true, report: updated });
    }

    // ─── AUDIT LOG ─────────────────────────────────────────
    if (action === 'audit_log') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      let logs;
      if (body.letter_id) {
        logs = await base44.asServiceRole.entities.LegacyAuditLog.filter({ letter_id: body.letter_id }, '-timestamp', 200);
      } else {
        logs = await base44.asServiceRole.entities.LegacyAuditLog.list('-timestamp', 200);
      }
      return Response.json({ logs });
    }

    // ─── ADMIN: LIST ───────────────────────────────────────
    if (action === 'admin_list') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const status = body.status;
      let letters;
      if (status === 'all') {
        letters = await base44.asServiceRole.entities.LeadershipLetter.list('-created_date', 200);
      } else if (status === 'pending_review') {
        // Legacy alias — show both pending_human_review and pending_ai_review
        const ai = await base44.asServiceRole.entities.LeadershipLetter.filter({ status: 'pending_ai_review' }, '-created_date', 100);
        const human = await base44.asServiceRole.entities.LeadershipLetter.filter({ status: 'pending_human_review' }, '-created_date', 100);
        letters = [...human, ...ai];
      } else {
        letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ status }, '-created_date', 100);
      }

      // Apply optional filters
      if (body.search) {
        const q = body.search.toLowerCase();
        letters = letters.filter(l =>
          (l.title || '').toLowerCase().includes(q) ||
          (l.author_name || '').toLowerCase().includes(q) ||
          (l.category || '').toLowerCase().includes(q)
        );
      }

      return Response.json({ letters });
    }

    // ─── ADMIN: ACTION (legacy compat) ─────────────────────
    if (action === 'admin_action') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const { letter_id, admin_action } = body;
      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Not found' }, { status: 404 });

      if (admin_action === 'approve') {
        const now = new Date().toISOString();
        const slug = slugify(letter.title);
        const citation = `${letter.author_name}. "${letter.title}" EXECLEAD.AI Leadership Legacy Library. ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`;
        const updated = await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, {
          status: 'published', published_at: now, approved_by_id: user.id, approved_by_name: user.full_name,
          reviewed_at: now, reviewed_by_id: user.id, reviewed_by_name: user.full_name,
          publication_url: slug, seo_title: letter.title, seo_description: (letter.ai_summary || letter.message || '').substring(0, 160),
          executive_citation: citation,
        });
        await logAudit(letter.id, letter.title, 'approved', user, {}, letter.status, 'published');
        return Response.json({ success: true, letter: updated });
      } else if (admin_action === 'reject') {
        return Response.json({ success: false, error: 'Use reject action with reason' }, { status: 400 });
      } else if (admin_action === 'feature') {
        const updated = await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, { featured: true, featured_types: [...(letter.featured_types || []), 'featured'] });
        await logAudit(letter.id, letter.title, 'featured', user, { type: 'featured' }, letter.status, letter.status);
        return Response.json({ success: true, letter: updated });
      } else if (admin_action === 'unfeature') {
        const updated = await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, { featured: false, featured_types: [] });
        await logAudit(letter.id, letter.title, 'unfeatured', user, {}, letter.status, letter.status);
        return Response.json({ success: true, letter: updated });
      } else if (admin_action === 'archive') {
        const updated = await base44.asServiceRole.entities.LeadershipLetter.update(letter.id, { status: 'archived' });
        await logAudit(letter.id, letter.title, 'archived', user, {}, letter.status, 'archived');
        return Response.json({ success: true, letter: updated });
      }
      return Response.json({ error: 'Unknown admin action' }, { status: 400 });
    }

    // ─── ANALYTICS ─────────────────────────────────────────
    if (action === 'analytics') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const all = await base44.asServiceRole.entities.LeadershipLetter.list('-created_date', 1000);

      const published = all.filter(l => l.status === 'published');
      const pendingAi = all.filter(l => l.status === 'pending_ai_review');
      const pendingHuman = all.filter(l => l.status === 'pending_human_review');
      const revisionRequested = all.filter(l => l.status === 'revision_requested');
      const rejected = all.filter(l => l.status === 'rejected');
      const drafts = all.filter(l => l.status === 'draft');
      const featured = all.filter(l => l.featured);

      const totalViews = published.reduce((s, l) => s + (l.views || 0), 0);
      const totalLikes = published.reduce((s, l) => s + (l.likes || 0), 0);
      const totalBookmarks = published.reduce((s, l) => s + (l.bookmarks || 0), 0);
      const totalComments = published.reduce((s, l) => s + (l.comments_count || 0), 0);
      const totalShares = published.reduce((s, l) => s + (l.shares || 0), 0);

      // Moderation metrics
      const reviewed = all.filter(l => l.ai_reviewed_at);
      const aiApproved = reviewed.filter(l => l.ai_recommendation === 'approve');
      const aiRejected = reviewed.filter(l => l.ai_recommendation === 'reject');
      const humanApproved = all.filter(l => l.status === 'published' && l.approved_by_id);
      const humanRejected = all.filter(l => l.status === 'rejected');

      // Average review time (submitted_at to published_at)
      const reviewTimes = published
        .filter(l => l.submitted_at && l.published_at)
        .map(l => new Date(l.published_at) - new Date(l.submitted_at));
      const avgReviewMs = reviewTimes.length > 0 ? reviewTimes.reduce((s, t) => s + t, 0) / reviewTimes.length : 0;
      const avgReviewHours = Math.round(avgReviewMs / (1000 * 60 * 60) * 10) / 10;

      // Top authors
      const authorMap = {};
      published.forEach(l => {
        if (!l.author_name) return;
        if (!authorMap[l.author_name]) authorMap[l.author_name] = { name: l.author_name, letters: 0, views: 0 };
        authorMap[l.author_name].letters++;
        authorMap[l.author_name].views += (l.views || 0);
      });
      const topAuthors = Object.values(authorMap).sort((a, b) => b.views - a.views).slice(0, 10);

      // Most viewed
      const mostViewed = [...published].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

      // Industries & countries
      const industries = {};
      published.forEach(l => { if (l.industry) industries[l.industry] = (industries[l.industry] || 0) + 1; });
      const countries = {};
      published.forEach(l => { if (l.country) countries[l.country] = (countries[l.country] || 0) + 1; });

      // Categories
      const categories = {};
      published.forEach(l => { if (l.category) categories[l.category] = (categories[l.category] || 0) + 1; });

      return Response.json({
        total_letters: all.length,
        published: published.length,
        pending_ai_review: pendingAi.length,
        pending_human_review: pendingHuman.length,
        pending_review: pendingAi.length + pendingHuman.length,
        revision_requested: revisionRequested.length,
        rejected: rejected.length,
        drafts: drafts.length,
        featured: featured.length,
        total_views: totalViews,
        total_likes: totalLikes,
        total_bookmarks: totalBookmarks,
        total_comments: totalComments,
        total_shares: totalShares,
        ai_approval_rate: reviewed.length > 0 ? Math.round((aiApproved.length / reviewed.length) * 100) : 0,
        human_approval_rate: (humanApproved.length + humanRejected.length) > 0 ? Math.round((humanApproved.length / (humanApproved.length + humanRejected.length)) * 100) : 0,
        avg_review_hours: avgReviewHours,
        top_authors: topAuthors,
        most_viewed: mostViewed.map(l => ({ id: l.id, title: l.title, author: l.author_name, views: l.views })),
        industries: Object.entries(industries).map(([k, v]) => ({ name: k, count: v })).sort((a, b) => b.count - a.count),
        countries: Object.entries(countries).map(([k, v]) => ({ name: k, count: v })).sort((a, b) => b.count - a.count),
        categories: Object.entries(categories).map(([k, v]) => ({ name: k, count: v })).sort((a, b) => b.count - a.count),
      });
    }

    // ─── DELETE (admin) ────────────────────────────────────
    if (action === 'delete') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ id: body.letter_id });
      const letter = letters[0];
      if (!letter) return Response.json({ error: 'Not found' }, { status: 404 });

      const prevStatus = letter.status;
      await base44.asServiceRole.entities.LeadershipLetter.delete(letter.id);
      // Clean up related data
      try { await base44.asServiceRole.entities.LetterComment.deleteMany({ letter_id: letter.id }); } catch (e) {}
      try { await base44.asServiceRole.entities.LetterInteraction.deleteMany({ letter_id: letter.id }); } catch (e) {}
      try { await base44.asServiceRole.entities.LetterReport.deleteMany({ letter_id: letter.id }); } catch (e) {}

      await logAudit(letter.id, letter.title, 'deleted', user, { reason: body.reason || '' }, prevStatus, 'deleted');
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});