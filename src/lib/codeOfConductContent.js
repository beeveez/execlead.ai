export const CODE_VERSION = "1.0";
export const CODE_LAST_UPDATED = "2026-07-10";
export const ESTIMATED_READING_TIME = 7;

export const WELCOME_MESSAGE = `Welcome to EXECLEAD.AI.

You are joining a global community of executives, founders, leaders, professionals, mentors, advisors, and future leaders.

Every interaction represents your professional reputation.

We expect the same level of professionalism here that you would demonstrate in a boardroom, executive meeting, or leadership conference.`;

export const PLEDGE_TEXT = `I commit to leading with integrity, communicating with professionalism, respecting diverse perspectives, protecting confidential information, and contributing positively to the EXECLEAD.AI community.

I understand that leadership is demonstrated through actions, not titles.

I accept responsibility for maintaining the quality, trust, and professionalism of this platform.`;

export const CORE_VALUES = [
  'Integrity', 'Respect', 'Professionalism', 'Accountability',
  'Continuous Learning', 'Servant Leadership', 'Constructive Collaboration',
  'Executive Excellence', 'Innovation', 'Trust'
];

export const EXPECTED_BEHAVIOR = [
  'Treat everyone respectfully.',
  'Encourage learning.',
  'Share experiences honestly.',
  'Offer constructive feedback.',
  'Support future leaders.',
  'Maintain executive professionalism.',
  'Respect cultural diversity.',
  'Protect confidential information.',
  'Verify information before sharing.',
  'Represent themselves authentically.'
];

export const PROHIBITED_BEHAVIOR = [
  'Harassment', 'Bullying', 'Profanity', 'Hate Speech', 'Discrimination',
  'Personal Attacks', 'Trolling', 'Intimidation', 'Threats', 'Doxxing',
  'Spam', 'Scams', 'Fraud', 'Fake Profiles', 'Impersonation',
  'Plagiarism', 'Copyright Violations', 'Sexually Explicit Content',
  'Violence', 'Illegal Activities', 'Malicious Links',
  'Political Extremism', 'Religious Hate',
  'Misinformation intended to deceive', 'Repeated disruptive behavior'
];

export const DISCUSSION_PRINCIPLES = [
  'Debate ideas.',
  'Never attack people.',
  'Support opinions with experience.',
  'Remain respectful during disagreements.',
  'Assume positive intent.',
  'Listen before responding.',
  'Seek understanding before criticism.'
];

export const CONFIDENTIALITY_ITEMS = [
  'Company confidential information',
  'Client information',
  'Personal data',
  'Financial records',
  'Legal documents',
  'Trade secrets',
  'Internal communications',
  'Restricted government information'
];

export const AI_MODERATION_CHECKS = [
  'Professional tone', 'Respectfulness', 'Toxicity', 'Bullying',
  'Profanity', 'Spam', 'Harassment', 'Threats',
  'Sensitive Information', 'Executive Tone', 'Constructiveness', 'Leadership Value'
];

export const ENFORCEMENT_ACTIONS = [
  'Educational Warning', 'Comment Removal', 'Content Removal',
  'Temporary Suspension', 'Community Restrictions',
  'Loss of Reputation Points', 'Removal of Verification',
  'Account Suspension', 'Permanent Account Ban'
];

export const REPORT_TYPES = [
  'Harassment', 'Bullying', 'Spam', 'Fake Accounts', 'Impersonation',
  'Offensive Content', 'Misinformation', 'Copyright Issues',
  'Privacy Violations', 'Other'
];

export const REPUTATION_INCREASES = [
  'Executive Reputation', 'Community Trust', 'Leadership XP',
  'Executive Ranking', 'Helpful Contributor Badge'
];

export const REPUTATION_DECREASES = [
  'Trust Score', 'Leadership Reputation',
  'Commenting Privileges', 'Publishing Privileges'
];

export const DIGITAL_SIGNATURE_FIELDS = [
  'Member ID', 'Name', 'Date', 'Time', 'IP Address',
  'Browser', 'Country', 'Platform Version',
  'Acceptance Version', 'Digital Signature Hash'
];

export const VISION_TEXT = `EXECLEAD.AI aspires to be a trusted executive leadership community.

Members should immediately recognize that this is not a traditional social platform but a professional environment where executive reputation, integrity, and respectful leadership are expected at all times.

Every interaction should reinforce the platform's mission of developing leaders who inspire trust, elevate others, and leave a lasting positive legacy.`;

export const RENEWAL_TEXT = `If Community Standards change significantly, members will be required to accept the updated version before accessing community features. Version history is maintained for audit purposes.`;

export const APPEALS_TEXT = `Members may appeal moderation decisions. Appeals are reviewed by Platform Administrators. All actions are recorded in the Audit Log.`;

export const OBJECTIVE_TEXT = `Establish EXECLEAD.AI as a professional executive leadership community by requiring every member to agree to an Executive Code of Conduct before participating in discussions, commenting, publishing, mentoring, networking, or community activities.

Unlike traditional social media, EXECLEAD.AI is built on professionalism, respect, accountability, integrity, and leadership.

Participation is a privilege earned through responsible conduct.`;

export const SECTIONS = [
  { id: 'objective', title: 'Objective', type: 'paragraph', content: OBJECTIVE_TEXT },
  { id: 'welcome', title: 'Welcome', type: 'paragraph', content: WELCOME_MESSAGE },
  { id: 'pledge', title: 'Executive Pledge', type: 'pledge', content: PLEDGE_TEXT },
  { id: 'core_values', title: 'Core Values', type: 'tags', items: CORE_VALUES },
  { id: 'expected', title: 'Expected Behavior', type: 'checklist', items: EXPECTED_BEHAVIOR },
  { id: 'prohibited', title: 'Prohibited Behavior', type: 'xlist', items: PROHIBITED_BEHAVIOR },
  { id: 'principles', title: 'Executive Discussion Principles', type: 'checklist', items: DISCUSSION_PRINCIPLES },
  { id: 'confidentiality', title: 'Confidentiality', type: 'list', intro: 'Members must never publish:', items: CONFIDENTIALITY_ITEMS, note: 'EXECLEAD.AI reserves the right to remove confidential content immediately.' },
  { id: 'ai_moderation', title: 'AI Moderation', type: 'list', intro: 'All community content is analyzed by AI before publication. AI reviews:', items: AI_MODERATION_CHECKS, note: 'Comments violating standards may be rejected automatically.' },
  { id: 'enforcement', title: 'Enforcement', type: 'list', intro: 'Violations may result in:', items: ENFORCEMENT_ACTIONS, note: 'Serious violations may bypass warning stages.' },
  { id: 'reporting', title: 'Reporting', type: 'tags', intro: 'Members can report:', items: REPORT_TYPES },
  { id: 'appeals', title: 'Appeals', type: 'paragraph', content: APPEALS_TEXT },
  { id: 'reputation', title: 'Executive Reputation', type: 'two-column', leftTitle: 'Professional participation increases', leftItems: REPUTATION_INCREASES, rightTitle: 'Poor conduct decreases', rightItems: REPUTATION_DECREASES },
  { id: 'digital_signature', title: 'Digital Signature', type: 'info', intro: 'Upon acceptance, the following information is recorded permanently for compliance:', items: DIGITAL_SIGNATURE_FIELDS },
  { id: 'renewal', title: 'Renewal', type: 'paragraph', content: RENEWAL_TEXT },
  { id: 'vision', title: 'Long-Term Vision', type: 'paragraph', content: VISION_TEXT },
];