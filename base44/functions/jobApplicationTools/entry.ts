import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ============================================================
// Executive Talent Marketplace — AI Application Tools
// Actions: cover_letter | resume_optimization | interview_prep
// Generates personalized content based on the candidate's resume,
// profile, and the target job. Stores results on the JobApplication.
// ============================================================

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { jobId, action } = body;
    if (!jobId || !action) return Response.json({ error: 'jobId and action are required' }, { status: 400 });
    if (!['cover_letter', 'resume_optimization', 'interview_prep'].includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

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

    const candidateName = profile?.full_name || profile?.display_name || user.full_name || user.email || 'Candidate';
    const currentRole = profile?.current_role || (resumeData?.career_history?.[0]?.job_title) || 'Professional';
    const currentCompany = profile?.current_company || (resumeData?.career_history?.[0]?.employer) || '';
    const skills = [...(profile?.skills || []), ...(resumeData?.skills || [])].slice(0, 15);
    const careerHistory = (resumeData?.career_history || []).slice(0, 3).map(h => (h.job_title || '') + ' at ' + (h.employer || '') + (h.duration ? ' (' + h.duration + ')' : ''));
    const certifications = (resumeData?.certifications || []).map(c => typeof c === 'string' ? c : (c.name || ''));

    const jobInfo = 'JOB: ' + (job.title || '') + ' at ' + (job.company || '') +
      '\nLevel: ' + (job.executive_level || 'N/A') +
      '\nLocation: ' + (job.location || 'N/A') + ' (' + (job.work_model || '') + ')' +
      '\nSalary: ' + (job.salary_display || 'N/A') +
      '\nRequired Skills: ' + ((job.required_skills || []).join(', ') || 'N/A') +
      '\nIndustry: ' + (job.industry || 'N/A') +
      '\nDescription: ' + ((job.description || '').slice(0, 1200)) +
      '\nRequirements: ' + ((job.requirements || []).join(', ') || 'N/A');

    const candidateInfo = 'CANDIDATE: ' + candidateName +
      '\nCurrent Role: ' + currentRole + (currentCompany ? ' at ' + currentCompany : '') +
      '\nYears Experience: ' + (profile?.years_experience || 'N/A') +
      '\nSkills: ' + (skills.join(', ') || 'N/A') +
      '\nCareer History: ' + (careerHistory.join('; ') || 'N/A') +
      '\nCertifications: ' + (certifications.join(', ') || 'None') +
      '\nCareer Goals: ' + (profile?.career_goals || 'N/A');

    let prompt = '';
    let storageField = '';

    if (action === 'cover_letter') {
      storageField = 'cover_letter';
      prompt = 'You are an expert executive career writer. Write a compelling, personalized cover letter for this candidate applying to this executive role.\n\n' +
        candidateInfo + '\n\n' + jobInfo + '\n\n' +
        'Requirements for the cover letter:\n' +
        '- Professional, confident, executive tone\n' +
        '- 3-4 paragraphs, maximum 400 words\n' +
        '- Open with a strong hook referencing the specific role and company\n' +
        '- Highlight 2-3 specific achievements from their career that align with the job requirements\n' +
        '- Show industry knowledge and strategic thinking\n' +
        '- Close with a confident call to action\n' +
        '- Do NOT use placeholders like [Your Name] — use the actual candidate name\n' +
        '- Format as plain text with line breaks between paragraphs';
    } else if (action === 'resume_optimization') {
      storageField = 'resume_optimization';
      prompt = 'You are an expert executive resume consultant. Analyze this candidate\'s resume against this job and provide specific optimization recommendations.\n\n' +
        candidateInfo + '\n\n' + jobInfo + '\n\n' +
        'Provide recommendations in these sections (use markdown):\n' +
        '## Key Alignment Opportunities\n' +
        'What aspects of their background already align well with this role.\n\n' +
        '## Recommended Resume Enhancements\n' +
        '3-5 specific changes to make (e.g., "Add a bullet point about X under your role at Y", "Quantify your achievement in Z area").\n\n' +
        '## Keywords to Include\n' +
        'Specific keywords from the job description that should be reflected in the resume.\n\n' +
        '## Achievement Reframing\n' +
        'How to reframe existing achievements to match the executive level and industry of this role.\n\n' +
        '## Risk Areas\n' +
        'Any potential red flags or gaps the recruiter might notice.';
    } else if (action === 'interview_prep') {
      storageField = 'interview_prep';
      prompt = 'You are an elite executive interview coach. Create a comprehensive interview preparation guide for this candidate interviewing for this executive role.\n\n' +
        candidateInfo + '\n\n' + jobInfo + '\n\n' +
        'Provide the guide in these sections (use markdown):\n' +
        '## Likely Interview Questions\n' +
        '8-10 questions they should prepare for, specific to this role and company. Mix behavioral, strategic, and technical.\n\n' +
        '## Suggested Talking Points\n' +
        '4-5 key talking points from their background that align with the job requirements.\n\n' +
        '## STAR Stories to Prepare\n' +
        '3 specific stories using the STAR method (Situation, Task, Action, Result) they should have ready.\n\n' +
        '## Questions to Ask the Interviewer\n' +
        '5 strategic questions to ask that demonstrate executive thinking.\n\n' +
        '## Red Flags to Address\n' +
        'Potential weaknesses in their profile and how to frame them positively.\n\n' +
        '## Executive Presence Tips\n' +
        '3 tips for projecting executive presence in this specific interview context.';
    }

    const result = await base44.integrations.Core.InvokeLLM({ prompt });

    // Find or create a JobApplication record to store the result
    let application = null;
    try {
      const apps = await base44.entities.JobApplication.filter({ user_id: user.id, job_id: jobId });
      application = apps.length > 0 ? apps[0] : null;
    } catch (e) {}

    if (application) {
      const update = { [storageField]: typeof result === 'string' ? result : JSON.stringify(result) };
      if (application.status === 'draft') {
        update.status = 'saved';
        update.applied_at = application.applied_at || new Date().toISOString();
      }
      await base44.entities.JobApplication.update(application.id, update);
    } else {
      application = await base44.entities.JobApplication.create({
        user_id: user.id,
        job_id: jobId,
        job_title: job.title,
        company_name: job.company,
        company_logo: job.company_logo,
        status: 'saved',
        applied_at: new Date().toISOString(),
        [storageField]: typeof result === 'string' ? result : JSON.stringify(result),
      });
    }

    return Response.json({
      success: true,
      action,
      jobId,
      content: result,
      applicationId: application.id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});