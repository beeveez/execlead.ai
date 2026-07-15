import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    personal_info: {
      type: "object",
      properties: {
        full_name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        location: { type: "string" },
        linkedin_url: { type: "string" },
        website_url: { type: "string" },
        confidence: { type: "number" }
      }
    },
    executive_summary: {
      type: "object",
      properties: {
        text: { type: "string" },
        confidence: { type: "number" }
      }
    },
    work_experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          company: { type: "string" },
          title: { type: "string" },
          start_date: { type: "string" },
          end_date: { type: "string" },
          is_current: { type: "boolean" },
          description: { type: "string" },
          achievements: { type: "array", items: { type: "string" } },
          confidence: { type: "number" }
        }
      }
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          institution: { type: "string" },
          degree: { type: "string" },
          field_of_study: { type: "string" },
          start_date: { type: "string" },
          end_date: { type: "string" },
          confidence: { type: "number" }
        }
      }
    },
    certifications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          issuer: { type: "string" },
          date: { type: "string" },
          expiry_date: { type: "string" },
          confidence: { type: "number" }
        }
      }
    },
    skills: { type: "array", items: { type: "string" } },
    leadership_competencies: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          evidence: { type: "string" },
          confidence: { type: "number" }
        }
      }
    },
    languages: {
      type: "array",
      items: {
        type: "object",
        properties: {
          language: { type: "string" },
          proficiency: { type: "string" }
        }
      }
    },
    awards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          issuer: { type: "string" },
          date: { type: "string" }
        }
      }
    },
    publications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          publisher: { type: "string" },
          date: { type: "string" },
          url: { type: "string" }
        }
      }
    },
    memberships: {
      type: "array",
      items: {
        type: "object",
        properties: {
          organization: { type: "string" },
          role: { type: "string" },
          start_date: { type: "string" },
          end_date: { type: "string" }
        }
      }
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          role: { type: "string" },
          url: { type: "string" }
        }
      }
    },
    references: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          title: { type: "string" },
          company: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" }
        }
      }
    },
    intelligence_report: {
      type: "object",
      properties: {
        resume_score: { type: "number" },
        missing_sections: { type: "array", items: { type: "string" } },
        leadership_strengths: { type: "array", items: { type: "string" } },
        career_gaps: { type: "array", items: { type: "string" } },
        suggested_improvements: { type: "array", items: { type: "string" } }
      }
    }
  }
};

