// Authorized Dependency Allowlist™ — the ONLY locations permitted to
// communicate directly with Base44 runtime APIs. Everything else is a
// business module and must consume Platform Services™ / Repository Layer™.

export const AUTHORIZED_DEPENDENCY_LIST = [
  { path: 'src/lib/platformServices/', label: 'Platform Services™', kind: 'service' },
  { path: 'src/lib/repositories/', label: 'Repository Layer™', kind: 'repository' },
  { path: 'src/lib/aiService.js', label: 'AIService™', kind: 'ai' },
  { path: 'src/lib/promptRegistry.js', label: 'Prompt Registry™', kind: 'prompt' },
  { path: 'src/lib/configurationRegistry.js', label: 'Configuration Registry™', kind: 'config' },
  { path: 'src/lib/ai.js', label: 'AI Pipeline Adapter (rich runtime pipeline)', kind: 'ai-adapter' },
  { path: 'src/api/base44Client.js', label: 'Runtime SDK Initialization', kind: 'runtime' },
  { path: 'src/lib/auth/', label: 'Authentication Adapters', kind: 'auth' },
  { path: 'src/lib/storage/', label: 'Storage Adapters', kind: 'storage' },
  { path: 'src/lib/billing/', label: 'Billing Adapters', kind: 'billing' },
  { path: 'src/lib/notifications/', label: 'Notification Adapters', kind: 'notifications' },
  { path: 'src/lib/infrastructure/', label: 'Infrastructure Utilities', kind: 'infrastructure' },
  { path: 'src/lib/runtime/', label: 'Runtime Adapters', kind: 'runtime' },
  { path: 'base44/functions/', label: 'Backend Functions (Runtime Adapters)', kind: 'runtime' },
  { path: 'base44/connectors/', label: 'Connector Adapters', kind: 'connector' },
];

export const PROHIBITED_BUSINESS_MODULES = [
  'Executive Coach™',
  'Executive Simulator™',
  'Executive Journey™',
  'Executive Readiness™',
  'Executive Identity™',
  'Executive Success Stories™',
  'Recommendation Engine™',
  'Experience Engine™',
  'Dashboard components',
  'UI pages',
  'Feature modules',
  'Business rules',
];

export function isAuthorizedPath(filePath) {
  if (!filePath) return false;
  return AUTHORIZED_DEPENDENCY_LIST.some((a) => filePath.startsWith(a.path));
}

export default { AUTHORIZED_DEPENDENCY_LIST, PROHIBITED_BUSINESS_MODULES, isAuthorizedPath };