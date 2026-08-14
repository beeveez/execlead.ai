import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ============================================================
// Executive Talent Marketplace — Job Synchronization Engine
// Fetches from configurable sources, normalizes, upserts, and
// removes expired listings. Beta sources: RemoteOK, The Muse,
// Greenhouse, Lever, Ashby, SmartRecruiters.
// ============================================================

const EXEC_KEYWORDS = /\b(ceo|cto|cfo|coo|cmo|cio|chro|chief|svp|senior vice|vp|vice president|director|head of|board|managing director|general manager|partner|president)\b/i;

function detectExecutiveLevel(title) {
  const t = (title || '').toLowerCase();
  if (/\b(ceo|cfo|cto|coo|cmo|cio|chro|chief)\b/.test(t)) return 'c_level';
  if (t.includes('svp') || t.includes('senior vice')) return 'svp';
  if (t.includes('vp') || t.includes('vice president')) return 'vp';
  if (t.includes('director')) return 'director';
  if (t.includes('head of')) return 'head';
  if (t.includes('board') || t.includes('non-executive')) return 'board';
  if (t.includes('president') || t.includes('managing director') || t.includes('general manager') || t.includes('partner')) return 'global';
  return 'director';
}

function isExecutiveTitle(title) {
  return EXEC_KEYWORDS.test(title || '');
}

function computeExpiration(postedDate, explicit) {
  if (explicit) return explicit;
  const posted = new Date(postedDate || Date.now());
  posted.setDate(posted.getDate() + 45);
  return posted.toISOString();
}

function stripHtml(str) {
  if (!str) return '';
  return String(str).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace('&amp;', '&').trim();
}

async function fetchRemoteOK(config) {
  const res = await fetch('https://remoteok.com/api');
  const data = await res.json();
  const arr = Array.isArray(data) ? data.slice(1) : [];
  return arr.filter(j => j.position && isExecutiveTitle(j.position)).map(j => ({
    external_id: 'remoteok_' + j.id,
    title: j.position,
    company: j.company || 'Unknown',
    company_logo: j.company_logo || '',
    description: stripHtml(j.description).slice(0, 2000),
    location: j.location || 'Remote',
    city: '',
    country: j.location || 'Remote',
    work_model: 'remote',
    employment_type: 'full_time',
    department: '',
    industry: (j.tags || []).join(', '),
    required_skills: (j.tags || []).slice(0, 10),
    salary_min: j.salary_min || 0,
    salary_max: j.salary_max || 0,
    salary_currency: 'USD',
    salary_display: j.salary_min && j.salary_max ? '$' + j.salary_min + ' - $' + j.salary_max : '',
    posted_date: j.date ? new Date(j.date * 1000).toISOString() : new Date().toISOString(),
    apply_url: j.url || ('https://remoteok.com/jobs/' + j.id),
    executive_level: detectExecutiveLevel(j.position),
    executive_experience_years: 0,
    requirements: (j.tags || []).slice(0, 5),
  }));
}

async function fetchTheMuse(config) {
  const categories = config.categories || ['Engineering', 'Data', 'Product', 'Operations', 'Finance'];
  const all = [];
  for (const cat of categories.slice(0, 3)) {
    try {
      const res = await fetch('https://www.themuse.com/api/public/jobs?category=' + encodeURIComponent(cat) + '&page=0');
      const data = await res.json();
      for (const j of (data.results || [])) {
        if (!isExecutiveTitle(j.name)) continue;
        all.push({
          external_id: 'themuse_' + j.id,
          title: j.name,
          company: (j.company && j.company.name) || 'Unknown',
          company_logo: (j.company && j.company.refs && j.company.refs.logo_image && j.company.refs.logo_image.src) || '',
          description: stripHtml(j.contents).slice(0, 2000),
          location: (j.locations || []).map(l => l.name).join(', ') || 'Remote',
          city: '',
          country: (j.locations && j.locations[0] && j.locations[0].name) || '',
          work_model: 'remote',
          employment_type: 'full_time',
          department: cat,
          industry: '',
          required_skills: [],
          salary_min: 0, salary_max: 0, salary_currency: 'USD', salary_display: '',
          posted_date: j.publication_date || new Date().toISOString(),
          apply_url: (j.refs && j.refs.landing_page) || '',
          executive_level: detectExecutiveLevel(j.name),
          executive_experience_years: 0,
          requirements: (j.levels || []).map(l => l.name),
        });
      }
    } catch (e) {}
  }
  return all;
}

