import React from "react";
import { FileDown, Printer } from "lucide-react";
import { exportToMarkdown } from "@/lib/developerPortalEngine";

function downloadMarkdown(doc) {
  const md = exportToMarkdown(doc);
  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${doc.slug || doc.title}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function printDoc(doc) {
  const md = exportToMarkdown(doc);
  const w = window.open("", "_blank");
  if (!w) return;
  const body = md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\| (.+)\n\|[-: |]+\n((?:\|.*\n?)+)/g, (m, header, rows) => {
      const h = header.split("|").filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join("");
      const body = rows.trim().split("\n").map(r =>
        `<tr>${r.split("|").filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join("")}</tr>`
      ).join("");
      return `<table><thead><tr>${h}</tr></thead><tbody>${body}</tbody></table>`;
    })
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n{2,}/g, "<br><br>");
  w.document.write(`<html><head><title>${doc.title}</title><style>
    body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.6;color:#222}
    h1{color:#4f46e5;border-bottom:2px solid #e0e7ff;padding-bottom:8px}
    h2{color:#4338ca;border-bottom:1px solid #e5e7eb;padding-bottom:4px;margin-top:24px}
    pre{background:#f4f4f5;padding:12px;border-radius:6px;overflow-x:auto;font-size:13px}
    code{font-family:monospace;font-size:13px;background:#f4f4f5;padding:2px 4px;border-radius:3px}
    pre code{background:none;padding:0}
    table{border-collapse:collapse;width:100%;font-size:13px}
    th,td{border:1px solid #e5e7eb;padding:6px 10px;text-align:left}
    th{background:#f9fafb}
    blockquote{border-left:3px solid #c7d2fe;padding-left:12px;color:#555}
    ul{padding-left:20px}
  </style></head><body>${body}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}

export default function ExportToolbar({ doc }) {
  if (!doc) return null;
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => downloadMarkdown(doc)}
        title="Export as Markdown"
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
      >
        <FileDown size={14} /> Markdown
      </button>
      <button
        onClick={() => printDoc(doc)}
        title="Print"
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
      >
        <Printer size={14} /> Print
      </button>
    </div>
  );
}