/**
 * Preference Learning Service™
 * ============================================================
 * Extracts user preference signals from conversation history
 * and persists them so EXEC™ can adapt future responses.
 *
 * Heuristic-based — no LLM call needed. Runs after each message
 * exchange, so preferences accumulate as the user interacts.
 */

const PREF_KEY = (userId, workspace) =>
  `exec_preferences_${userId || "anon"}_${workspace || "default"}`;

const PREF_SIGNALS = [
  { id: "prefers_brief", trigger: /\b(brief|concise|short|tl;?dr|summary)\b/i, label: "Prefers brief responses" },
  { id: "prefers_detailed", trigger: /\b(detailed|in[-\s]?depth|comprehensive|deep dive|elaborate|thorough)\b/i, label: "Prefers detailed responses" },
  { id: "prefers_bullets", trigger: /\b(bullets?|bullet points?|list format|numbered)\b/i, label: "Prefers bullet-point format" },
  { id: "prefers_examples", trigger: /\b(example|real[-\s]?world|case study|show me)\b/i, label: "Wants concrete examples" },
  { id: "prefers_data", trigger: /\b(data|metrics?|numbers?|statistics?|quantify)\b/i, label: "Wants data-backed answers" },
  { id: "prefers_actionable", trigger: /\b(actionable|next steps?|what should i do|practical|tactical)\b/i, label: "Wants actionable steps" },
  { id: "prefers_strategic", trigger: /\b(strategic|big picture|vision|long[-\s]?term|high level)\b/i, label: "Prefers strategic framing" },
  { id: "prefers_casual", trigger: /\b(casual|informal|simple terms?|plain english|eli5)\b/i, label: "Prefers casual tone" },
];

/**
 * Extract preference signals from a list of messages.
 * Returns { signals: string[], topics: string[] }
 */
export function extractPreferences(messages = []) {
  const userMessages = messages
    .filter((m) => m.role === "user" && m.content)
    .map((m) => m.content);

  if (userMessages.length === 0) return { signals: [], topics: [] };

  const signals = new Set();
  for (const text of userMessages) {
    for (const sig of PREF_SIGNALS) {
      if (sig.trigger.test(text)) signals.add(sig.label);
    }
  }

  // Extract topic keywords (simple noun-ish extraction)
  const topicWords = new Set();
  const stopWords = new Set([
    "the", "a", "an", "to", "of", "in", "on", "for", "is", "are", "was",
    "were", "be", "been", "and", "or", "but", "how", "what", "why", "when",
    "can", "could", "would", "should", "do", "does", "did", "i", "me", "my",
    "we", "our", "you", "your", "it", "this", "that", "with", "about",
  ]);
  for (const text of userMessages) {
    const words = text.toLowerCase().match(/[a-z]{4,}/g) || [];
    for (const w of words) {
      if (!stopWords.has(w)) topicWords.add(w);
    }
  }

  return {
    signals: [...signals],
    topics: [...topicWords].slice(0, 10),
  };
}

/**
 * Load persisted preferences for a user + workspace.
 */
export function loadPreferences(userId, workspace) {
  try {
    const raw = localStorage.getItem(PREF_KEY(userId, workspace));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Persist preferences for a user + workspace.
 */
export function savePreferences(userId, workspace, prefs) {
  try {
    const existing = loadPreferences(userId, workspace) || { signals: [], topics: [], updatedAt: null };
    const merged = {
      signals: [...new Set([...existing.signals, ...prefs.signals])].slice(0, 20),
      topics: [...new Set([...existing.topics, ...prefs.topics])].slice(0, 20),
      messageCount: (existing.messageCount || 0) + (prefs.newMessageCount || 0),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(PREF_KEY(userId, workspace), JSON.stringify(merged));
    return merged;
  } catch {
    return prefs;
  }
}

/**
 * Clear persisted preferences (used on conversation clear).
 */
export function clearPreferences(userId, workspace) {
  try {
    localStorage.removeItem(PREF_KEY(userId, workspace));
  } catch {
    /* noop */
  }
}