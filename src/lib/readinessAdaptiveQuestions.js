// Adaptive Question Engine™
// Role-specific question banks for the Executive Readiness Assessment™.
// 4 adaptive questions per leadership path, scored in a dedicated `role_specific`
// category. Universal competencies (the 5 existing categories) remain identical
// across every path; only these 4 questions adapt.

export const ROLE_CATEGORY = {
  key: 'role_specific',
  label: 'Role-Specific Readiness',
  color: '#a855f7',
  desc: 'Competencies unique to your selected leadership path.',
};

// Map of non-primary tracks to a primary adaptive bank so every path has 4
// adaptive questions without duplicating content.
const TRACK_ALIAS = {
  digital_transformation: 'technology',
  product: 'business',
};

const T = (id, type, question, options) => ({ id, category: 'role_specific', type, question, options });

export const ADAPTIVE_QUESTIONS = {
  technology: [
    T(101, 'scenario', 'The Board has reduced your digital transformation budget by 25%. How do you respond?', [
      { label: 'Re-baseline the roadmap by ROI, protect the highest-value bets, and reset expectations with the Board', score: 4 },
      { label: 'Spread the cut evenly across every initiative to be fair', score: 1 },
      { label: 'Pause transformation and resume when budget returns', score: 0 },
      { label: 'Push the team to deliver the same scope for less', score: 2 },
    ]),
    T(102, 'scenario', 'A critical cybersecurity vulnerability is disclosed in your core platform. Your first executive action?', [
      { label: 'Convene incident leadership, assess blast radius, and brief the CEO and Board within 24 hours', score: 4 },
      { label: 'Let the security team handle it and review at the next QBR', score: 1 },
      { label: 'Issue a public statement before understanding impact', score: 0 },
      { label: 'Quietly patch it without escalating', score: 2 },
    ]),
    T(103, 'likert', 'I can articulate an enterprise AI strategy tied to measurable business outcomes.', [
      { label: 'Almost always', score: 4 }, { label: 'Often', score: 3 }, { label: 'Sometimes', score: 2 }, { label: 'Rarely', score: 1 }, { label: 'Almost never', score: 0 },
    ]),
    T(104, 'scenario', 'You must choose between two major technology investments with a limited budget. You:', [
      { label: 'Score both on strategic fit, risk, and ROI, then decide with a review checkpoint', score: 4 },
      { label: 'Pick the one your strongest engineer prefers', score: 1 },
      { label: 'Fund both at half-measure to hedge', score: 2 },
      { label: 'Defer until next fiscal year', score: 0 },
    ]),
  ],
  business: [
    T(201, 'scenario', 'Your business unit must double revenue in 18 months without proportional headcount. Your first move:', [
      { label: 'Re-architect the operating model for leverage before scaling activity', score: 4 },
      { label: 'Add sales headcount and push harder', score: 2 },
      { label: 'Cut prices to win volume', score: 1 },
      { label: 'Set the target and let the team figure it out', score: 0 },
    ]),
    T(202, 'likert', 'I design operating rhythms that surface bottlenecks before they become crises.', [
      { label: 'Almost always', score: 4 }, { label: 'Often', score: 3 }, { label: 'Sometimes', score: 2 }, { label: 'Rarely', score: 1 }, { label: 'Almost never', score: 0 },
    ]),
    T(203, 'scenario', 'A core market is commoditizing. You lead with:', [
      { label: 'A repositioning around a higher-value segment and a 12-month migration plan', score: 4 },
      { label: 'Deeper discounts to defend share', score: 1 },
      { label: 'Acquire a competitor to consolidate', score: 2 },
      { label: 'Wait for the cycle to reverse', score: 0 },
    ]),
    T(204, 'scenario', 'You must reduce operational costs without affecting business growth. You:', [
      { label: 'Diagnose unit economics, cut what doesn\'t scale, and reinvest the savings into growth', score: 4 },
      { label: 'Across-the-board 10% cut', score: 1 },
      { label: 'Freeze hiring everywhere', score: 2 },
      { label: 'Defer the decision a quarter', score: 0 },
    ]),
  ],
  finance: [
    T(301, 'scenario', 'You must allocate $10M across three competing growth initiatives. Your framework:', [
      { label: 'Risk-adjusted ROI, strategic fit, and a stage-gated funding model with clear KPIs', score: 4 },
      { label: 'Split evenly to keep everyone happy', score: 1 },
      { label: 'Back the loudest executive sponsor', score: 0 },
      { label: 'Fund the safest option only', score: 2 },
    ]),
    T(302, 'likert', 'I can defend my capital allocation strategy to the Board in ROI terms.', [
      { label: 'Almost always', score: 4 }, { label: 'Often', score: 3 }, { label: 'Sometimes', score: 2 }, { label: 'Rarely', score: 1 }, { label: 'Almost never', score: 0 },
    ]),
    T(303, 'scenario', 'Cash flow tightens unexpectedly. Your first executive action:', [
      { label: 'Model the 13-week cash forecast, identify the driver, and act on the highest-leverage lever', score: 4 },
      { label: 'Cut all discretionary spend immediately', score: 2 },
      { label: 'Draw down credit without diagnosing the cause', score: 1 },
      { label: 'Wait for next month\'s close to assess', score: 0 },
    ]),
    T(304, 'scenario', 'A high-growth business unit is burning cash. You:', [
      { label: 'Tie further funding to milestone-based gates and a path to contribution margin', score: 4 },
      { label: 'Shut it down to protect the core', score: 1 },
      { label: 'Fund it fully — growth is the priority', score: 2 },
      { label: 'Reassign its leader', score: 0 },
    ]),
  ],
  hr: [
    T(401, 'scenario', 'Your top three leaders could all leave within a year. Your succession move:', [
      { label: 'Build a documented succession bench with readiness assessments and development plans now', score: 4 },
      { label: 'Retain them with counter-offers when they threaten to leave', score: 1 },
      { label: 'Hope they stay — succession is a future problem', score: 0 },
      { label: 'Promote the most tenured person regardless of readiness', score: 2 },
    ]),
    T(402, 'likert', 'I can design a workforce plan tied to the 3-year business strategy.', [
      { label: 'Almost always', score: 4 }, { label: 'Often', score: 3 }, { label: 'Sometimes', score: 2 }, { label: 'Rarely', score: 1 }, { label: 'Almost never', score: 0 },
    ]),
    T(403, 'scenario', 'A toxic subculture is eroding performance in a critical team. You:', [
      { label: 'Diagnose the root, hold the leader accountable, and set a 90-day culture intervention', score: 4 },
      { label: 'Transfer the complainers out', score: 1 },
      { label: 'Run a generic engagement survey and wait', score: 2 },
      { label: 'Replace the team lead without diagnosis', score: 0 },
    ]),
    T(404, 'scenario', 'You must reduce workforce cost without destroying capability. You:', [
      { label: 'Redesign work to remove duplication, then right-size with retained critical capability', score: 4 },
      { label: 'Lay off the newest hires first', score: 1 },
      { label: 'Across-the-board reduction', score: 2 },
      { label: 'Offer voluntary unpaid leave', score: 0 },
    ]),
  ],
  sales_marketing: [
    T(501, 'scenario', 'Your largest customer threatens to leave over pricing. Your executive response:', [
      { label: 'Re-frame the value conversation around outcomes and ROI before negotiating price', score: 4 },
      { label: 'Match the competitor\'s price immediately', score: 1 },
      { label: 'Let them leave — principles matter', score: 0 },
      { label: 'Escalate to the CEO to save it', score: 2 },
    ]),
    T(502, 'likert', 'I can frame our go-to-market strategy in terms of customer lifetime value.', [
      { label: 'Almost always', score: 4 }, { label: 'Often', score: 3 }, { label: 'Sometimes', score: 2 }, { label: 'Rarely', score: 1 }, { label: 'Almost never', score: 0 },
    ]),
    T(503, 'scenario', 'A new market opens but requires a channel you\'ve never operated. You:', [
      { label: 'Run a lean market test with clear learning KPIs before committing scale', score: 4 },
      { label: 'Commit fully to win first-mover advantage', score: 2 },
      { label: 'Wait for a competitor to validate the channel', score: 0 },
      { label: 'Partner broadly and hope', score: 1 },
    ]),
    T(504, 'scenario', 'Sales missed the quarter by 15%. Your first executive action:', [
      { label: 'Diagnose pipeline health, conversion stages, and deal mix before acting', score: 4 },
      { label: 'Push a discount blitz to close the gap', score: 1 },
      { label: 'Replace the VP of Sales', score: 0 },
      { label: 'Reset next quarter\'s target down', score: 2 },
    ]),
  ],
  healthcare: [
    T(601, 'scenario', 'A patient safety issue has become public. What is your first executive action?', [
      { label: 'Lead with transparency, convene clinical leadership, and commit to a published remediation timeline', score: 4 },
      { label: 'Issue a legal-approved minimal statement', score: 2 },
      { label: 'Deny scope until facts are confirmed', score: 0 },
      { label: 'Brief the board and hold external comment', score: 1 },
    ]),
    T(602, 'likert', 'I can balance clinical quality with operational and financial pressure.', [
      { label: 'Almost always', score: 4 }, { label: 'Often', score: 3 }, { label: 'Sometimes', score: 2 }, { label: 'Rarely', score: 1 }, { label: 'Almost never', score: 0 },
    ]),
    T(603, 'scenario', 'A regulatory change threatens your service line economics. You:', [
      { label: 'Model the impact, engage regulators early, and re-architect the service model', score: 4 },
      { label: 'Lobby against the change', score: 1 },
      { label: 'Exit the service line', score: 2 },
      { label: 'Absorb the cost and protect volume', score: 0 },
    ]),
    T(604, 'scenario', 'You must lead a transformation that clinicians resist. You:', [
      { label: 'Co-design with clinical champions, tie change to patient outcomes, and phase the rollout', score: 4 },
      { label: 'Mandate compliance from the top', score: 1 },
      { label: 'Slow down until consensus emerges', score: 2 },
      { label: 'Replace resistant clinical leaders', score: 0 },
    ]),
  ],
  education: [
    T(701, 'scenario', 'Faculty resists a strategic curriculum change the board has mandated. You:', [
      { label: 'Build a faculty coalition, pilot the change, and tie it to student outcomes evidence', score: 4 },
      { label: 'Mandate the change and enforce', score: 1 },
      { label: 'Defer to faculty governance indefinitely', score: 0 },
      { label: 'Replace the resistant department', score: 2 },
    ]),
    T(702, 'likert', 'I can align academic strategy with institutional financial sustainability.', [
      { label: 'Almost always', score: 4 }, { label: 'Often', score: 3 }, { label: 'Sometimes', score: 2 }, { label: 'Rarely', score: 1 }, { label: 'Almost never', score: 0 },
    ]),
    T(703, 'scenario', 'Enrollment is declining. Your first executive action:', [
      { label: 'Diagnose demand by segment, value proposition, and cost-to-serve before reallocating', score: 4 },
      { label: 'Cut tuition to boost volume', score: 1 },
      { label: 'Increase marketing spend broadly', score: 2 },
      { label: 'Wait for demographic cycles to reverse', score: 0 },
    ]),
    T(704, 'scenario', 'You must invest in educational technology with a limited budget. You:', [
      { label: 'Prioritize the highest-learning-impact platforms with a measured adoption plan', score: 4 },
      { label: 'Buy the most expensive platform to signal commitment', score: 1 },
      { label: 'Defer all edtech investment', score: 0 },
      { label: 'Let each department choose its own', score: 2 },
    ]),
  ],
  government: [
    T(801, 'scenario', 'A public mandate requires major service transformation under a fixed budget. You:', [
      { label: 'Sequence the transformation around citizen impact, phase funding, and govern by milestones', score: 4 },
      { label: 'Attempt the full scope simultaneously', score: 1 },
      { label: 'Push back on the mandate', score: 0 },
      { label: 'Outsource everything to a vendor', score: 2 },
    ]),
    T(802, 'likert', 'I can navigate stakeholder accountability across political and operational lines.', [
      { label: 'Almost always', score: 4 }, { label: 'Often', score: 3 }, { label: 'Sometimes', score: 2 }, { label: 'Rarely', score: 1 }, { label: 'Almost never', score: 0 },
    ]),
    T(803, 'scenario', 'A public service failure becomes a media story. Your first executive action:', [
      { label: 'Own it publicly, publish the root cause, and commit to a remediation timeline', score: 4 },
      { label: 'Issue a defensive statement', score: 0 },
      { label: 'Wait for the news cycle to pass', score: 1 },
      { label: 'Blame the contractor', score: 2 },
    ]),
    T(804, 'scenario', 'You must reallocate resources across competing public priorities. You:', [
      { label: 'Score priorities on citizen impact and cost-effectiveness, then decide transparently', score: 4 },
      { label: 'Spread cuts evenly', score: 1 },
      { label: 'Protect the loudest constituency', score: 0 },
      { label: 'Defer the reallocation', score: 2 },
    ]),
  ],
  custom: [
    T(901, 'scenario', 'Your board challenges your 12-month strategy. Your executive response:', [
      { label: 'Re-anchor the strategy to enterprise outcomes, surface assumptions, and offer a review checkpoint', score: 4 },
      { label: 'Defend the plan as written', score: 1 },
      { label: 'Withdraw and rewrite quietly', score: 2 },
      { label: 'Delegate the defense to a direct report', score: 0 },
    ]),
    T(902, 'likert', 'I can translate my function\'s work into enterprise-level business outcomes.', [
      { label: 'Almost always', score: 4 }, { label: 'Often', score: 3 }, { label: 'Sometimes', score: 2 }, { label: 'Rarely', score: 1 }, { label: 'Almost never', score: 0 },
    ]),
    T(903, 'scenario', 'You inherit a team with unclear strategy. Your first 90 days:', [
      { label: 'Diagnose, co-create a focused strategy, and align the team around 3 priorities', score: 4 },
      { label: 'Announce a full restructure in week one', score: 1 },
      { label: 'Continue the existing plan without question', score: 0 },
      { label: 'Wait 90 days before acting', score: 2 },
    ]),
    T(904, 'scenario', 'You must make a high-stakes decision with incomplete information. You:', [
      { label: 'Frame the decision, assess risk, decide, and set a review checkpoint', score: 4 },
      { label: 'Wait for complete data', score: 1 },
      { label: 'Delegate upward', score: 0 },
      { label: 'Pick the safest option', score: 2 },
    ]),
  ],
};

