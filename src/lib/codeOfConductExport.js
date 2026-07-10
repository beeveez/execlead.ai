import { jsPDF } from 'jspdf';
import { CODE_VERSION, CODE_LAST_UPDATED, SECTIONS } from './codeOfConductContent';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function generateCodeOfConductPDF() {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = 20;

  const addText = (text, fontSize, bold, gap) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text || '', pageWidth - 2 * margin);
    for (const line of lines) {
      if (y > pageHeight - 25) { doc.addPage(); y = 20; }
      doc.text(line, margin, y);
      y += fontSize * 0.5 + (gap || 3);
    }
  };

  const addItems = (items, prefix) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    for (const item of items) {
      const lines = doc.splitTextToSize(`${prefix || '\u2022'} ${item}`, pageWidth - 2 * margin - 5);
      for (let i = 0; i < lines.length; i++) {
        if (y > pageHeight - 25) { doc.addPage(); y = 20; }
        doc.text(lines[i], margin + (i === 0 ? 5 : 8), y);
        y += 5;
      }
    }
    y += 2;
  };

  addText('EXECLEAD.AI', 18, true, 2);
  addText('Executive Code of Conduct', 14, true, 2);
  addText(`Version ${CODE_VERSION}  |  Last Updated: ${formatDate(CODE_LAST_UPDATED)}`, 9, false, 8);

  for (const section of SECTIONS) {
    if (y > pageHeight - 40) { doc.addPage(); y = 20; }
    addText(section.title.toUpperCase(), 11, true, 4);

    if (section.type === 'paragraph' || section.type === 'pledge') {
      addText(section.content, 10, false, 6);
    } else if (section.type === 'tags') {
      if (section.intro) addText(section.intro, 10, false, 3);
      addItems(section.items, '\u2022');
      y += 3;
    } else if (section.type === 'checklist') {
      addItems(section.items, '\u2714');
      y += 3;
    } else if (section.type === 'xlist') {
      addItems(section.items, '\u2718');
      y += 3;
    } else if (section.type === 'two-column') {
      addText(section.leftTitle, 10, true, 2);
      addItems(section.leftItems, '+');
      addText(section.rightTitle, 10, true, 2);
      addItems(section.rightItems, '-');
      y += 3;
    } else if (section.type === 'info' || section.type === 'list') {
      if (section.intro) addText(section.intro, 10, false, 3);
      addItems(section.items, '\u2022');
      if (section.note) { doc.setTextColor(180, 80, 20); addText(section.note, 9, false, 6); doc.setTextColor(0, 0, 0); }
      y += 3;
    }
  }

  doc.save(`EXECLEAD-Code-of-Conduct-v${CODE_VERSION}.pdf`);
}

export function printCodeOfConduct() {
  let html = `<!DOCTYPE html><html><head><title>EXECLEAD.AI - Executive Code of Conduct v${CODE_VERSION}</title><style>`;
  html += `body{font-family:-apple-system,system-ui,sans-serif;padding:40px;color:#222;line-height:1.6;max-width:800px;margin:0 auto;}`;
  html += `h1{font-size:22px;margin-bottom:2px;}h2{font-size:14px;margin-top:24px;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #eee;padding-bottom:4px;}`;
  html += `.meta{font-size:11px;color:#666;margin-bottom:24px;}.pledge{font-style:italic;padding:16px;background:#f5f5f5;border-radius:8px;margin:8px 0;}`;
  html += `.tags{display:flex;flex-wrap:wrap;gap:6px;}.tag{padding:4px 12px;background:#f0f0f0;border-radius:12px;font-size:12px;}`;
  html += `ul{padding-left:20px;}li{margin-bottom:3px;font-size:13px;}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;}`;
  html += `.col{padding:12px;border-radius:8px;}.col-pos{background:#f0fdf4;}.col-neg{background:#fef2f2;}h4{font-size:12px;margin:0 0 6px;}`;
  html += `.info{padding:12px;background:#eff6ff;border-radius:8px;}.note{color:#c2410c;font-size:12px;margin-top:8px;font-style:italic;}`;
  html += `</style></head><body>`;
  html += `<h1>EXECLEAD.AI</h1><h2 style="margin-top:0;border:none">Executive Code of Conduct</h2>`;
  html += `<div class="meta">Version ${CODE_VERSION} &nbsp;|&nbsp; Last Updated: ${formatDate(CODE_LAST_UPDATED)}</div>`;

  for (const section of SECTIONS) {
    html += `<h2>${section.title}</h2>`;
    if (section.type === 'paragraph' || section.type === 'pledge') {
      html += `<p${section.type === 'pledge' ? ' class="pledge"' : ''}>${(section.content || '').replace(/\n/g, '<br>')}</p>`;
    } else if (section.type === 'tags') {
      if (section.intro) html += `<p>${section.intro}</p>`;
      html += '<div class="tags">';
      for (const item of section.items) html += `<span class="tag">${item}</span>`;
      html += '</div>';
    } else if (section.type === 'checklist') {
      html += '<ul>';
      for (const item of section.items) html += `<li>&#10004; ${item}</li>`;
      html += '</ul>';
    } else if (section.type === 'xlist') {
      html += '<ul>';
      for (const item of section.items) html += `<li>&#10008; ${item}</li>`;
      html += '</ul>';
    } else if (section.type === 'two-column') {
      html += '<div class="two-col">';
      html += `<div class="col col-pos"><h4>&#8593; ${section.leftTitle}</h4><ul>`;
      for (const item of section.leftItems) html += `<li>${item}</li>`;
      html += '</ul></div>';
      html += `<div class="col col-neg"><h4>&#8595; ${section.rightTitle}</h4><ul>`;
      for (const item of section.rightItems) html += `<li>${item}</li>`;
      html += '</ul></div></div>';
    } else if (section.type === 'info' || section.type === 'list') {
      if (section.intro) html += `<p>${section.intro}</p>`;
      html += section.type === 'info' ? '<div class="info"><ul>' : '<ul>';
      for (const item of section.items) html += `<li>${item}</li>`;
      html += section.type === 'info' ? '</ul></div>' : '</ul>';
      if (section.note) html += `<p class="note">${section.note}</p>`;
    }
  }

  html += '</body></html>';

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}