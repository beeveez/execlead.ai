import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const ADMIN_ROLES = ['admin', 'super_admin', 'platform_admin', 'developer'];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const action = body.action;

    // ── Get latest sync status ──
    if (action === 'get_status') {
      const statuses = await base44.entities.IdentitySyncStatus.filter({ user_id: user.id }, '-created_date', 5);
      return Response.json({ statuses: statuses || [] });
    }

    // ── Sync or Resync ──
    if (action === 'sync' || action === 'resync') {
      const isResync = action === 'resync';
      if (isResync && !ADMIN_ROLES.includes(user.role)) {
        return Response.json({ error: 'Forbidden — admin access required for manual resync' }, { status: 403 });
      }

      const startTime = Date.now();
      let imported = 0, updated = 0, skipped = 0, duplicates = 0, errors = 0;
      const errorDetails = [];

      // 1. Get the latest approved ResumeImport
      let resumeImport = null;
      try {
        const imports = await base44.entities.ResumeImport.filter(
          { import_status: { $in: ['approved', 'partial'] } }, '-created_date', 1
        );
        resumeImport = (imports && imports[0]) ? imports[0] : null;
      } catch (e) {}

      if (!resumeImport) {
        return Response.json({ status: 'no_data', message: 'No approved resume import found to synchronize.' });
      }

      // 2. Parse approved data (only sections the user accepted)
      const acceptedSections = JSON.parse(resumeImport.accepted_changes_json || '[]');
      const allData = JSON.parse(resumeImport.extracted_data_json || '{}');
      const approvedData = {};
      for (const key of acceptedSections) {
        if (allData[key]) approvedData[key] = allData[key];
      }

      // 3. Get UserProfile
      let profile = null;
      try {
        const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
        profile = (profiles && profiles[0]) ? profiles[0] : null;
      } catch (e) {}

      // ── 4. Sync work_experience → JourneyEvent (Career Timeline™) ──
      if (Array.isArray(approvedData.work_experience)) {
        for (const exp of approvedData.work_experience) {
          try {
            const title = (exp.title || 'Role') + ' at ' + (exp.company || 'Company');
            const existing = await base44.entities.JourneyEvent.filter({ user_id: user.id, event_type: 'career', title });
            if (existing && existing.length > 0) {
              await base44.entities.JourneyEvent.update(existing[0].id, {
                description: (exp.description || '').substring(0, 1000),
                event_date: exp.start_date ? new Date(exp.start_date).toISOString() : (existing[0].event_date || new Date().toISOString()),
                metadata_json: JSON.stringify({ company: exp.company, title: exp.title, start_date: exp.start_date, end_date: exp.end_date, is_current: exp.is_current, achievements: exp.achievements }),
                milestone: !!exp.is_current,
              });
              updated++;
            } else {
              await base44.entities.JourneyEvent.create({
                user_id: user.id, user_name: user.full_name || user.email,
                event_type: 'career', title, category: 'career',
                description: (exp.description || '').substring(0, 1000),
                event_date: exp.start_date ? new Date(exp.start_date).toISOString() : new Date().toISOString(),
                metadata_json: JSON.stringify({ company: exp.company, title: exp.title, start_date: exp.start_date, end_date: exp.end_date, is_current: exp.is_current, achievements: exp.achievements }),
                milestone: !!exp.is_current, module: 'resume_import',
              });
              imported++;
            }
          } catch (e) { errors++; errorDetails.push({ entity: 'JourneyEvent.career', error: e.message }); }
        }
      }

      // ── 5. Sync certifications → Certificate ──
      if (Array.isArray(approvedData.certifications)) {
        for (const cert of approvedData.certifications) {
          try {
            const certId = 'resume_' + hashString(user.id + (cert.name || '') + (cert.issuer || ''));
            const existing = await base44.entities.Certificate.filter({ certificate_id: certId });
            if (existing && existing.length > 0) {
              await base44.entities.Certificate.update(existing[0].id, {
                course_name: cert.name || existing[0].course_name,
                completion_date: cert.date || existing[0].completion_date,
                description: 'Issued by ' + (cert.issuer || 'Unknown') + (cert.expiry_date ? ' (expires ' + cert.expiry_date + ')' : ''),
              });
              updated++;
            } else {
              await base44.entities.Certificate.create({
                certificate_id: certId, course_id: 'resume_import',
                course_name: cert.name || 'Unknown Certification',
                user_name: user.full_name || user.email,
                completion_date: cert.date || null,
                description: 'Issued by ' + (cert.issuer || 'Unknown') + (cert.expiry_date ? ' (expires ' + cert.expiry_date + ')' : ''),
                verification_url: '',
              });
              imported++;
            }
          } catch (e) { errors++; errorDetails.push({ entity: 'Certificate', error: e.message }); }
        }
      }

      // ── 6. Sync leadership_competencies → ExecutiveCompetency (dedup) ──
      if (Array.isArray(approvedData.leadership_competencies)) {
        for (const comp of approvedData.leadership_competencies) {
          try {
            const existing = await base44.entities.ExecutiveCompetency.filter({ user_id: user.id, competency_name: comp.name });
            if (existing && existing.length > 0) {
              await base44.entities.ExecutiveCompetency.update(existing[0].id, {
                evidence: comp.evidence || 'Extracted from resume import',
                confidence_score: comp.confidence || 0,
                verification_source: 'resume',
                last_updated: new Date().toISOString().split('T')[0],
              });
              updated++;
              // Remove duplicates beyond the first
              for (let i = 1; i < existing.length; i++) {
                try { await base44.entities.ExecutiveCompetency.delete(existing[i].id); duplicates++; } catch (e) {}
              }
            } else {
              await base44.entities.ExecutiveCompetency.create({
                user_id: user.id, user_name: user.full_name || user.email,
                competency_name: comp.name, category: 'lead_people', proficiency: 'practitioner',
                verification_source: 'resume', evidence: comp.evidence || 'Extracted from resume import',
                confidence_score: comp.confidence || 0,
              });
              imported++;
            }
          } catch (e) { errors++; errorDetails.push({ entity: 'ExecutiveCompetency', error: e.message }); }
        }
      }

      // ── 7. Sync education → JourneyEvent (learning category) ──
      if (Array.isArray(approvedData.education)) {
        for (const edu of approvedData.education) {
          try {
            const title = (edu.degree || 'Degree') + ' — ' + (edu.institution || 'Institution');
            const existing = await base44.entities.JourneyEvent.filter({ user_id: user.id, event_type: 'education', title });
            if (existing && existing.length > 0) {
              await base44.entities.JourneyEvent.update(existing[0].id, {
                description: (edu.field_of_study || '') + (edu.end_date ? ' (Completed ' + edu.end_date + ')' : ''),
                event_date: edu.end_date ? new Date(edu.end_date).toISOString() : (existing[0].event_date || new Date().toISOString()),
                metadata_json: JSON.stringify(edu),
              });
              updated++;
            } else {
              await base44.entities.JourneyEvent.create({
                user_id: user.id, user_name: user.full_name || user.email,
                event_type: 'education', title, category: 'learning',
                description: (edu.field_of_study || '') + (edu.end_date ? ' (Completed ' + edu.end_date + ')' : ''),
                event_date: edu.end_date ? new Date(edu.end_date).toISOString() : new Date().toISOString(),
                metadata_json: JSON.stringify(edu), module: 'resume_import',
              });
              imported++;
            }
          } catch (e) { errors++; errorDetails.push({ entity: 'JourneyEvent.education', error: e.message }); }
        }
      }

      // ── 8. Sync awards → JourneyEvent (award type) ──
      if (Array.isArray(approvedData.awards)) {
        for (const award of approvedData.awards) {
          try {
            const title = 'Award: ' + (award.title || 'Unknown Award');
            const existing = await base44.entities.JourneyEvent.filter({ user_id: user.id, event_type: 'award', title });
            if (existing && existing.length > 0) {
              updated++;
            } else {
              await base44.entities.JourneyEvent.create({
                user_id: user.id, user_name: user.full_name || user.email,
                event_type: 'award', title, category: 'career',
                description: 'Awarded by ' + (award.issuer || 'Unknown') + (award.date ? ' on ' + award.date : ''),
                event_date: award.date ? new Date(award.date).toISOString() : new Date().toISOString(),
                module: 'resume_import',
              });
              imported++;
            }
          } catch (e) { errors++; errorDetails.push({ entity: 'JourneyEvent.award', error: e.message }); }
        }
      }

      // ── 9. Update UserProfile derived fields ──
      if (profile) {
        try {
          const updates = {};
          if (Array.isArray(approvedData.work_experience) && approvedData.work_experience.length > 0) {
            const current = approvedData.work_experience.find(e => e.is_current) || approvedData.work_experience[0];
            if (current.title) updates.current_role = current.title;
            if (current.company) updates.current_company = current.company;
            updates.years_experience = approvedData.work_experience.length;
          }
          if (approvedData.executive_summary && approvedData.executive_summary.text) {
            updates.professional_headline = approvedData.executive_summary.text.substring(0, 200);
          }
          if (Object.keys(updates).length > 0) {
            await base44.entities.UserProfile.update(profile.id, updates);
            updated++;
          } else {
            skipped++;
          }
        } catch (e) { errors++; errorDetails.push({ entity: 'UserProfile', error: e.message }); }
      }

      // ── 10. Create IdentitySyncStatus record ──
      const duration = Date.now() - startTime;
      const syncHealth = errors > 2 ? 'errors' : (errors > 0 ? 'warnings' : 'healthy');

      await base44.entities.IdentitySyncStatus.create({
        user_id: user.id,
        user_name: user.full_name || user.email,
        sync_type: isResync ? 'manual_resync' : 'resume_import',
        status: 'completed',
        records_imported: imported,
        records_updated: updated,
        records_skipped: skipped,
        duplicates_merged: duplicates,
        sync_errors: errors,
        error_details_json: errorDetails.length > 0 ? JSON.stringify(errorDetails).substring(0, 10000) : '',
        sync_health: syncHealth,
        source_import_id: resumeImport.id,
        duration_ms: duration,
      });

      return Response.json({
        status: 'success',
        records_imported: imported,
        records_updated: updated,
        records_skipped: skipped,
        duplicates_merged: duplicates,
        sync_errors: errors,
        sync_health: syncHealth,
        duration_ms: duration,
      });
    }

    return Response.json({ error: 'Invalid action. Use sync, resync, or get_status.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});