async function fetchGreenhouse(config) {
  const token = config.board_token;
  if (!token) return [];
  const res = await fetch('https://boards-api.greenhouse.io/v1/boards/' + token + '/jobs?content=true');
  const data = await res.json();
  return (data.jobs || []).filter(j => isExecutiveTitle(j.title)).map(j => ({
    external_id: 'greenhouse_' + j.id,
    title: j.title,
    company: config.company_name || token,
    company_logo: '',
    description: stripHtml(j.content).slice(0, 2000),
    location: (j.location && j.location.name) || 'Remote',
    city: '',
    country: (j.location && j.location.name) || '',
    work_model: ((j.location && j.location.name) || '').toLowerCase().includes('remote') ? 'remote' : 'onsite',
    employment_type: 'full_time',
    department: (j.departments || []).map(d => d.name).join(', '),
    industry: '',
    required_skills: [],
    salary_min: 0, salary_max: 0, salary_currency: 'USD', salary_display: '',
    posted_date: j.updated_at || new Date().toISOString(),
    apply_url: j.absolute_url || '',
    executive_level: detectExecutiveLevel(j.title),
    executive_experience_years: 0,
    requirements: [],
  }));
}

async function fetchLever(config) {
  const company = config.company;
  if (!company) return [];
  const res = await fetch('https://api.lever.co/v0/postings/' + company + '?mode=json');
  const data = await res.json();
  return (Array.isArray(data) ? data : []).filter(j => isExecutiveTitle(j.text)).map(j => ({
    external_id: 'lever_' + j.id,
    title: j.text,
    company: config.company_name || company,
    company_logo: '',
    description: (j.descriptionPlain || '').slice(0, 2000),
    location: (j.categories && j.categories.location) || 'Remote',
    city: '',
    country: (j.categories && j.categories.location) || '',
    work_model: ((j.categories && j.categories.location) || '').toLowerCase().includes('remote') ? 'remote' : 'onsite',
    employment_type: 'full_time',
    department: (j.categories && j.categories.team) || '',
    industry: '',
    required_skills: [],
    salary_min: 0, salary_max: 0, salary_currency: 'USD', salary_display: '',
    posted_date: j.createdAt || new Date().toISOString(),
    apply_url: j.applyUrl || j.hostedUrl || '',
    executive_level: detectExecutiveLevel(j.text),
    executive_experience_years: 0,
    requirements: [],
  }));
}

async function fetchAshby(config) {
  const org = config.org;
  if (!org) return [];
  const res = await fetch('https://api.ashbyhq.com/posting-api/job-board/' + org + '?includeCompensation=true');
  const data = await res.json();
  const jobs = data.jobs || [];
  return jobs.filter(j => isExecutiveTitle(j.title)).map(j => {
    const comp = j.compensation || {};
    const range = comp.salaryRange || {};
    return {
      external_id: 'ashby_' + j.id,
      title: j.title,
      company: config.company_name || org,
      company_logo: '',
      description: (j.descriptionPlain || '').slice(0, 2000),
      location: j.locationName || 'Remote',
      city: '',
      country: j.locationName || '',
      work_model: (j.locationName || '').toLowerCase().includes('remote') ? 'remote' : 'onsite',
      employment_type: (j.employmentType || 'full_time').toLowerCase(),
      department: j.departmentName || '',
      industry: '',
      required_skills: [],
      salary_min: range.minValue || 0,
      salary_max: range.maxValue || 0,
      salary_currency: range.currency || 'USD',
      salary_display: range.minValue ? (range.currency || '$') + range.minValue + ' - ' + range.maxValue : '',
      posted_date: j.publishedDate || new Date().toISOString(),
      apply_url: j.externalLink || '',
      executive_level: detectExecutiveLevel(j.title),
      executive_experience_years: 0,
      requirements: [],
    };
  });
}

