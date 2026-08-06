/**
 * Brand Validation Engine™
 * ============================================================
 * Scans marketing surfaces for brand drift, legacy phrasing,
 * duplicate positioning, and approved-terminology coverage.
 *
 * Pure and side-effect free — runnable from a governance
 * dashboard, a build check, or a review script. All governed
 * terminology and legacy phrases are sourced from
 * BrandRegistry.governance, never hardcoded here.
 */
import { BrandRegistry } from '@/lib/brandRegistry';

const GOV = BrandRegistry.governance;

// Canonical registry strings that must be imported, never duplicated as literals.
const CANONICAL_STRINGS = [
  BrandRegistry.headline,
  BrandRegistry.tagline,
  BrandRegistry.mission,
  BrandRegistry.vision,
  BrandRegistry.description,
  BrandRegistry.descriptionShort,
  BrandRegistry.positioningStatement,
  BrandRegistry.positioning?.primaryStatement,
  BrandRegistry.positioning?.secondaryStatement,
  BrandRegistry.positioning?.valueProposition?.primary,
  BrandRegistry.positioning?.valueProposition?.supporting,
  BrandRegistry.positioning?.philosophy,
  BrandRegistry.brandPhilosophy,
  BrandRegistry.logoStory,
].filter(Boolean);

const SEVERITY_SCORE = { high: 0, medium: 50, low: 80, info: 100 };

/**
 * Scan a single string for brand issues.
 * @param {string} text
 * @returns {Array<{type:string, phrase?:string, severity:string, guidance:string}>}
 */
export function scanText(text) {
  if (!text || typeof text !== 'string') return [];
  const findings = [];

  for (const rule of GOV.legacyPhrases) {
    const re = new RegExp(rule.pattern, 'gi');
    if (re.test(text)) {
      findings.push({
        type: 'legacy_phrase',
        phrase: rule.pattern,
        severity: rule.severity,
        guidance: rule.guidance,
      });
    }
  }

  // Duplicate-positioning: a surface literal that exactly matches a canonical registry value.
  if (CANONICAL_STRINGS.includes(text.trim())) {
    findings.push({
      type: 'duplicate_positioning',
      severity: 'medium',
      guidance: 'Import this value from BrandRegistry instead of hardcoding the literal.',
    });
  }

  return findings;
}

/**
 * Scan a marketing surface.
 * @param {{name:string, path:string, strings:string[]}} surface
 * @returns {{name:string, path:string, findings:Array, compliant:boolean, approvedCoverage:number}}
 */
export function scanSurface(surface) {
  const findings = [];
  let approvedHits = 0;
  const stringCount = surface.strings?.length || 0;

  for (const s of surface.strings || []) {
    const f = scanText(s);
    if (f.length) findings.push(...f.map((x) => ({ ...x, excerpt: s.slice(0, 90) })));
    for (const term of GOV.approvedTerminology) {
      if (s.includes(term)) approvedHits += 1;
    }
  }

  const approvedCoverage = stringCount
    ? Math.round((approvedHits / (stringCount * GOV.approvedTerminology.length)) * 100)
    : 0;

  return {
    name: surface.name,
    path: surface.path,
    findings,
    compliant: findings.length === 0,
    approvedCoverage,
  };
}

/**
 * Compute overall Brand Compliance % across a set of surfaces.
 * Clean surfaces score 100; the worst finding severity caps a surface's score.
 * @param {Array} surfaces
 * @returns {{compliance:number, results:Array, findings:Array, total:number, compliantCount:number}}
 */
export function computeCompliance(surfaces) {
  const results = surfaces.map(scanSurface);
  const scored = results.map((r) => {
    if (!r.findings.length) return 100;
    const worst = r.findings.reduce(
      (min, f) => (SEVERITY_SCORE[f.severity] < SEVERITY_SCORE[min] ? f.severity : min),
      'high'
    );
    return SEVERITY_SCORE[worst] ?? 0;
  });
  const compliance = scored.length
    ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length)
    : 100;
  const findings = results.flatMap((r) =>
    r.findings.map((f) => ({ ...f, surface: r.name, path: r.path }))
  );
  return {
    compliance,
    results,
    findings,
    total: results.length,
    compliantCount: results.filter((r) => r.compliant).length,
  };
}

export default { scanText, scanSurface, computeCompliance };