// Role-specific focus areas woven into the 90-day roadmap (weeks 3, 6, 9, 12).
export const ROLE_FOCUS = {
  technology: ['Enterprise Architecture', 'AI Strategy', 'Cybersecurity Governance', 'Digital Transformation'],
  business: ['Operational Excellence', 'Organizational Scaling', 'Strategic Planning', 'Business Growth'],
  finance: ['Financial Strategy', 'Budget Ownership', 'Executive Reporting', 'Capital Allocation'],
  hr: ['Talent Strategy', 'Succession Planning', 'Culture Transformation', 'Workforce Planning'],
  sales_marketing: ['Revenue Growth', 'Executive Negotiation', 'Customer Strategy', 'Market Expansion'],
  healthcare: ['Clinical Governance', 'Patient Outcomes', 'Healthcare Transformation', 'Regulatory Leadership'],
  education: ['Academic Strategy', 'Institutional Leadership', 'Faculty Development', 'Educational Innovation'],
  government: ['Public Mandate Delivery', 'Stakeholder Accountability', 'Service Transformation', 'Resource Reallocation'],
  custom: ['Enterprise Strategy', 'Stakeholder Influence', 'Operational Leverage', 'Executive Decision-Making'],
};

// Role-specific coaching prompts for roadmap weeks 3, 6, 9, 12.
export const ROLE_COACHING = {
  technology: ['Draft a 1-page enterprise architecture decision with trade-offs.', 'Pitch an AI investment in ROI terms to the Board.', 'Run a cybersecurity governance tabletop with your team.', 'Present a digital-transformation re-baseline to a peer.'],
  business: ['Redesign one operating rhythm to remove a bottleneck.', 'Write a scaling plan for a function at 2x volume.', 'Draft a 12-month strategic plan on one page.', 'Build a growth model for a commoditizing market.'],
  finance: ['Defend a capital allocation across 3 initiatives to the Board.', 'Build a 13-week cash forecast and identify the top lever.', 'Present a cost-reduction plan that protects growth.', 'Design a milestone-gated funding model for a growth bet.'],
  hr: ['Build a succession bench for your top 3 roles.', 'Design a workforce plan tied to the 3-year strategy.', 'Run a culture diagnostic and 90-day intervention plan.', 'Design a right-sizing plan that retains critical capability.'],
  sales_marketing: ['Re-frame a customer conversation around outcomes, not price.', 'Model customer lifetime value for your GTM strategy.', 'Design a lean market test for a new channel.', 'Diagnose a missed quarter by pipeline stage.'],
  healthcare: ['Run a patient-safety transparency rehearsal.', 'Balance a clinical-quality vs cost decision on paper.', 'Engage a regulator early on a threatened service line.', 'Co-design a transformation with a clinical champion.'],
  education: ['Build a faculty coalition for a curriculum change.', 'Align an academic plan to financial sustainability.', 'Diagnose an enrollment decline by segment.', 'Prioritize edtech by learning impact.'],
  government: ['Sequence a public mandate transformation by citizen impact.', 'Navigate a cross-stakeholder accountability map.', 'Rehearse a public-service-failure transparency statement.', 'Score competing public priorities transparently.'],
  custom: ['Re-anchor your 12-month strategy to enterprise outcomes.', 'Translate your function\'s work into business outcomes.', 'Co-create a 3-priority strategy for an inherited team.', 'Frame a high-stakes decision with a review checkpoint.'],
};

// Build the 20-question assessment set: 16 universal + 4 adaptive.
// `universalQuestions` is injected so this module stays pure of the universal bank.
export function buildAssessmentSet(track, universalQuestions) {
  const key = TRACK_ALIAS[track] || track || 'custom';
  const adaptive = (ADAPTIVE_QUESTIONS[key] || ADAPTIVE_QUESTIONS.custom).map((q) => ({ ...q, adaptive: true }));
  return [...universalQuestions, ...adaptive];
}