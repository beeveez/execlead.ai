export const SITE_URL = 'https://execleadai.co';
export const DEFAULT_SOCIAL_IMAGE = 'https://media.base44.com/images/public/6a4a2bd8dcadcf2160c0a05d/c8da542d1_image.png?v=3.0';

const metadata = {
  '/': ['EXECLEAD.AI | AI Executive Leadership Operating System™', 'EXECLEAD.AI is an Executive Leadership Operating System™ helping organizations develop executive readiness, judgment, and strategic leadership.'],
  '/platform': ['Platform | EXECLEAD.AI', 'Explore the EXECLEAD.AI platform for executive readiness, leadership development, strategic judgment, simulations, and leadership intelligence.'],
  '/pricing': ['Pricing | EXECLEAD.AI', 'Explore EXECLEAD.AI membership and enterprise pricing for professionals and organizations building executive readiness and leadership capability.'],
  '/leaderboard': ['Executive Leaderboard | EXECLEAD.AI', 'Explore public executive leadership rankings and evidence-based achievement recognition on EXECLEAD.AI.'],
  '/company-library': ['Company Library | EXECLEAD.AI', 'Explore company leadership intelligence and organizational profiles in the EXECLEAD.AI public company library.'],
  '/articles': ['Executive Leadership Articles | EXECLEAD.AI', 'Read evidence-oriented insights on executive readiness, strategic judgment, leadership development, and enterprise leadership.'],
  '/success-stories': ['Executive Success Stories | EXECLEAD.AI', 'Explore public leadership development stories and evidence of executive-readiness growth on EXECLEAD.AI.'],
  '/about': ['About | EXECLEAD.AI', 'Learn about EXECLEAD.AI and its mission to help ambitious professionals and organizations develop executive readiness, strategic judgment, and leadership capability.'],
  '/contact': ['Contact | EXECLEAD.AI', 'Contact EXECLEAD.AI about executive leadership development, enterprise programs, product demonstrations, and platform questions.'],
  '/trust-center': ['Trust Center | EXECLEAD.AI', "Explore EXECLEAD.AI's security, privacy, responsible AI, governance, and enterprise trust commitments."],
  '/demo': ['Demo | EXECLEAD.AI', 'See how EXECLEAD.AI helps ambitious professionals become executive-ready leaders through AI-powered coaching, executive readiness assessments, leadership simulations, and personalized development.'],
  '/for-enterprise': ['Enterprise | EXECLEAD.AI', 'EXECLEAD.AI gives organizations an AI-powered Executive Leadership Operating System™ for executive readiness, leadership development, succession planning, strategic judgment, and enterprise leadership intelligence.'],
  '/help': ['Help Center | EXECLEAD.AI', 'Find answers and guidance for using EXECLEAD.AI executive-readiness, leadership-development, and enterprise capabilities.'],
  '/knowledge': ['Knowledge Center | EXECLEAD.AI', 'Explore trusted EXECLEAD.AI knowledge about executive readiness, leadership development, platform capabilities, security, and enterprise use.'],
  '/legal': ['Legal | EXECLEAD.AI', 'Review the legal terms, privacy information, and policies governing use of EXECLEAD.AI.'],
  '/vendor-due-diligence': ['Vendor Due Diligence | EXECLEAD.AI', 'Review EXECLEAD.AI security, privacy, governance, responsible AI, and enterprise procurement information.'],
  '/founders': ['Founding Members | EXECLEAD.AI', 'Learn about the EXECLEAD.AI founding-member community and its role in shaping evidence-based executive leadership development.'],
  '/founders-wall': ['Founders Wall | EXECLEAD.AI', 'Explore the public EXECLEAD.AI Founders Wall recognizing founding members and community milestones.'],
  '/beta': ['Private Beta | EXECLEAD.AI', 'Apply to join the EXECLEAD.AI private beta and help shape an evidence-based Executive Leadership Operating System™.'],
  '/challenge': ['Executive Challenge | EXECLEAD.AI', 'Build executive judgment through focused leadership challenges designed to strengthen decision-making and readiness.'],
  '/simulator': ['Executive Simulations | EXECLEAD.AI', 'Practice high-stakes leadership decisions with realistic executive simulations from EXECLEAD.AI.'],
  '/debate': ['Executive Debate | EXECLEAD.AI', 'Strengthen strategic judgment and executive communication through structured leadership debate practice.'],
  '/council': ['Executive Council | EXECLEAD.AI', 'Evaluate leadership decisions through multiple executive perspectives with the EXECLEAD.AI Executive Council.'],
  '/marketplace': ['Leadership Marketplace | EXECLEAD.AI', 'Explore leadership-development resources and capabilities available through the EXECLEAD.AI marketplace.'],
  '/companies': ['Company Intelligence | EXECLEAD.AI', 'Explore company profiles and leadership intelligence to support informed executive career and organizational decisions.'],
  '/companies/compare': ['Compare Companies | EXECLEAD.AI', 'Compare company leadership environments and organizational intelligence with EXECLEAD.AI.'],
  '/career': ['Executive Career Development | EXECLEAD.AI', 'Develop executive career readiness with leadership intelligence, strategic guidance, and evidence-based growth planning.'],
  '/leadership-dna': ['Leadership DNA | EXECLEAD.AI', 'Understand leadership strengths, patterns, and growth priorities with the EXECLEAD.AI Leadership DNA experience.'],
  '/executive-legacy': ['Executive Legacy | EXECLEAD.AI', 'Capture leadership philosophy, impact, and evidence to build a meaningful executive legacy over time.'],
  '/journal': ['Executive Journal | EXECLEAD.AI', 'Reflect on leadership decisions, lessons, and growth through the EXECLEAD.AI Executive Journal.'],
  '/resume': ['Resume Intelligence | EXECLEAD.AI', 'Strengthen executive positioning with evidence-based resume intelligence and leadership-career insights.'],
  '/career-studio': ['Executive Career Studio | EXECLEAD.AI', 'Build leadership-focused career materials and executive positioning with the EXECLEAD.AI Career Studio.'],
  '/succession-planning': ['Succession Planning | EXECLEAD.AI', 'Support succession planning with executive-readiness evidence, leadership capability insights, and development priorities.'],
  '/promotion-readiness': ['Promotion Readiness | EXECLEAD.AI', 'Assess leadership capability and development priorities for management, director, and executive promotion readiness.'],
  '/learning-assignments': ['Leadership Learning Assignments | EXECLEAD.AI', 'Explore structured leadership-development assignments aligned with executive readiness and organizational capability goals.'],
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