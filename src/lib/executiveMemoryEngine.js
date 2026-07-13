/**
 * Executive Memory Consolidation Engine™
 * ============================================================
 * Consolidates conversation insights into long-term memory —
 * goals, aspirations, achievements, and notes persist across
 * sessions for future recall.
 *
 * This is the memory consolidation pipeline that powers the
 * Long-Term Recall™ dimension of the AI Memory Intelligence
 * Engine™.
 */

/**
 * Extract long-term memory signals from a conversation.
 * Scans user messages for goal statements, leadership aspirations,
 * notable achievements, and key decisions.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @returns {{goals: string[], aspirations: string[], achievements: string[], notes: Array<{category: string, content: string, created_at: string}>}}
 */
export function extractLongTermMemory(messages) {
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n");

  if (!userText) return { goals: [], aspirations: [], achievements: [], notes: [] };

  const now = new Date().toISOString();
  const goals = [];
  const aspirations = [];
  const achievements = [];

  // Goal patterns — "I want to...", "I'm working on...", "My goal is..."
  const goalPatterns = [
    /(?:i want to|i'm working on|my goal is|i'm aiming to|i need to|i plan to|i'm trying to|i'd like to)\s+([^.\n!?]{10,120})/gi,
  ];
  for (const pattern of goalPatterns) {
    let match;
    while ((match = pattern.exec(userText)) !== null) {
      goals.push(match[1].trim());
    }
  }

  // Aspiration patterns — leadership/career aspirations
  const aspirationPatterns = [
    /(?:i aspire to|i hope to become|i want to be|i'm working toward becoming|i'm targeting)\s+([^.\n!?]{10,120})/gi,
  ];
  for (const pattern of aspirationPatterns) {
    let match;
    while ((match = pattern.exec(userText)) !== null) {
      aspirations.push(match[1].trim());
    }
  }

  // Achievement patterns — "I recently completed...", "I achieved..."
  const achievementPatterns = [
    /(?:i (?:recently )?(?:completed|achieved|finished|launched|delivered|won|earned|published|secured|built|led)\s+([^.\n!?]{10,120}))/gi,
  ];
  for (const pattern of achievementPatterns) {
    let match;
    while ((match = pattern.exec(userText)) !== null) {
      achievements.push(match[0].trim());
    }
  }

  return {
    goals: [...new Set(goals)].slice(0, 20),
    aspirations: [...new Set(aspirations)].slice(0, 10),
    achievements: [...new Set(achievements)].slice(0, 20),
    notes: [],
  };
}

function parseArray(json) {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Merge newly extracted long-term memory into existing ExecutiveMemory fields.
 * Deduplicates and caps each array to prevent unbounded growth.
 *
 * @param {object|null} existing — The current ExecutiveMemory record
 * @param {object} extracted — Output from extractLongTermMemory()
 * @returns {object} — Partial updates for ExecutiveMemory.update()
 */
export function mergeLongTermMemory(existing, extracted) {
  const existingGoals = parseArray(existing?.goals_json);
  const existingAspirations = parseArray(existing?.aspirations_json);
  const existingAchievements = parseArray(existing?.achievements_json);
  const existingNotes = parseArray(existing?.notes_json);

  const now = new Date().toISOString();
  const newNotes = [];
  for (const goal of extracted.goals.slice(0, 3)) {
    newNotes.push({ category: "goal", content: goal, created_at: now });
  }

  return {
    goals_json: JSON.stringify([...new Set([...existingGoals, ...extracted.goals])].slice(0, 50)),
    aspirations_json: JSON.stringify([...new Set([...existingAspirations, ...extracted.aspirations])].slice(0, 30)),
    achievements_json: JSON.stringify([...new Set([...existingAchievements, ...extracted.achievements])].slice(0, 50)),
    notes_json: JSON.stringify([...existingNotes, ...newNotes].slice(-200)),
  };
}

/**
 * Check if an ExecutiveMemory record has consolidated long-term data —
 * goals, aspirations, achievements, notes, or an executive summary.
 *
 * @param {object|null} executiveMemory
 * @returns {boolean}
 */
export function hasLongTermRecall(executiveMemory) {
  if (!executiveMemory) return false;
  return (
    parseArray(executiveMemory.goals_json).length > 0 ||
    parseArray(executiveMemory.aspirations_json).length > 0 ||
    parseArray(executiveMemory.achievements_json).length > 0 ||
    parseArray(executiveMemory.notes_json).length > 0 ||
    !!executiveMemory.executive_summary
  );
}