function computeAvgConfidence(approvedSections) {
  let total = 0;
  let count = 0;
  for (const key of Object.keys(approvedSections)) {
    const value = approvedSections[key];
    if (!value) continue;
    if (Array.isArray(value)) {
      const confs = value.filter(function(i) { return i && typeof i.confidence === 'number'; }).map(function(i) { return i.confidence; });
      total += confs.length > 0 ? confs.reduce(function(a, b) { return a + b; }, 0) / confs.length : 80;
      count++;
    } else if (typeof value === 'object') {
      total += typeof value.confidence === 'number' ? value.confidence : 80;
      count++;
    }
  }
  return count > 0 ? Math.round(total / count) : 0;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const action = body.action;

    if (action === 'analyze') {
      const fileUrl = body.file_url;
      const fileName = body.file_name;
      if (!fileUrl) return Response.json({ error: 'file_url is required' }, { status: 400 });

      let existingProfile = null;
      try {
        const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
        existingProfile = (profiles && profiles[0]) ? profiles[0] : null;
      } catch (e) { /* no profile yet */ }

      const extracted = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: 'You are an expert executive resume parser for the EXECLEAD.AI platform. Analyze the attached resume document and extract ALL structured information.\n\nFor each section, assign a confidence score (0-100) based on extraction certainty:\n- 95-100: Information is explicitly and clearly stated in the resume\n- 80-94: Information is clearly implied from stated content\n- 60-79: Information is inferred from context but not explicitly stated\n- Below 60: Information is uncertain or weakly inferred\n\nExtract these sections:\n1. personal_info: full_name, email, phone, location, linkedin_url, website_url (+ confidence)\n2. executive_summary: The professional summary or objective text (+ confidence)\n3. work_experience: Array of {company, title, start_date, end_date, is_current, description, achievements[], confidence}\n4. education: Array of {institution, degree, field_of_study, start_date, end_date, confidence}\n5. certifications: Array of {name, issuer, date, expiry_date, confidence}\n6. skills: Array of skill name strings\n7. leadership_competencies: Array of {name, evidence, confidence} — extract leadership competencies demonstrated in the resume\n8. languages: Array of {language, proficiency}\n9. awards: Array of {title, issuer, date}\n10. publications: Array of {title, publisher, date, url}\n11. memberships: Array of {organization, role, start_date, end_date}\n12. projects: Array of {name, description, role, url}\n13. references: Array of {name, title, company, email, phone}\n\nAlso generate an intelligence_report:\n- resume_score (0-100): Score based on completeness, quantification of achievements, leadership evidence, and overall quality\n- missing_sections: Array of standard resume sections that are missing or weak\n- leadership_strengths: Array of identified leadership strengths with evidence\n- career_gaps: Array of identified career timeline gaps or unexplained transitions\n- suggested_improvements: Array of actionable improvement suggestions\n\nReturn empty arrays for sections not found. Do not fabricate information.',
        file_urls: [fileUrl],
        response_json_schema: EXTRACTION_SCHEMA,
      });

      return Response.json({
        status: 'success',
        extracted_data: extracted,
        file_name: fileName,
        existing_profile: existingProfile ? {
          full_name: existingProfile.full_name,
          bio: existingProfile.bio,
          city: existingProfile.city,
          linkedin_url: existingProfile.linkedin_url,
          website_url: existingProfile.website_url,
          mobile_number: existingProfile.mobile_number,
          skills: existingProfile.skills,
          experience_json: existingProfile.experience_json,
          education_json: existingProfile.education_json,
          certifications_json: existingProfile.certifications_json,
          languages_json: existingProfile.languages_json,
          awards_json: existingProfile.awards_json,
          projects_json: existingProfile.projects_json,
        } : null,
      });
    }

    if (action === 'apply') {
      const fileUrl = body.file_url;
      const fileName = body.file_name;
      const approvedSections = body.approved_sections || {};
      const rejectedSections = body.rejected_sections || {};
      const intelligenceReport = body.intelligence_report || {};
      const isReimport = body.is_reimport || false;
      const previousImportId = body.previous_import_id || null;

      let profile = null;
      try {
        const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
        profile = (profiles && profiles[0]) ? profiles[0] : null;
      } catch (e) { /* no profile yet */ }

      const updates = {};
      const appliedSections = [];

      if (approvedSections.personal_info) {
        const pi = approvedSections.personal_info;
        if (pi.full_name) updates.full_name = pi.full_name;
        if (pi.phone) updates.mobile_number = pi.phone;
        if (pi.location) updates.city = pi.location;
        if (pi.linkedin_url) updates.linkedin_url = pi.linkedin_url;
        if (pi.website_url) updates.website_url = pi.website_url;
        appliedSections.push('personal_info');
      }
      if (approvedSections.executive_summary) {
        updates.bio = approvedSections.executive_summary.text || '';
        appliedSections.push('executive_summary');
      }
      if (approvedSections.work_experience) { updates.experience_json = JSON.stringify(approvedSections.work_experience); appliedSections.push('work_experience'); }
      if (approvedSections.education) { updates.education_json = JSON.stringify(approvedSections.education); appliedSections.push('education'); }
      if (approvedSections.certifications) { updates.certifications_json = JSON.stringify(approvedSections.certifications); appliedSections.push('certifications'); }
      if (approvedSections.skills) { updates.skills = approvedSections.skills; appliedSections.push('skills'); }
      if (approvedSections.languages) { updates.languages_json = JSON.stringify(approvedSections.languages); appliedSections.push('languages'); }
      if (approvedSections.awards) { updates.awards_json = JSON.stringify(approvedSections.awards); appliedSections.push('awards'); }
      if (approvedSections.projects) { updates.projects_json = JSON.stringify(approvedSections.projects); appliedSections.push('projects'); }

      if (Object.keys(updates).length > 0) {
        if (profile) {
          await base44.entities.UserProfile.update(profile.id, updates);
        } else {
          await base44.entities.UserProfile.create({
            user_id: user.id, target_company: '', target_role: '', ...updates,
          });
        }
      }

      await base44.entities.ResumeVersion.create({
        file_url: fileUrl, file_name: fileName,
        version_number: Date.now(),
        extracted_data: JSON.stringify(approvedSections),
        description: 'AI Resume Auto-Population Engine Import',
      });

      if (approvedSections.leadership_competencies && Array.isArray(approvedSections.leadership_competencies)) {
        for (const comp of approvedSections.leadership_competencies) {
          await base44.entities.ExecutiveCompetency.create({
            user_id: user.id,
            user_name: user.full_name || user.email,
            competency_name: comp.name,
            category: 'lead_people',
            proficiency: 'practitioner',
            verification_source: 'resume',
            evidence: comp.evidence || 'Extracted from resume import',
            confidence_score: comp.confidence || 0,
          });
        }
        appliedSections.push('leadership_competencies');
      }

      const acceptedCount = appliedSections.length;
      const rejectedCount = Object.keys(rejectedSections).length;
      const totalSections = acceptedCount + rejectedCount;
      const avgConfidence = computeAvgConfidence(approvedSections);
      const importStatus = acceptedCount === 0 ? 'rejected' : (rejectedCount > 0 ? 'partial' : 'approved');

      const auditRecord = await base44.entities.ResumeImport.create({
        file_url: fileUrl, file_name: fileName,
        import_status: importStatus,
        extracted_data_json: JSON.stringify({ ...approvedSections, ...rejectedSections }),
        intelligence_report_json: JSON.stringify(intelligenceReport),
        accepted_changes_json: JSON.stringify(appliedSections),
        rejected_changes_json: JSON.stringify(Object.keys(rejectedSections)),
        sections_extracted: totalSections,
        sections_accepted: acceptedCount,
        sections_rejected: rejectedCount,
        avg_confidence_score: avgConfidence,
        resume_score: intelligenceReport.resume_score || 0,
        approved_by_id: user.id,
        approved_by_name: user.full_name || user.email,
        approved_at: new Date().toISOString(),
        is_reimport: isReimport,
        previous_import_id: previousImportId,
      });

      return Response.json({
        status: 'success',
        audit_id: auditRecord.id,
        sections_applied: appliedSections,
        sections_rejected: Object.keys(rejectedSections),
        resume_score: intelligenceReport.resume_score || 0,
      });
    }

    return Response.json({ error: 'Invalid action. Use "analyze" or "apply".' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});