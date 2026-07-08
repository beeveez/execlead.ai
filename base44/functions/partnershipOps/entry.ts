import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function calculateMatch(profile, listing) {
  let score = 40;
  const reasons = [];
  const missing = [];
  const recommendations = [];

  // --- Skills match (up to 30 pts) ---
  const userSkills = (profile?.skills || []).map(s => (s || "").toLowerCase());
  const requiredSkills = (listing.required_skills || []).map(s => (s || "").toLowerCase());
  if (requiredSkills.length > 0) {
    const matched = requiredSkills.filter(s => userSkills.includes(s));
    const missingSkills = requiredSkills.filter(s => !userSkills.includes(s));
    if (matched.length > 0) {
      score += Math.round((matched.length / requiredSkills.length) * 30);
      reasons.push(`${matched.length}/${requiredSkills.length} required skills match`);
    }
    if (missingSkills.length > 0) {
      missing.push(`${missingSkills.length} required skills not in profile`);
      recommendations.push(`Add ${missingSkills.slice(0, 3).join(", ")} to your profile skills`);
    }
  }

  // --- Industry alignment (up to 15 pts) ---
  if (profile?.industry && listing.industry) {
    if (profile.industry.toLowerCase() === listing.industry.toLowerCase()) {
      score += 15;
      reasons.push("Industry alignment");
    } else {
      missing.push("Different industry focus");
    }
  }

  // --- Experience match (up to 15 pts) ---
  const userExp = profile?.years_experience || 0;
  const reqExp = listing.required_experience_years || 0;
  if (reqExp > 0) {
    if (userExp >= reqExp) {
      score += 15;
      reasons.push("Meets experience requirements");
    } else if (userExp > 0) {
      score += Math.round((userExp / reqExp) * 10);
      missing.push(`${reqExp - userExp} years short of requirement`);
    } else {
      missing.push("Experience years not specified in profile");
    }
  }

  // --- Work model match (up to 10 pts) ---
  if (profile?.work_preference && listing.work_model) {
    if (profile.work_preference === listing.work_model) {
      score += 10;
      reasons.push("Work model alignment");
    } else if (listing.work_model === "remote") {
      score += 5;
      reasons.push("Remote-friendly opportunity");
    }
  }

  // --- Location match (up to 10 pts) ---
  if (profile?.country && listing.country) {
    if (profile.country.toLowerCase() === listing.country.toLowerCase()) {
      score += 10;
      reasons.push("Location match");
    } else if (listing.work_model === "remote") {
      score += 4;
    }
  }

  // --- Leadership competency alignment (up to 10 pts) ---
  const strongAreas = (profile?.strong_areas || []).map(s => (s || "").toLowerCase());
  const competencies = (listing.leadership_competencies || "").toLowerCase();
  if (strongAreas.length > 0 && competencies) {
    const matched = strongAreas.filter(a => competencies.includes(a));
    if (matched.length > 0) {
      score += 10;
      reasons.push("Leadership competency alignment");
    }
  }

  // --- Executive presence bonus (up to 5 pts) ---
  if ((profile?.executive_presence || 0) > 70) {
    score += 5;
    reasons.push("Strong executive presence");
  }

  score = Math.min(99, Math.max(0, Math.round(score)));

  let label = "Fair Match";
  if (score >= 85) label = "Excellent Match";
  else if (score >= 70) label = "Strong Match";
  else if (score >= 55) label = "Good Match";

  if (reasons.length === 0) reasons.push("Profile matches basic criteria");
  if (recommendations.length === 0 && score < 85) {
    recommendations.push("Complete your profile to improve match accuracy");
  }

  return { score, label, reasons, missing, recommendations };
}