async function fetchSmartRecruiters(config) {
  const company = config.company;
  if (!company) return [];
  const res = await fetch('https://api.smartrecruiters.com/v1/companies/' + company + '/postings');
  const data = await res.json();
  return (data.content || []).filter(j => isExecutiveTitle(j.name)).map(j => {
    const loc = j.location || {};
    const about = (j.jobAd && j.jobAd.sections && j.jobAd.sections.aboutTheRole && j.jobAd.sections.aboutTheRole.text) || '';
    return {
      external_id: 'smartrecruiters_' + j.id,
      title: j.name,
      company: (j.company && j.company.name) || config.company_name || company,
      company_logo: (j.company && j.company.logoUrl) || '',
      description: stripHtml(about).slice(0, 2000),
      location: [loc.city, loc.region, loc.country].filter(Boolean).join(', ') || 'Remote',
      city: loc.city || '',
      country: loc.country || '',
      work_model: (loc.city || '').toLowerCase().includes('remote') || j.remote ? 'remote' : 'onsite',
      employment_type: 'full_time',
      department: (j.department && j.department.label) || '',
      industry: (j.industry && j.industry.label) || '',
      required_skills: (j.keySkills || []).map(s => typeof s === 'string' ? s : (s.label || '')),
      salary_min: 0, salary_max: 0, salary_currency: 'USD', salary_display: '',
      posted_date: j.publishedDate || new Date().toISOString(),
      apply_url: j.applyUrl || '',
      executive_level: detectExecutiveLevel(j.name),
      executive_experience_years: 0,
      requirements: j.experience ? [j.experience] : [],
    };
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let authedUser = null;
    const timestamp = new Date().toISOString();
    const ipAddress = (() => {
      const fwd = req.headers.get('x-forwarded-for');
      if (fwd) return fwd.split(',')[0].trim();
      return req.headers.get('x-real-ip') || 'unknown';
    })();

    // Audit logging — persists every execution attempt to SecurityEvent
    const auditLog = async (result, reason) => {
      try {
        await base44.asServiceRole.entities.SecurityEvent.create({
          user_id: authedUser?.id || '',
          user_name: authedUser?.full_name || authedUser?.email || 'unknown',
          event_type: 'api_access',
          severity: result === 'success' ? 'info' : (result === 'denied' ? 'medium' : 'high'),
          ip_address: ipAddress,
          description: 'syncJobs: ' + result + (reason ? ' (' + reason + ')' : ''),
          action_taken: result === 'success' ? 'logged' : 'blocked',
          metadata_json: JSON.stringify({
            action: 'syncJobs',
            result,
            reason: reason || '',
            role: authedUser?.role || 'unknown',
            email: authedUser?.email || '',
            timestamp,
          }),
        });
      } catch (e) {
        console.error('syncJobs audit log failed:', e.message);
      }
    };

    // CSRF protection: POST-only (platform uses token-based auth, inherently CSRF-resistant)
    if (req.method !== 'POST') {
      return Response.json({ success: false, error: 'Method not allowed' }, { status: 405 });
    }

    // 1. Require authenticated session — auth failure returns 401 immediately (NO empty catch)
    let user;
    try {
      user = await base44.auth.me();
    } catch (e) {
      await auditLog('denied', 'auth_error');
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (!user) {
      await auditLog('denied', 'no_session');
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    authedUser = user;

    // 2. Require Platform Administrator or Developer role
    if (user.role !== 'admin' && user.role !== 'developer') {
      await auditLog('denied', 'insufficient_role');
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // 3. Rate limiting: maximum 5 executions per minute per user
    try {
      const recent = await base44.asServiceRole.entities.SecurityEvent.filter({ user_id: user.id }, '-created_date', 20);
      const oneMinAgo = Date.now() - 60000;
      const recentCount = recent.filter(e =>
        e.description && e.description.startsWith('syncJobs') &&
        new Date(e.created_date).getTime() >= oneMinAgo
      ).length;
      if (recentCount >= 5) {
        await auditLog('denied', 'rate_limited');
        return Response.json({ success: false, error: 'Rate limit exceeded. Maximum 5 executions per minute.' }, { status: 429 });
      }
    } catch (e) {
      // Fail closed — if the rate-limit check fails, deny execution
      await auditLog('denied', 'rate_check_failed');
      return Response.json({ success: false, error: 'Authorization check failed' }, { status: 503 });
    }

    // === Authorization complete — no sync, DB write, or API request runs above unless authorized ===

    const sources = await base44.asServiceRole.entities.JobSource.filter({ is_active: true });
    const results = [];
    let totalNew = 0;
    let totalUpdated = 0;
    const now = new Date().toISOString();

    for (const source of sources) {
      try {
        let config = {};
        try { config = source.config_json ? JSON.parse(source.config_json) : {}; } catch (e) {}
        let jobs = [];

        if (source.source_type === 'remoteok') {
          jobs = await fetchRemoteOK(config);
        } else if (source.source_type === 'themuse') {
          jobs = await fetchTheMuse(config);
        } else if (source.source_type === 'greenhouse') {
          jobs = await fetchGreenhouse(config);
        } else if (source.source_type === 'lever') {
          jobs = await fetchLever(config);
        } else if (source.source_type === 'ashby') {
          jobs = await fetchAshby(config);
        } else if (source.source_type === 'smartrecruiters') {
          jobs = await fetchSmartRecruiters(config);
        } else {
          results.push({ source: source.name, skipped: 'Unsupported source type: ' + source.source_type });
          continue;
        }

        // Set expiration for jobs without one
        for (const job of jobs) {
          job.source_type = source.source_type;
          job.source_name = source.name;
          job.source_id = source.id;
          job.last_synced = now;
          job.is_active = true;
          job.expiration_date = computeExpiration(job.posted_date, job.expiration_date);
        }

        // Fetch existing jobs for this source to build a lookup map
        const existing = await base44.asServiceRole.entities.CareerOpportunity.filter({ source_type: source.source_type });
        const existingMap = new Map();
        for (const e of existing) { if (e.external_id) existingMap.set(e.external_id, e.id); }

        const toCreate = [];
        const toUpdate = [];
        for (const job of jobs) {
          const exId = existingMap.get(job.external_id);
          if (exId) { toUpdate.push({ id: exId, ...job }); }
          else { toCreate.push(job); }
        }

        if (toCreate.length > 0) {
          await base44.asServiceRole.entities.CareerOpportunity.bulkCreate(toCreate);
        }
        if (toUpdate.length > 0) {
          await base44.asServiceRole.entities.CareerOpportunity.bulkUpdate(toUpdate);
        }

        totalNew += toCreate.length;
        totalUpdated += toUpdate.length;

        await base44.asServiceRole.entities.JobSource.update(source.id, {
          last_sync_at: now,
          last_sync_status: 'success',
          last_sync_count: jobs.length,
          last_error: ''
        });

        results.push({ source: source.name, type: source.source_type, new: toCreate.length, updated: toUpdate.length, total: jobs.length });
      } catch (error) {
        try {
          await base44.asServiceRole.entities.JobSource.update(source.id, {
            last_sync_at: now,
            last_sync_status: 'error',
            last_error: error.message
          });
        } catch (e) {}
        results.push({ source: source.name, type: source.source_type, error: error.message });
      }
    }

    // Deactivate expired listings
    let expiredCount = 0;
    try {
      const active = await base44.asServiceRole.entities.CareerOpportunity.filter({ is_active: true });
      const nowDate = new Date(now);
      const expiredIds = [];
      for (const job of active) {
        if (job.expiration_date && new Date(job.expiration_date) < nowDate) {
          expiredIds.push(job.id);
        }
      }
      for (const id of expiredIds) {
        try { await base44.asServiceRole.entities.CareerOpportunity.update(id, { is_active: false }); expiredCount++; } catch (e) {}
      }
    } catch (e) {}

    await auditLog('success', '');
    return Response.json({ success: true, totalNew, totalUpdated, expiredDeactivated: expiredCount, results });
  } catch (error) {
    if (authedUser) await auditLog('error', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});