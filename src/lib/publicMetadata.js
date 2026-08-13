export const SITE_URL = 'https://execleadai.co';
export const DEFAULT_SOCIAL_IMAGE = '/src/assets/execlead-mark.svg?v=4.0';

const metadata = {
  '/': ['EXECLEAD.AI | AI Executive Leadership Operating System™', 'EXECLEAD.AI is an Executive Leadership Operating System™ helping organizations develop executive readiness, judgment, and strategic leadership.'],
  '/platform': ['Platform | EXECLEAD.AI', 'Explore the EXECLEAD.AI platform for executive readiness, leadership development, strategic judgment, simulations, and leadership intelligence.'],
  '/pricing': ['Pricing | EXECLEAD.AI', 'Explore EXECLEAD.AI membership and enterprise pricing for professionals and organizations building executive readiness and leadership capability.'],
  '/leaderboard': ['Executive Leaderboard | EXECLEAD.AI', 'Explore public executive leadership rankings, learner achievements, featured executives, and organizational recognition on EXECLEAD.AI.'],
  '/company-library': ['Company Library | EXECLEAD.AI', 'Explore organizations and companies using executive leadership intelligence, development, and readiness capabilities through EXECLEAD.AI.'],
  '/articles': ['Executive Leadership Articles | EXECLEAD.AI', 'Explore executive leadership insights, articles, perspectives, and practical guidance from EXECLEAD.AI.'],
  '/success-stories': ['Executive Success Stories | EXECLEAD.AI', 'Explore executive leadership success stories, transformation journeys, and real-world outcomes from EXECLEAD.AI.'],
  '/about': ['About | EXECLEAD.AI', 'Learn about EXECLEAD.AI and its mission to help ambitious professionals and organizations develop executive readiness, strategic judgment, and leadership capability.'],
  '/contact': ['Contact | EXECLEAD.AI', 'Contact EXECLEAD.AI to learn more about the Executive Leadership Operating System™ and explore partnership, enterprise, or leadership development opportunities.'],
  '/trust-center': ['Trust Center | EXECLEAD.AI', "Explore EXECLEAD.AI's security, privacy, responsible AI, governance, and enterprise trust commitments."],
  '/demo': ['Demo | EXECLEAD.AI', 'See how EXECLEAD.AI helps ambitious professionals become executive-ready leaders through AI-powered coaching, executive readiness assessments, leadership simulations, and personalized development.'],
  '/for-enterprise': ['Enterprise | EXECLEAD.AI', 'EXECLEAD.AI gives organizations an AI-powered Executive Leadership Operating System™ for executive readiness, leadership development, succession planning, strategic judgment, and enterprise leadership intelligence.'],
  '/help': ['Help Center | EXECLEAD.AI', 'Explore the EXECLEAD.AI Knowledge Center for executive leadership frameworks, insights, and practical resources.'],
  '/knowledge': ['Knowledge Center | EXECLEAD.AI', 'Explore the EXECLEAD.AI Knowledge Center for executive leadership frameworks, insights, and practical resources.'],
  '/legal': ['Legal | EXECLEAD.AI', 'Review the legal terms, privacy information, and policies governing use of EXECLEAD.AI.'],
  '/vendor-due-diligence': ['Vendor Due Diligence | EXECLEAD.AI', 'Review EXECLEAD.AI security, privacy, governance, responsible AI, and enterprise procurement information.'],
  '/founders': ['Founding Members | EXECLEAD.AI', 'Learn about the EXECLEAD.AI founding-member community and its role in shaping evidence-based executive leadership development.'],
  '/founders-wall': ['Founders Wall | EXECLEAD.AI', 'Explore the public EXECLEAD.AI Founders Wall recognizing founding members and community milestones.'],
  '/beta': ['Private Beta | EXECLEAD.AI', 'Apply to join the EXECLEAD.AI private beta and help shape an evidence-based Executive Leadership Operating System™.'],
};

export const PUBLIC_METADATA = Object.fromEntries(
  Object.entries(metadata).map(([path, [title, description]]) => [path, {
    title,
    description,
    path,
    canonical: `${SITE_URL}${path === '/' ? '/' : path}`,
    image: DEFAULT_SOCIAL_IMAGE,
  }])
);

export const PUBLIC_DISCOVERY_ROUTES = Object.keys(PUBLIC_METADATA);
export const getPublicMetadata = (path = '/') => PUBLIC_METADATA[path] || PUBLIC_METADATA['/'];