function generateOpportunityId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PTN-${ts}-${rand}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // ----------------------------------------------------------
    // CALCULATE MATCH
    // ----------------------------------------------------------
    if (action === 'calculate_match') {
      const { listing_id } = body;
      if (!listing_id) return Response.json({ error: 'listing_id required' }, { status: 400 });

      const listing = await base44.asServiceRole.entities.PartnershipListing.get(listing_id);
      if (!listing) return Response.json({ error: 'Listing not found' }, { status: 404 });

      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: user.id });
      const profile = profiles[0] || {};

      const match = calculateMatch(profile, listing);
      return Response.json({ match });
    }

    // ----------------------------------------------------------
    // BULK MATCH — calculate match scores for multiple listings
    // ----------------------------------------------------------
    if (action === 'bulk_match') {
      const { listing_ids } = body;
      if (!listing_ids || !Array.isArray(listing_ids) || listing_ids.length === 0) {
        return Response.json({ matches: {} });
      }

      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: user.id });
      const profile = profiles[0] || {};

      const matches = {};
      for (const id of listing_ids) {
        try {
          const listing = await base44.asServiceRole.entities.PartnershipListing.get(id);
          if (listing) {
            matches[id] = calculateMatch(profile, listing);
          }
        } catch (e) {
          // skip missing
        }
      }
      return Response.json({ matches });
    }

    // ----------------------------------------------------------
    // EXPRESS INTEREST
    // ----------------------------------------------------------
    if (action === 'express_interest') {
      const { listing_id, message } = body;
      if (!listing_id) return Response.json({ error: 'listing_id required' }, { status: 400 });

      const listing = await base44.asServiceRole.entities.PartnershipListing.get(listing_id);
      if (!listing) return Response.json({ error: 'Listing not found' }, { status: 404 });
      if (listing.status !== 'open') return Response.json({ error: 'This listing is no longer accepting applications' }, { status: 400 });

      // Check existing interest
      const existing = await base44.asServiceRole.entities.ExecutiveInterest.filter({
        listing_id, user_id: user.id
      });
      if (existing.length > 0) {
        return Response.json({ error: 'You have already expressed interest in this opportunity', already_interested: true }, { status: 409 });
      }

      // Get user profile
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: user.id });
      const profile = profiles[0] || {};

      // Calculate match
      const match = calculateMatch(profile, listing);

      // Create interest record
      const interest = await base44.asServiceRole.entities.ExecutiveInterest.create({
        listing_id,
        listing_title: listing.title,
        user_id: user.id,
        user_name: user.full_name || profile?.full_name || 'Executive',
        user_email: user.email,
        user_photo: profile?.profile_photo || '',
        user_headline: profile?.professional_headline || profile?.current_role || '',
        match_score: match.score,
        match_reasons_json: JSON.stringify({ reasons: match.reasons, missing: match.missing }),
        status: 'pending',
        message: message || '',
        partner_organization_name: listing.partner_organization_name || '',
        partner_user_id: listing.posted_by_id || ''
      });

      // Update listing interest count
      await base44.asServiceRole.entities.PartnershipListing.update(listing_id, {
        interest_count: (listing.interest_count || 0) + 1
      });

      // Notify partner
      if (listing.posted_by_id) {
        await base44.asServiceRole.entities.Notification.create({
          type: 'social',
          title: 'New Executive Interest',
          message: `${user.full_name || 'An executive'} expressed interest in "${listing.title}" (Match: ${match.score}%)`,
          user_id: listing.posted_by_id,
          workspace: 'executive',
          visibility: 'private',
          severity: 'info',
          action_url: '/partner-portal'
        });
      }

      return Response.json({ success: true, interest, match });
    }

    // ----------------------------------------------------------
    // WITHDRAW INTEREST
    // ----------------------------------------------------------
    if (action === 'withdraw_interest') {
      const { listing_id } = body;
      if (!listing_id) return Response.json({ error: 'listing_id required' }, { status: 400 });

      const interests = await base44.asServiceRole.entities.ExecutiveInterest.filter({
        listing_id, user_id: user.id
      });
      if (interests.length === 0) {
        return Response.json({ error: 'No interest found' }, { status: 404 });
      }

      await base44.asServiceRole.entities.ExecutiveInterest.update(interests[0].id, {
        status: 'withdrawn'
      });

      // Decrement listing count
      const listing = await base44.asServiceRole.entities.PartnershipListing.get(listing_id);
      if (listing) {
        await base44.asServiceRole.entities.PartnershipListing.update(listing_id, {
          interest_count: Math.max(0, (listing.interest_count || 0) - 1)
        });
      }

      return Response.json({ success: true });
    }

    // ----------------------------------------------------------
    // CREATE LISTING
    // ----------------------------------------------------------
    if (action === 'create_listing') {
      const data = body.listing || {};
      const listing = await base44.asServiceRole.entities.PartnershipListing.create({
        ...data,
        opportunity_id: generateOpportunityId(),
        posted_by_name: user.full_name || 'Partner',
        posted_by_id: user.id,
        views_count: 0,
        interest_count: 0
      });
      return Response.json({ success: true, listing });
    }

    // ----------------------------------------------------------
    // UPDATE LISTING
    // ----------------------------------------------------------
    if (action === 'update_listing') {
      const { listing_id, updates } = body;
      if (!listing_id) return Response.json({ error: 'listing_id required' }, { status: 400 });

      const listing = await base44.asServiceRole.entities.PartnershipListing.get(listing_id);
      if (!listing) return Response.json({ error: 'Listing not found' }, { status: 404 });
      if (listing.posted_by_id !== user.id) {
        return Response.json({ error: 'Only the listing owner can update this listing' }, { status: 403 });
      }

      const updated = await base44.asServiceRole.entities.PartnershipListing.update(listing_id, updates);
      return Response.json({ success: true, listing: updated });
    }

    // ----------------------------------------------------------
    // GET PARTNER ANALYTICS
    // ----------------------------------------------------------
    if (action === 'get_partner_analytics') {
      const listings = await base44.asServiceRole.entities.PartnershipListing.filter({
        posted_by_id: user.id
      }, '-created_date', 100);

      const interests = await base44.asServiceRole.entities.ExecutiveInterest.filter({
        partner_user_id: user.id
      }, '-created_date', 200);

      const activeListings = listings.filter(l => l.status === 'open').length;
      const totalViews = listings.reduce((sum, l) => sum + (l.views_count || 0), 0);
      const totalInterests = interests.length;
      const accepted = interests.filter(i => i.status === 'accepted' || i.status === 'meeting_scheduled').length;
      const conversionRate = totalInterests > 0 ? Math.round((accepted / totalInterests) * 100) : 0;
      const pendingInterests = interests.filter(i => i.status === 'pending').length;

      return Response.json({
        listings,
        interests,
        metrics: {
          total_listings: listings.length,
          active_listings: activeListings,
          total_views: totalViews,
          total_interests: totalInterests,
          pending_interests: pendingInterests,
          accepted_interests: accepted,
          conversion_rate: conversionRate,
        }
      });
    }

    // ----------------------------------------------------------
    // INCREMENT VIEW
    // ----------------------------------------------------------
    if (action === 'increment_view') {
      const { listing_id } = body;
      if (!listing_id) return Response.json({ error: 'listing_id required' }, { status: 400 });

      const listing = await base44.asServiceRole.entities.PartnershipListing.get(listing_id);
      if (!listing) return Response.json({ error: 'Listing not found' }, { status: 404 });

      await base44.asServiceRole.entities.PartnershipListing.update(listing_id, {
        views_count: (listing.views_count || 0) + 1
      });

      return Response.json({ success: true });
    }

    // ----------------------------------------------------------
    // UPDATE INTEREST STATUS (partner accepts/rejects/schedules)
    // ----------------------------------------------------------
    if (action === 'update_interest') {
      const { interest_id, status } = body;
      if (!interest_id || !status) return Response.json({ error: 'interest_id and status required' }, { status: 400 });

      const interest = await base44.asServiceRole.entities.ExecutiveInterest.get(interest_id);
      if (!interest) return Response.json({ error: 'Interest not found' }, { status: 404 });

      // Only the listing owner (partner) can update interest status
      if (interest.partner_user_id !== user.id) {
        return Response.json({ error: 'Only the listing owner can update interest status' }, { status: 403 });
      }

      const updated = await base44.asServiceRole.entities.ExecutiveInterest.update(interest_id, { status });
      return Response.json({ success: true, interest: updated });
    }

    // ----------------------------------------------------------
    // GET USER INTERESTS
    // ----------------------------------------------------------
    if (action === 'get_user_interests') {
      const interests = await base44.asServiceRole.entities.ExecutiveInterest.filter({
        user_id: user.id
      }, '-created_date', 100);
      return Response.json({ interests });
    }

    return Response.json({ error: 'Unknown action: ' + action }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});