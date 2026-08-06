/**
 * Founding Member Program™ — Three-Wave Launch Strategy
 * ------------------------------------------------------
 * Staged, invite-driven rollout replacing the single "100 spots" model.
 *
 *   Wave 1 — Founder Circle™          · 25  · Invitation Only
 *   Wave 2 — Founding Beta™            · 50  · Invitation Required (unlocks at 25)
 *   Wave 3 — Founding Private Beta™     · 100 · Private Beta      (unlocks at 75)
 *   GA    — General Availability        · Enterprise Launch      (unlocks at 175)
 *
 * Progression is automatic and derived purely from the live accepted-member count —
 * no persisted "current wave" state to flip. When a wave fills, the resolver simply
 * returns the next wave on the next render.
 */

export const FOUNDING_WAVES = [
  {
    id: 'wave1',
    waveNumber: 1,
    name: 'Founder Circle™',
    capacity: 25,
    access: 'Invitation Only',
    accessType: 'invitation_only',
    tagline: 'White-Glove Onboarding · Direct Founder Collaboration',
    positioning:
      'The inner circle of executive leaders who help shape EXECLEAD.AI from day one — working directly with the founder to validate the platform, calibrate Executive Readiness™, and refine every AI capability.',
    benefits: [
      { title: 'Highest Priority Support', desc: 'Direct, white-glove access to the founding and engineering team.' },
      { title: 'Founder Feedback Sessions', desc: 'Private sessions shaping product direction and AI quality.' },
      { title: 'Direct Roadmap Influence', desc: 'Your priorities directly shape the platform roadmap.' },
      { title: 'Early AI Capabilities', desc: 'First access to new EXEC™ AI capabilities as they ship.' },
      { title: 'Private Founder Community', desc: 'A curated circle of executive leaders building the future.' },
      { title: 'Recognition as Founder Circle™', desc: 'Permanent distinction as a Founder Circle™ member.' },
    ],
  },
  {
    id: 'wave2',
    waveNumber: 2,
    name: 'Founding Beta™',
    capacity: 50,
    access: 'Invitation Required',
    accessType: 'invitation_required',
    tagline: 'Broader Leadership Validation · Billing & Simulations',
    positioning:
      'An expanded cohort of executive leaders driving broader validation — refining AI coaching, validating billing, and producing the testimonials and case studies that define EXECLEAD.AI.',
    benefits: [
      { title: 'Priority Support', desc: 'Responsive, high-touch support throughout the beta.' },
      { title: 'Roadmap Voting', desc: 'Weighted influence on upcoming capabilities.' },
      { title: 'Beta Feature Previews', desc: 'Early previews of forthcoming modules.' },
      { title: 'Founding Pricing', desc: 'Locked-in founding pricing, protected for life.' },
      { title: 'Private Community', desc: 'Access to the private founding community.' },
    ],
  },
  {
    id: 'wave3',
    waveNumber: 3,
    name: 'Founding Private Beta™',
    capacity: 100,
    access: 'Private Beta',
    accessType: 'private_beta',
    tagline: 'Enterprise Readiness · Platform Scale',
    positioning:
      'The final founding wave — validating enterprise readiness, platform scale, and community expansion ahead of General Availability.',
    benefits: [
      { title: 'Early Access', desc: 'Early access to enterprise-grade capabilities.' },
      { title: 'Founding Pricing', desc: 'Founding pricing preserved through launch.' },
      { title: 'Community Access', desc: 'Full access to the founding community.' },
      { title: 'Platform Previews', desc: 'Previews of the launch-ready platform.' },
    ],
  },
];

export const TOTAL_FOUNDING_CAPACITY = FOUNDING_WAVES.reduce((s, w) => s + w.capacity, 0); // 175

/** Cumulative accepted threshold that must be reached before a wave index unlocks. */
export function getCumulativeThreshold(waveIndex) {
  return FOUNDING_WAVES.slice(0, waveIndex).reduce((s, w) => s + w.capacity, 0);
}

/**
 * Resolve the active wave from the live accepted-member count.
 * Auto-progression: Wave 1 → 2 at 25, → 3 at 75, → GA at 175.
 */
export function getActiveWave(acceptedCount) {
  const a = acceptedCount || 0;
  if (a >= TOTAL_FOUNDING_CAPACITY) return { phase: 'ga', wave: null, index: FOUNDING_WAVES.length };
  if (a >= getCumulativeThreshold(2)) return { phase: 'wave', wave: FOUNDING_WAVES[2], index: 2 };
  if (a >= getCumulativeThreshold(1)) return { phase: 'wave', wave: FOUNDING_WAVES[1], index: 1 };
  return { phase: 'wave', wave: FOUNDING_WAVES[0], index: 0 };
}

/** Progress within a single wave (accepted-in-wave / capacity / remaining / pct). */
export function getWaveProgress(acceptedCount, waveIndex) {
  const a = acceptedCount || 0;
  const wave = FOUNDING_WAVES[waveIndex];
  const prev = getCumulativeThreshold(waveIndex);
  const acceptedInWave = Math.max(0, Math.min(wave.capacity, a - prev));
  const remaining = Math.max(0, wave.capacity - acceptedInWave);
  const pct = wave.capacity > 0 ? Math.round((acceptedInWave / wave.capacity) * 100) : 0;
  return { acceptedInWave, capacity: wave.capacity, remaining, pct };
}

export const FOUNDING_WAVE_MESSAGING = {
  badge: 'Founding Member Program™',
  headline: 'Become a Founding Member of EXECLEAD.AI',
  subheading:
    "Join a carefully selected community of executive leaders helping shape the world's first AI Executive Leadership Operating System™.",
};

/** Full roadmap (all waves + GA) for the timeline display. Future waves render locked. */
export const FOUNDING_ROADMAP = [
  ...FOUNDING_WAVES.map((w) => ({ id: w.id, label: w.name, capacity: w.capacity, isWave: true })),
  { id: 'ga', label: 'General Availability', capacity: null, sub: 'Enterprise Launch', isWave: false },
];