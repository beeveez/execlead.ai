import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ============================================================
// Executive Talent Marketplace — AI Match Score Engine
// Analyzes the match between a candidate (resume, leadership DNA,
// profile, career goals) and a specific job listing.
// Returns: match_score, match_reasons, missing_qualifications,
// interview_probability, salary_alignment, recommendation.
// ============================================================

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { jobId } = body;
    if (!jobId) return Response.json({ error: 'jobId is required' }, { status: 400 });

    // Fetch the job
    const job = await base44.entities.CareerOpportunity.get(jobId);
    if (!job) return Response.json({ error: 'Job not found' }, { status: 404 });

    // Fetch user profile
    let profile = null;
    try {
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: user.id });
      profile = profiles.length > 0 ? profiles[0] : null;
    } catch (e) {}

    // Fetch latest resume
    let resumeData = null;
    try {
      const resumes = await base44.entities.ResumeVersion.list('-created_date', 1);
      if (resumes.length > 0 && resumes[0].extracted_data) {
        try { resumeData = JSON.parse(resumes[0].extracted_data); } catch (e) {}
      }
    } catch (e) {}

    // Fetch leadership DNA
    let leadershipDNA = null;
    try {
      const dnaRecords = await base44.entities.LeadershipDNA.filter({ created_by_id: user.id });
      leadershipDNA = dnaRecords.length > 0 ? dnaRecords[0] : null;
    } catch (e) {}

    // Fetch challenge results for performance scores
    let perfScores = null;
    try {
      const results = await base44.entities.ChallengeResult.list('-created_date', 5);
      if (results.length > 0) {
        perfScores = {
          executive: Math.round(results.reduce((a, r) => a + (r.executive_score || 0), 0) / results.length),
          leadership: Math.round(results.reduce((a, r) => a + (r.leadership_score || 0), 0) / results.length),
          commercial: Math.round(results.reduce((a, r) => a + (r.commercial_score || 0), 0) / results.length),
          communication: Math.round(results.reduce((a, r) => a + (r.communication_score || 0), 0) / results.length),
        };
      }
    } catch (e) {}

    // Build the candidate context
    const candidateContext = [
      'CANDIDATE PROFILE:',
      '- Current Role: ' + (profile?.current_role || 'N/A'),
      '- Current Company: ' + (profile?.current_company || 'N/A'),
      '- Industry: ' + (profile?.industry || 'N/A'),
      '- Years of Experience: ' + (profile?.years_experience || 'N/A'),
      '- Skills: ' + ((profile?.skills || []).join(', ') || 'N/A'),
      '- Target Role: ' + (profile?.target_role || 'N/A'),
      '- Target Country: ' + (profile?.target_country || 'N/A'),
      '- Expected Salary: ' + (profile?.expected_salary ? '$' + profile.expected_salary : 'N/A'),
      '- Work Preference: ' + (profile?.work_preference || 'N/A'),
      '- Career Goals: ' + (profile?.career_goals || 'N/A'),
      '- Leadership Experience: ' + (profile?.leadership_experience || 'N/A'),
    ];

    if (resumeData) {
      candidateContext.push(
        '',
        'RESUME DATA:',
        '- Executive Readiness Score: ' + (resumeData.executive_readiness_score || 0) + '/100',
        '- Skills: ' + ((resumeData.skills || []).join(', ') || 'N/A'),
        '- Career History: ' + ((resumeData.career_history || []).map(h => (h.job_title || '') + ' at ' + (h.employer || '')).join('; ')),
        '- Certifications: ' + ((resumeData.certifications || []).map(c => typeof c === 'string' ? c : (c.name || '')).join(', ') || 'None'),
      );
    }

    if (leadershipDNA) {
      candidateContext.push('', 'LEADERSHIP DNA: ' + JSON.stringify(leadershipDNA).slice(0, 1000));
    }

    if (perfScores) {
      candidateContext.push(
        '',
        'RECENT PERFORMANCE SCORES (avg of last 5 challenges):',
        '- Executive: ' + perfScores.executive + '/100',
        '- Leadership: ' + perfScores.leadership + '/100',
        '- Commercial: ' + perfScores.commercial + '/100',
        '- Communication: ' + perfScores.communication + '/100',
      );
    }

    // Build the job context
    const jobContext = [
      'JOB DETAILS:',
      '- Title: ' + (job.title || 'N/A'),
      '- Company: ' + (job.company || 'N/A'),
      '- Executive Level: ' + (job.executive_level || 'N/A'),
      '- Location: ' + (job.location || 'N/A'),
      '- Work Model: ' + (job.work_model || 'N/A'),
      '- Employment Type: ' + (job.employment_type || 'N/A'),
      '- Salary: ' + (job.salary_display || 'N/A'),
      '- Department: ' + (job.department || 'N/A'),
      '- Industry: ' + (job.industry || 'N/A'),
      '- Required Skills: ' + ((job.required_skills || []).join(', ') || 'N/A'),
      '- Required Executive Experience: ' + (job.executive_experience_years || 'N/A') + ' years',
      '- Description: ' + ((job.description || '').slice(0, 1500)),
      '- Requirements: ' + ((job.requirements || []).join(', ') || 'N/A'),
    ];

    const prompt = 'You are an expert executive recruiter and talent strategist. Analyze the match between the candidate and the job.\n\n' +
      candidateContext.join('\n') + '\n\n' + jobContext.join('\n') + '\n\n' +
      'Analyze the match across these dimensions:\n' +
      '1. Executive level alignment (is the candidate at the right level?)\n' +
      '2. Skills match (do they have the required skills?)\n' +
      '3. Industry experience (have they worked in this industry?)\n' +
      '4. Salary alignment (does the salary range match expectations?)\n' +
      '5. Geographic fit (does the location/work model match preferences?)\n' +
      '6. Career goal alignment (does this role advance their stated career goals?)\n' +
      '7. Leadership readiness (based on Leadership DNA and performance scores)\n\n' +
      'Return a JSON object with:\n' +
      '- match_score: 0-100 integer\n' +
      '- match_reasons: array of strings explaining why this is a good match (2-4 reasons)\n' +
      '- missing_qualifications: array of strings for gaps (0-3 items)\n' +
      '- interview_probability: 0-100 integer (likelihood of getting an interview)\n' +
      '- salary_alignment: "aligned", "below", "above", or "unknown"\n' +
      '- recommendation: "strong_fit", "good_fit", "stretch", or "not_recommended"\n' +
      '- summary: one sentence summary of the match';

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          match_score: { type: 'number' },
          match_reasons: { type: 'array', items: { type: 'string' } },
          missing_qualifications: { type: 'array', items: { type: 'string' } },
          interview_probability: { type: 'number' },
          salary_alignment: { type: 'string' },
          recommendation: { type: 'string' },
          summary: { type: 'string' },
        }
      }
    });

    // Cache the match score on any existing application
    try {
      const apps = await base44.entities.JobApplication.filter({ user_id: user.id, job_id: jobId });
      if (apps.length > 0) {
        await base44.entities.JobApplication.update(apps[0].id, { match_score: result.match_score || 0 });
      }
    } catch (e) {}

    return Response.json({ success: true, match: result, jobId, analyzedAt: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});