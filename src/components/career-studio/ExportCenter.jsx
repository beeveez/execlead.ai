import React, { useState } from "react";
import { Download, FileText, Printer, Linkedin, FileCode, Loader2 } from "lucide-react";

export default function ExportCenter({ activeResume, resumeContent }) {
  const [exporting, setExporting] = useState(null);

  const getName = () => (resumeContent.personal?.full_name || "Executive").replace(/\s+/g, "_");

  const buildPlainText = () => {
    const p = resumeContent.personal || {};
    let text = `${p.full_name || "Executive"}\n`;
    text += [p.email, p.phone, p.location, p.linkedin, p.portfolio].filter(Boolean).join(" | ") + "\n\n";
    if (resumeContent.summary) text += `PROFESSIONAL SUMMARY\n${resumeContent.summary}\n\n`;
    if (resumeContent.experience?.length) {
      text += "EXPERIENCE\n";
      resumeContent.experience.forEach(e => { text += `${e.job_title} | ${e.employer} | ${e.dates}\n`; (e.bullets || []).forEach(b => { text += `  - ${b}\n`; }); text += "\n"; });
    }
    if (resumeContent.skills?.length) { text += "SKILLS\n"; resumeContent.skills.forEach(s => { text += `${s.category}: ${(s.items || []).join(", ")}\n`; }); text += "\n"; }
    if (resumeContent.education?.length) { text += "EDUCATION\n"; resumeContent.education.forEach(e => { text += `${e.degree} | ${e.institution} | ${e.year}\n`; }); text += "\n"; }
    if (resumeContent.certifications?.length) { text += "CERTIFICATIONS\n"; resumeContent.certifications.forEach(c => { text += `${c.name} | ${c.issuer}${c.year ? ` | ${c.year}` : ""}\n`; }); text += "\n"; }
    return text;
  };

  const buildATSFormat = () => {
    const p = resumeContent.personal || {};
    let text = `${p.full_name || "Executive"}\n${p.email || ""} | ${p.phone || ""} | ${p.location || ""}\n${p.linkedin || ""} | ${p.portfolio || ""}\n\n`;
    if (resumeContent.summary) text += `SUMMARY\n${resumeContent.summary}\n\n`;
    if (resumeContent.experience?.length) {
      text += "EXPERIENCE\n";
      resumeContent.experience.forEach(e => { text += `${e.job_title}, ${e.employer}, ${e.dates}\n`; (e.bullets || []).forEach(b => { text += `* ${b}\n`; }); });
      text += "\n";
    }
    if (resumeContent.skills?.length) { text += "SKILLS\n"; resumeContent.skills.forEach(s => { text += `${s.category}: ${(s.items || []).join(", ")}\n`; }); text += "\n"; }
    if (resumeContent.education?.length) { text += "EDUCATION\n"; resumeContent.education.forEach(e => { text += `${e.degree}, ${e.institution}, ${e.year}\n`; }); }
    if (resumeContent.certifications?.length) { text += "\nCERTIFICATIONS\n"; resumeContent.certifications.forEach(c => { text += `${c.name}, ${c.issuer}\n`; }); }
    return text;
  };

  const buildLinkedInFormat = () => {
    const p = resumeContent.personal || {};
    let text = `${p.full_name || "Executive"}\n${p.linkedin || ""}\n\n`;
    if (resumeContent.summary) text += `ABOUT\n${resumeContent.summary}\n\n`;
    if (resumeContent.experience?.length) {
      text += "EXPERIENCE\n";
      resumeContent.experience.forEach(e => {
        text += `${e.job_title}\n${e.employer}\n${e.dates}\n`;
        (e.bullets || []).forEach(b => { text += `• ${b}\n`; });
        text += "\n";
      });
    }
    if (resumeContent.skills?.length) { text += "SKILLS\n"; text += resumeContent.skills.flatMap(s => s.items || []).join(", ") + "\n"; }
    return text;
  };

  const buildHTML = () => {
    const p = resumeContent.personal || {};
    let html = `<html><head><style>body{font-family:Calibri,sans-serif;max-width:800px;margin:40px auto;color:#333}h1{font-size:24px;margin-bottom:4px}h2{font-size:14px;color:#444;border-bottom:2px solid #6366f1;padding-bottom:4px;margin-top:20px}.contact{color:#666;font-size:12px;margin-bottom:12px}.exp{margin-bottom:12px}.exp-title{font-weight:bold}.exp-org{color:#6366f1}ul{padding-left:20px}</style></head><body>`;
    html += `<h1>${p.full_name || "Executive"}</h1><div class="contact">${[p.email, p.phone, p.location, p.linkedin].filter(Boolean).join(" | ")}</div>`;
    if (resumeContent.summary) html += `<h2>Professional Summary</h2><p>${resumeContent.summary}</p>`;
    if (resumeContent.experience?.length) {
      html += "<h2>Experience</h2>";
      resumeContent.experience.forEach(e => {
        html += `<div class="exp"><div class="exp-title">${e.job_title}</div><div class="exp-org">${e.employer} | ${e.dates}</div>`;
        if (e.bullets?.length) { html += "<ul>"; e.bullets.forEach(b => { html += `<li>${b}</li>`; }); html += "</ul>"; }
        html += "</div>";
      });
    }
    if (resumeContent.skills?.length) { html += "<h2>Skills</h2>"; resumeContent.skills.forEach(s => { html += `<div><strong>${s.category}:</strong> ${(s.items || []).join(", ")}</div>`; }); }
    if (resumeContent.education?.length) { html += "<h2>Education</h2>"; resumeContent.education.forEach(e => { html += `<div><strong>${e.degree}</strong> | ${e.institution} | ${e.year}</div>`; }); }
    if (resumeContent.certifications?.length) { html += "<h2>Certifications</h2>"; resumeContent.certifications.forEach(c => { html += `<div><strong>${c.name}</strong> | ${c.issuer}${c.year ? ` | ${c.year}` : ""}</div>`; }); }
    html += "</body></html>";
    return html;
  };

  const download = (content, filename, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format) => {
    if (!activeResume) return;
    setExporting(format);
    try {
      const name = getName();
      if (format === "pdf") {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        const lines = buildPlainText().split("\n");
        let y = 20;
        lines.forEach(line => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.setFontSize(line.match(/^[A-Z\s]+$/) && line.length < 30 ? 12 : 10);
          doc.setFont(undefined, line.match(/^[A-Z\s]+$/) && line.length < 30 ? "bold" : "normal");
          doc.text(line || " ", 20, y);
          y += 5;
        });
        doc.save(`${name}_Resume.pdf`);
      } else if (format === "docx") {
        download(buildHTML(), `${name}_Resume.doc`, "application/msword");
      } else if (format === "txt") {
        download(buildPlainText(), `${name}_Resume.txt`, "text/plain");
      } else if (format === "linkedin") {
        download(buildLinkedInFormat(), `${name}_LinkedIn.txt`, "text/plain");
      } else if (format === "ats") {
        download(buildATSFormat(), `${name}_ATS.txt`, "text/plain");
      } else if (format === "print") {
        const w = window.open("", "_blank");
        w.document.write(buildHTML());
        w.document.close();
        w.print();
      }
    } catch (e) {}
    setExporting(null);
  };

  const options = [
    { id: "pdf", label: "PDF", desc: "Portable Document Format", icon: FileText, color: "text-red-400" },
    { id: "docx", label: "DOCX", desc: "Microsoft Word", icon: FileText, color: "text-blue-400" },
    { id: "txt", label: "Plain Text", desc: "Raw text format", icon: FileCode, color: "text-white/60" },
    { id: "linkedin", label: "LinkedIn Format", desc: "Formatted for LinkedIn", icon: Linkedin, color: "text-blue-400" },
    { id: "ats", label: "ATS Format", desc: "Parser-optimized", icon: FileCode, color: "text-emerald-400" },
    { id: "print", label: "Print Ready", desc: "Print-optimized view", icon: Printer, color: "text-indigo-400" },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2 mb-1"><Download size={14} className="text-indigo-400" /> Export Center</h3>
        <p className="text-white/30 text-xs">{activeResume ? `Exporting: ${activeResume.title}` : "No resume selected. Create or select a resume first."}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {options.map(opt => (
          <button key={opt.id} onClick={() => handleExport(opt.id)} disabled={!activeResume || exporting} className="bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 rounded-xl p-5 text-left transition-all disabled:opacity-30 group">
            <div className="flex items-center justify-between mb-3">
              <opt.icon size={20} className={opt.color} />
              {exporting === opt.id && <Loader2 size={14} className="animate-spin text-indigo-400" />}
            </div>
            <h4 className="text-white font-medium text-sm group-hover:text-indigo-400 transition-colors">{opt.label}</h4>
            <p className="text-white/30 text-xs mt-0.5">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}