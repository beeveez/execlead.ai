import React from "react";
import { RESUME_TEMPLATES } from "@/lib/careerStudio";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtMonthYear(val) {
  if (!val || val === "Present") return val;
  const parts = String(val).split("-");
  const y = parts[0];
  const m = parts[1] ? parseInt(parts[1]) : null;
  if (!y) return "";
  if (!m) return y;
  return `${MONTHS_SHORT[m - 1]} ${y}`;
}

function fmtDateRange(exp) {
  if (exp.start_date || exp.end_date || exp.current) {
    const start = fmtMonthYear(exp.start_date);
    const end = exp.current ? "Present" : fmtMonthYear(exp.end_date);
    return [start, end].filter(Boolean).join(" \u2013 ");
  }
  return exp.dates || "";
}

export default function ResumePreview({ content, template }) {
  const tpl = RESUME_TEMPLATES.find(t => t.id === template) || RESUME_TEMPLATES[0];
  const isDark = tpl.layout === "dark";
  const isATS = tpl.layout === "ats";
  const isMinimal = tpl.layout === "minimal";
  const bg = isDark ? "#111827" : "#ffffff";
  const text = isDark ? "#e5e7eb" : "#111827";
  const muted = isDark ? "#9ca3af" : "#6b7280";
  const accent = tpl.accent;
  const p = content.personal || {};

  const SectionTitle = ({ children }) => {
    if (isATS) return <div style={{ color: text, fontWeight: "bold", textTransform: "uppercase", fontSize: "12px", marginTop: "12px", marginBottom: "4px" }}>{children}</div>;
    if (isMinimal) return <div style={{ color: text, fontWeight: "600", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "16px", marginBottom: "6px" }}>{children}</div>;
    return <div style={{ color: accent, fontWeight: "bold", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "14px", marginBottom: "6px", borderBottom: `2px solid ${isDark ? accent + "40" : accent + "20"}`, paddingBottom: "3px" }}>{children}</div>;
  };

  const hasContent = (arr) => arr && arr.length > 0;

  return (
    <div style={{ background: bg, color: text }} className="rounded-lg overflow-hidden shadow-xl text-sm" >
      <div className="p-6" style={{ minHeight: "500px" }}>
        {/* Header */}
        <div style={{ textAlign: isATS || isMinimal ? "left" : "left" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "bold", color: text, marginBottom: "4px" }}>{p.full_name || "Your Name"}</h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", fontSize: "10px", color: muted }}>
            {[p.email, p.phone, p.location, p.linkedin, p.portfolio].filter(Boolean).map((c, i) => (
              <span key={i}>{c}{i < [p.email, p.phone, p.location, p.linkedin, p.portfolio].filter(Boolean).length - 1 ? " |" : ""}</span>
            ))}
          </div>
          {!isATS && <div style={{ height: "2px", background: isDark ? accent + "30" : accent, marginTop: "8px", borderRadius: "1px" }} />}
        </div>

        {/* Summary */}
        {content.summary && (
          <>
            <SectionTitle>Professional Summary</SectionTitle>
            <p style={{ fontSize: "11px", lineHeight: "1.5", color: muted }}>{content.summary}</p>
          </>
        )}

        {/* Experience */}
        {hasContent(content.experience) && (
          <>
            <SectionTitle>Experience</SectionTitle>
            {content.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: "600", fontSize: "12px", color: text }}>{exp.job_title || "Role"}</span>
                  <span style={{ fontSize: "10px", color: muted }}>{fmtDateRange(exp)}</span>
                </div>
                <div style={{ fontSize: "11px", color: accent, marginBottom: "4px" }}>{exp.employer}{exp.location ? ` · ${exp.location}` : ""}</div>
                {exp.bullets?.map((b, bi) => (
                  <div key={bi} style={{ fontSize: "11px", color: muted, lineHeight: "1.4", marginBottom: "2px", paddingLeft: "10px", position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: accent }}>•</span> {b}
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {/* Achievements */}
        {hasContent(content.achievements) && content.achievements.some(a => a.bullet) && (
          <>
            <SectionTitle>Key Achievements</SectionTitle>
            {content.achievements.filter(a => a.bullet).map((a, i) => (
              <div key={i} style={{ fontSize: "11px", color: muted, lineHeight: "1.4", marginBottom: "2px", paddingLeft: "10px", position: "relative" }}>
                <span style={{ position: "absolute", left: 0, color: accent }}>•</span> {a.bullet}
              </div>
            ))}
          </>
        )}

        {/* Projects */}
        {hasContent(content.projects) && (
          <>
            <SectionTitle>Projects</SectionTitle>
            {content.projects.map((pr, i) => (
              <div key={i} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: "600", fontSize: "12px", color: text }}>{pr.name}</span>
                  {pr.role && <span style={{ fontSize: "10px", color: muted }}>{pr.role}</span>}
                </div>
                {pr.description && <p style={{ fontSize: "11px", color: muted, lineHeight: "1.4" }}>{pr.description}</p>}
              </div>
            ))}
          </>
        )}

        {/* Two-column for smaller sections */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "8px" }}>
          <div>
            {hasContent(content.skills) && (
              <>
                <SectionTitle>Skills</SectionTitle>
                {content.skills.map((s, i) => (
                  <div key={i} style={{ marginBottom: "4px" }}>
                    <span style={{ fontSize: "10px", fontWeight: "600", color: text }}>{s.category}: </span>
                    <span style={{ fontSize: "10px", color: muted }}>{(s.items || []).join(", ")}</span>
                  </div>
                ))}
              </>
            )}
            {hasContent(content.leadership) && (
              <>
                <SectionTitle>Leadership</SectionTitle>
                {content.leadership.map((l, i) => (
                  <div key={i} style={{ marginBottom: "3px", fontSize: "10px" }}>
                    <span style={{ fontWeight: "600", color: text }}>{l.role}</span>
                    <span style={{ color: muted }}> — {l.organization}</span>
                  </div>
                ))}
              </>
            )}
            {hasContent(content.education) && (
              <>
                <SectionTitle>Education</SectionTitle>
                {content.education.map((e, i) => (
                  <div key={i} style={{ marginBottom: "3px", fontSize: "10px" }}>
                    <div style={{ fontWeight: "600", color: text }}>{e.degree}</div>
                    <div style={{ color: muted }}>{e.institution}{e.year ? `, ${e.year}` : ""}</div>
                  </div>
                ))}
              </>
            )}
          </div>
          <div>
            {hasContent(content.certifications) && (
              <>
                <SectionTitle>Certifications</SectionTitle>
                {content.certifications.map((c, i) => (
                  <div key={i} style={{ marginBottom: "3px", fontSize: "10px" }}>
                    <span style={{ fontWeight: "600", color: text }}>{c.name}</span>
                    <span style={{ color: muted }}> — {c.issuer}{c.year ? `, ${c.year}` : ""}</span>
                  </div>
                ))}
              </>
            )}
            {hasContent(content.awards) && (
              <>
                <SectionTitle>Awards</SectionTitle>
                {content.awards.map((a, i) => (
                  <div key={i} style={{ marginBottom: "3px", fontSize: "10px" }}>
                    <span style={{ fontWeight: "600", color: text }}>{a.title}</span>
                    <span style={{ color: muted }}> — {a.issuer}{a.year ? `, ${a.year}` : ""}</span>
                  </div>
                ))}
              </>
            )}
            {hasContent(content.languages) && (
              <>
                <SectionTitle>Languages</SectionTitle>
                <div style={{ fontSize: "10px", color: muted }}>
                  {content.languages.map((l, i) => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ""}`).join(", ")}
                </div>
              </>
            )}
            {hasContent(content.public_speaking) && (
              <>
                <SectionTitle>Public Speaking</SectionTitle>
                {content.public_speaking.map((s, i) => (
                  <div key={i} style={{ marginBottom: "3px", fontSize: "10px" }}>
                    <span style={{ fontWeight: "600", color: text }}>{s.topic}</span>
                    <span style={{ color: muted }}> — {s.event}</span>
                  </div>
                ))}
              </>
            )}
            {hasContent(content.publications) && (
              <>
                <SectionTitle>Publications</SectionTitle>
                {content.publications.map((pub, i) => (
                  <div key={i} style={{ marginBottom: "3px", fontSize: "10px" }}>
                    <span style={{ fontWeight: "600", color: text }}>{pub.title}</span>
                    <span style={{ color: muted }}> — {pub.publisher}</span>
                  </div>
                ))}
              </>
            )}
            {hasContent(content.volunteer) && (
              <>
                <SectionTitle>Volunteer</SectionTitle>
                {content.volunteer.map((v, i) => (
                  <div key={i} style={{ marginBottom: "3px", fontSize: "10px" }}>
                    <span style={{ fontWeight: "600", color: text }}>{v.role}</span>
                    <span style={{ color: muted }}> — {v.organization}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
      <div style={{ background: isDark ? "#0d0d14" : "#f9fafb", padding: "6px 12px", fontSize: "9px", color: muted, textAlign: "center" }}>
        {tpl.name} Template · Live Preview
      </div>
    </div>
  );
}