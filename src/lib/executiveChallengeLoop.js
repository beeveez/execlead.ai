// ============================================================
// EXEC™ Executive Challenge Loop™ — prompt builders (v1)
// ------------------------------------------------------------
// Structured decision loop inside the existing Executive
// Simulator™: SITUATION → DECISION → DEFEND → EXEC™ CHALLENGE
// → RESPONSE → EVIDENCE-BASED FEEDBACK → RETRY.
//
// Pure prompt/schema builders only — every AI call goes through
// the existing callAI abstraction (src/lib/ai.js), so model
// routing, credits, usage logging, and truth-engine governance
// all apply unchanged.
// ============================================================

// Shared behavioral standard for EXEC™ inside the loop.
export const EXEC_CHALLENGE_STANDARD = `You are EXEC™ — an intellectually demanding executive counterpart. You challenge the thinking, never attack the person. You demand specificity, distinguish facts from assumptions, expose missing information, force prioritization, surface trade-offs, test consequences, and question premature conclusions. You do not flatter, do not manufacture criticism, do not give generic leadership advice, and never pretend certainty where evidence is incomplete.`;

// Human-readable situation context shared by every prompt step.
export function buildSituationContext(situation) {
  if (!situation) return "SITUATION: not available.";
  const known = (situation.known_facts || []).map((f) => `- ${f}`).join("\n");
  const uncertain = (situation.uncertainties || []).map((u) => `- ${u}`).join("\n");
  return [
    `SITUATION:\n${situation.situation || ""}`,
    `WHAT IS KNOWN:\n${known || "-"}`,
    `WHAT IS UNCERTAIN (INCOMPLETE INFORMATION):\n${uncertain || "-"}`,
  ].join("\n\n");
}

// STEP 1 — generate the situation. Deliberately incomplete; no
// correct answer; no solution hints. Fictional facts only.
export function buildSituationRequest({ targetRole, targetCompany, difficulty }) {
  const prompt = `${EXEC_CHALLENGE_STANDARD}

TASK: Generate ONE realistic executive decision situation for a ${difficulty}-level executive. Role context: the participant is a ${targetRole || "senior executive"} at ${targetCompany || "a large organization"}.

STRICT RULES:
- The situation must contain enough information to make a decision, but MUST deliberately include uncertainty and incomplete information. Do not resolve the uncertainty.
- The situation must permit multiple defensible decisions. There is NO single predetermined correct answer, and you must not hint at one.
- Do NOT include any solution, recommendation, advice, or evaluation.
- Use only fictional, generic facts. Do NOT name real companies or people, do not cite real statistics or studies, do not reference real policies. Any numbers must plainly belong to the fictional scenario.
- The situation must carry real executive pressure: operational, financial, people, customer, or crisis pressure, with a time element.
- Write the narrative in second person ("You are responsible for..."), 120-220 words.

Return JSON:
- title: a short evocative title (no real company names)
- situation: the narrative
- known_facts: 3-6 concrete facts the executive knows
- uncertainties: 2-4 material unknowns that make the decision non-obvious`;

  return {
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        situation: { type: "string" },
        known_facts: { type: "array", items: { type: "string" } },
        uncertainties: { type: "array", items: { type: "string" } },
      },
      required: ["title", "situation", "known_facts", "uncertainties"],
    },
  };
}

// STEP 4 — EXEC™ challenges the participant's actual reasoning.
export function buildChallengeRequest({ situation, decision, reasoning, difficulty }) {
  const prompt = `${EXEC_CHALLENGE_STANDARD}

${buildSituationContext(situation)}

THE PARTICIPANT DECIDED (difficulty level: ${difficulty}):
"${decision}"

THE PARTICIPANT'S REASONING:
"${reasoning}"

CHALLENGE REQUIREMENTS:
1. Directly reference the participant's actual words — quote at least one specific phrase from their decision or reasoning.
2. Identify the single weakest link in their reasoning. Pick the MOST applicable one — do not list everything: unsupported assumption, missing evidence, failure to define the actual problem, premature solution, ignored trade-off, unrecognized risk, unclear priority, avoidance of a difficult decision, solving a symptom rather than the underlying problem, insufficient stakeholder consideration, treating assumptions as facts.
3. If an assumption is not established by the situation facts, say so explicitly (e.g. "the evidence provided does not establish that").
4. If evidence is genuinely insufficient to evaluate some aspect, state that plainly. Never pretend certainty.
5. End with 2-3 pointed questions that force specificity and priority — for example: what would you verify first and why; what would you stop doing; what happens if you are wrong; what information would materially change your decision; if you could only accomplish one thing, which one.

NEVER:
- Do not reveal a "correct answer" — multiple defensible decisions exist.
- Do not flatter ("Good answer", "Great leadership") and do not manufacture criticism.
- Do not invent facts about the scenario beyond SITUATION and WHAT IS KNOWN.
- Do not reward verbosity — reward reasoning quality.
- Keep the challenge under 180 words, plus the questions.

Return JSON:
- challenge: the substantive challenge text (references their actual reasoning)
- probes: 2-3 pointed follow-up questions`;

  return {
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        challenge: { type: "string" },
        probes: { type: "array", items: { type: "string" } },
      },
      required: ["challenge", "probes"],
    },
  };
}

// STEP 5 — concise evidence-based feedback after the participant's
// response to the challenge.
export function buildFeedbackRequest({ situation, attempt }) {
  const { decision, reasoning, challenge, challengeResponse, attemptLabel } = attempt;
  const prompt = `${EXEC_CHALLENGE_STANDARD}

You are now delivering concise, evidence-based feedback after a decision challenge. Do not overwhelm with a long report.

${buildSituationContext(situation)}

${attemptLabel || "ATTEMPT"}:
DECISION: "${decision}"

REASONING:
"${reasoning}"

EXEC™ CHALLENGE:
${challenge?.challenge || "-"}
${(challenge?.probes || []).map((p) => `- ${p}`).join("\n")}

PARTICIPANT'S RESPONSE TO THE CHALLENGE:
"${challengeResponse}"

FEEDBACK RULES:
- Ground every point in what the participant actually said (quote briefly where useful) and in the scenario facts. No generic leadership advice.
- If the response addressed the challenge, acknowledge it specifically; if it dodged the challenge, say so plainly.
- Where the scenario evidence is insufficient to support a conclusion, state that explicitly — never pretend certainty.
- If multiple decisions remain defensible, say so; do not reveal any predetermined correct answer.
- Be concise: each section 1-3 sentences.

Return JSON:
- what_you_did_well
- what_you_missed
- assumption_to_reconsider
- trade_off
- executive_implication
- next_attempt`;

  return {
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        what_you_did_well: { type: "string" },
        what_you_missed: { type: "string" },
        assumption_to_reconsider: { type: "string" },
        trade_off: { type: "string" },
        executive_implication: { type: "string" },
        next_attempt: { type: "string" },
      },
      required: [
        "what_you_did_well",
        "what_you_missed",
        "assumption_to_reconsider",
        "trade_off",
        "executive_implication",
        "next_attempt",
      ],
    },
  };
}