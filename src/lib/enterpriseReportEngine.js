/**
 * EXECLEAD.AI — Enterprise Report Engine™ — Backward Compatibility Barrel
 * Re-exports from the modular v2.0 engine at ./reports/enterpriseReportEngine.
 * Existing imports from @/lib/enterpriseReportEngine continue to work.
 */
export {
  generatePDF,
  downloadPDF,
  printReport,
  downloadJSON,
  downloadCSV,
  generateExecAnalysis,
  buildReportId,
  REPORT_TYPES,
  safe,
  sanitize,
  toneFromScore,
  simpleHash,
} from "./reports/enterpriseReportEngine";