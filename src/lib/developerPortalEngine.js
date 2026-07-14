/**
 * EXECLEAD.AI — Developer Portal™ Engine
 * ============================================================
 * Auto-generates technical documentation from the platform's
 * live registries. Documentation is always current because it
 * reads directly from the source-of-truth modules at runtime.
 *
 * Categories:
 *   Architecture, API, Entities, Navigation Registry™,
 *   Feature Flags™, Permissions, Workspace Maps,
 *   Component Relationships, Dependency Graphs, AI Engines,
 *   Data Models, Security, Privacy, Telemetry,
 *   Product Intelligence
 *
 * Each doc entry includes:
 *   Overview, Purpose, Owner, Dependencies, Related Components,
 *   Version, Last Modified, Examples, Code References
 */
import {
  PLATFORM_METADATA, MODULE_REGISTRY, FRAMEWORK_REGISTRY,
  KNOWLEDGE_PACK_REGISTRY, AI_PERSONA_REGISTRY, CAPABILITY_REGISTRY,
  FEATURE_FLAG_REGISTRY, WORKSPACE_REGISTRY, SUBSCRIPTION_REGISTRY,
} from "./platformManifest";
import { ROUTE_REGISTRY } from "./routeRegistry";
import { WORKSPACES, ROLE_PERMISSIONS, PERMISSIONS } from "./workspaces";
import { ROUTE_ACCESS } from "./roles";

const DOC_VERSION = "1.0";
const LAST_UPDATED = PLATFORM_METADATA.releaseDate || "2026-07-14";

const BACKEND_FUNCTIONS = [
  "accountDeletion", "aiWorkforce", "calculateJobMatch", "executiveEvents",
  "getAIOperations", "getProductInsights", "getScopedNotifications",
  "jobApplicationTools", "joinCommunity", "manageCodeOfConduct",
  "manageConfig", "manageELIM", "manageExecutiveWallet", "manageIdentityTransfer",
  "manageIdentityVerification", "manageIntelligence", "manageJourney",
  "manageLegacyLibrary", "manageReputation", "manageSecurityOperations",
  "manageTimeCapsule", "organizationDangerZone", "partnershipOps",
  "processReferral", "recomputeIntelligence", "reserveFoundingMembership",
  "resolveSubscription", "runProductAI", "runScheduledReports", "scimServer",
  "syncExecKnowledge", "syncJobs", "syncPlatformManifest", "testEmailConnection",
];

export const DOC_CATEGORIES = [
  { id: "architecture",       label: "Architecture",              description: "Platform modules and structural components" },
  { id: "api",                label: "API",                        description: "Backend functions and endpoints" },
  { id: "entities",           label: "Entities",                  description: "Data models and entity schemas", dynamic: true },
  { id: "navigation",        label: "Navigation Registry™",      description: "Routes and navigation structure" },
  { id: "feature-flags",     label: "Feature Flags™",             description: "Feature flags and release controls" },
  { id: "permissions",        label: "Permissions",               description: "Role-based access control" },
  { id: "workspaces",         label: "Workspace Maps",            description: "Workspace structure and organization" },
  { id: "components",         label: "Component Relationships",   description: "Module and component interconnections" },
  { id: "dependencies",       label: "Dependency Graphs",         description: "Framework and module dependency graphs" },
  { id: "ai-engines",         label: "AI Engines",                description: "AI personas, capabilities, and knowledge packs" },
  { id: "data-models",        label: "Data Models",               description: "Entity schemas and data structures", dynamic: true },
  { id: "security",           label: "Security",                 description: "Security architecture and controls" },
  { id: "privacy",            label: "Privacy",                  description: "Privacy compliance and data protection" },
  { id: "telemetry",          label: "Telemetry",                description: "Observability and event tracking" },
  { id: "product-intelligence", label: "Product Intelligence",  description: "Product analytics and insights" },
];

function doc(id, category, title, fields = {}) {
  return {
    id, slug: id, title, category,
    version: fields.version || DOC_VERSION,
    lastModified: fields.lastModified || LAST_UPDATED,
    overview: fields.overview || "",
    purpose: fields.purpose || "",
    owner: fields.owner || "Platform",
    dependencies: fields.dependencies || [],
    relatedComponents: fields.relatedComponents || [],
    sections: fields.sections || [],
    graph: fields.graph || null,
  };
}

function inferPurpose(name) {
  const parts = name.replace(/([A-Z])/g, " $1").toLowerCase().trim().split(" ");
  const verb = parts[0];
  const rest = parts.slice(1).join(" ");
  const map = {
    manage: `Manages ${rest} operations`, get: `Retrieves ${rest} data`,
    sync: `Synchronizes ${rest} data`, run: `Executes ${rest} process`,
    process: `Processes ${rest} workflow`, calculate: `Calculates ${rest} metrics`,
    reserve: `Reserves ${rest} resources`, resolve: `Resolves ${rest} state`,
    test: `Tests ${rest} connectivity`,
  };
  return map[verb] || `Handles ${parts.join(" ")} operations`;
}

function filterModules(patterns) {
  return MODULE_REGISTRY.filter(m =>
    patterns.some(p => m.route.includes(p) || m.moduleId.includes(p) || m.moduleName.toLowerCase().includes(p))
  );
}

function moduleToDoc(m, category) {
  return doc(`module-${category}-${m.moduleId}`, category, m.moduleName, {
    overview: m.description,
    purpose: m.purpose || m.description,
    owner: m.owner,
    version: m.version,
    dependencies: m.dependencies,
    relatedComponents: [...m.workspaces, m.aiPersona, m.knowledgePack].filter(Boolean),
    sections: [
      { heading: "Overview", body: m.description },
      { heading: "Key Features", body: (m.keyFeatures || []).map(f => `- ${f}`).join("\n") || "Not documented" },
      { heading: "Route", body: `\`${m.route}\`` },
      { heading: "Workspaces", body: m.workspaces.join(", ") },
      { heading: "AI Persona", body: m.aiPersona || "Default" },
      { heading: "Knowledge Pack", body: m.knowledgePack || "None assigned" },
      { heading: "Subscription Tier", body: m.subscriptionRequirements },
      { heading: "Feature Flag", body: m.featureFlag || "None" },
      { heading: "Code References", body: `Route: \`${m.route}\`\nNavigation: ${m.navigationLocation}\nStatus: ${m.status}` },
    ],
  });
}

// ============================================================
// CATEGORY GENERATORS
// ============================================================

function generateArchitectureDocs() {
  return MODULE_REGISTRY.map(m => moduleToDoc(m, "architecture"));
}

function generateApiDocs() {
  return BACKEND_FUNCTIONS.map(fn => doc(`api-${fn}`, "api", fn, {
    overview: `Backend function: ${fn}`,
    purpose: inferPurpose(fn),
    owner: "Platform Engineering",
    sections: [
      { heading: "Overview", body: `**${fn}** is a backend function deployed on the Base44 Deno runtime. It handles ${inferPurpose(fn).toLowerCase()}.` },
      { heading: "Invocation", body: `\`\`\`javascript\nimport { base44 } from "@/api/base44Client";\n\nconst response = await base44.functions.invoke('${fn}', {\n  // payload parameters\n});\n\n// Response is an Axios response object\n// Result data is in response.data\n\`\`\`` },
      { heading: "Endpoint", body: `POST \`/functions/${fn}\`` },
      { heading: "Code References", body: `Source: \`base44/functions/${fn}/entry.ts\`\nPattern: \`Deno.serve(async (req) => { ... })\`` },
    ],
  }));
}

function generateNavigationDocs() {
  return ROUTE_REGISTRY.map(r => doc(`nav-${r.url.replace(/\//g, "-")}`, "navigation", r.name, {
    overview: `Route: ${r.url}`,
    purpose: `Navigation entry for ${r.name}`,
    owner: r.owner,
    version: r.version,
    lastModified: r.lastUpdated,
    dependencies: r.feature ? [r.feature] : [],
    relatedComponents: [r.component, ...(r.navRefs || []).map(n => n.label)].filter(Boolean),
    sections: [
      { heading: "Route Path", body: `\`${r.url}\`` },
      { heading: "Component", body: r.component || "N/A" },
      { heading: "Permission", body: r.permission || "authenticated" },
      { heading: "Feature Flag", body: r.feature || "None" },
      { heading: "Plan", body: r.plan },
      { heading: "Status", body: r.status },
      { heading: "Public", body: r.public ? "Yes" : "No" },
      { heading: "Navigation References", body: (r.navRefs || []).map(n => `- ${n.label} (${n.group})`).join("\n") || "None" },
      { heading: "Code References", body: `Route: \`${r.url}\`\nComponent: \`${r.component}\`` },
    ],
  }));
}

function generateFeatureFlagDocs() {
  return FEATURE_FLAG_REGISTRY.map(f => doc(`flag-${f.featureId}`, "feature-flags", f.name, {
    overview: f.description,
    purpose: f.description,
    owner: f.workspace,
    dependencies: f.dependencies || [],
    relatedComponents: [f.routePath, f.minimumPlan].filter(Boolean),
    sections: [
      { heading: "Overview", body: f.description },
      { heading: "Flag ID", body: `\`${f.featureId}\`` },
      { heading: "Status", body: f.status },
      { heading: "Environment", body: f.environment },
      { heading: "Rollout", body: `${f.rolloutPct}%` },
      { heading: "Minimum Plan", body: f.minimumPlan },
      { heading: "Workspace", body: f.workspace },
      { heading: "Route", body: f.routePath ? `\`${f.routePath}\`` : "N/A" },
      { heading: "Beta", body: f.beta ? "Yes" : "No" },
      { heading: "GA", body: f.ga ? "Yes" : "No" },
      { heading: "Deprecated", body: f.deprecated ? "Yes" : "No" },
    ],
  }));
}

function generatePermissionDocs() {
  const roleDocs = Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => doc(`perm-role-${role}`, "permissions", `Role: ${role}`, {
    overview: `Permission set for the ${role} role`,
    purpose: `Defines what the ${role} role can access and modify`,
    owner: "Platform Security",
    dependencies: [],
    relatedComponents: perms,
    sections: [
      { heading: "Overview", body: `The **${role}** role has the following permissions:` },
      { heading: "Permissions", body: perms.length > 0 ? perms.map(p => `- \`${p}\``).join("\n") : "No explicit permissions (default access only)" },
      { heading: "Code References", body: `Defined in: \`src/lib/workspaces.js → ROLE_PERMISSIONS["${role}"]\`` },
    ],
  }));
  const permDocs = PERMISSIONS.map(p => {
    const rolesWithPerm = Object.entries(ROLE_PERMISSIONS).filter(([_, perms]) => perms.includes(p)).map(([r]) => r);
    return doc(`perm-${p}`, "permissions", p, {
      overview: `Permission: ${p}`,
      purpose: `Grants the ability to ${p.replace(/_/g, " ")}`,
      owner: "Platform Security",
      dependencies: [],
      relatedComponents: rolesWithPerm,
      sections: [
        { heading: "Overview", body: `The **${p}** permission grants access to ${p.replace(/_/g, " ")}.` },
        { heading: "Roles with this permission", body: rolesWithPerm.length > 0 ? rolesWithPerm.map(r => `- \`${r}\``).join("\n") : "None" },
        { heading: "Code References", body: `Defined in: \`src/lib/workspaces.js → PERMISSIONS\`` },
      ],
    });
  });
  return [...roleDocs, ...permDocs];
}

function generateWorkspaceDocs() {
  return WORKSPACE_REGISTRY.map(w => doc(`ws-${w.workspaceId}`, "workspaces", w.name, {
    overview: w.description,
    purpose: w.purpose,
    owner: "Platform",
    dependencies: [],
    relatedComponents: [w.landingPage, w.aiPersona, ...w.knowledgePacks].filter(Boolean),
    sections: [
      { heading: "Overview", body: w.description },
      { heading: "Purpose", body: w.purpose },
      { heading: "Landing Page", body: `\`${w.landingPage}\`` },
      { heading: "AI Persona", body: w.aiPersona },
      { heading: "Module Count", body: `${w.moduleCount} modules` },
      { heading: "Knowledge Packs", body: w.knowledgePacks.join(", ") || "None" },
      { heading: "Code References", body: `Defined in: \`src/lib/workspaces.js → WORKSPACES["${w.workspaceId}"]\`` },
    ],
  }));
}

function generateComponentDocs() {
  const overview = doc("components-overview", "components", "Component Relationship Map", {
    overview: "How modules, workspaces, frameworks, and knowledge packs interconnect",
    purpose: "Provides a holistic view of platform component relationships",
    owner: "Platform",
    sections: [
      { heading: "Overview", body: "This document maps the relationships between modules, workspaces, frameworks, and knowledge packs across the platform." },
      { heading: "Modules by Workspace", body: WORKSPACE_REGISTRY.map(w => {
          const modules = MODULE_REGISTRY.filter(m => m.workspaces.includes(w.workspaceId));
          return `### ${w.name}\n${modules.map(m => `- **${m.moduleName}** → Route: \`${m.route}\` | Framework: ${m.knowledgePack || "None"} | Persona: ${m.aiPersona}`).join("\n") || "No modules"}`;
        }).join("\n\n") },
      { heading: "Modules by Framework", body: FRAMEWORK_REGISTRY.filter(f => f.type === "intelligence").map(f => {
          const modules = MODULE_REGISTRY.filter(m => m.knowledgePack && KNOWLEDGE_PACK_REGISTRY.find(p => p.packId === m.knowledgePack)?.supportedFramework === f.frameworkId);
          return `### ${f.name}\n${modules.map(m => `- **${m.moduleName}** (${m.route})`).join("\n") || "No modules"}`;
        }).join("\n\n") },
    ],
  });
  return [overview, ...MODULE_REGISTRY.map(m => moduleToDoc(m, "components"))];
}

function generateDependencyDocs() {
  return [doc("dep-framework-graph", "dependencies", "Framework Dependency Graph", {
    overview: "Visual dependency graph of all platform frameworks",
    purpose: "Shows how frameworks depend on each other",
    owner: "Platform",
    dependencies: [],
    relatedComponents: FRAMEWORK_REGISTRY.map(f => f.name),
    sections: [
      { heading: "Overview", body: "The following diagram shows the dependency relationships between all frameworks in the platform. Arrows point from a framework to the frameworks that depend on it." },
      { heading: "Framework List", body: FRAMEWORK_REGISTRY.map(f => `- **${f.name}** (${f.type}) — depends on: ${f.dependencies?.join(", ") || "none"}`).join("\n") },
    ],
    graph: getDependencyGraphData(),
  })];
}

function generateAiEngineDocs() {
  const personaDocs = AI_PERSONA_REGISTRY.map(p => doc(`ai-persona-${p.personaId}`, "ai-engines", `Persona: ${p.name}`, {
    overview: p.purpose,
    purpose: p.purpose,
    owner: p.workspace || "Platform",
    dependencies: p.knowledgePacks,
    relatedComponents: p.capabilities,
    sections: [
      { heading: "Overview", body: p.purpose },
      { heading: "Type", body: p.type },
      { heading: "Workspace", body: p.workspace || "Cross-workspace" },
      { heading: "Capabilities", body: (p.capabilities || []).map(c => `- ${c}`).join("\n") || "None" },
      { heading: "Quick Actions", body: (p.quickActions || []).map(a => `- ${a}`).join("\n") || "None" },
      { heading: "Suggested Questions", body: (p.suggestedQuestions || []).map(q => `- ${q}`).join("\n") || "None" },
      { heading: "Knowledge Packs", body: (p.knowledgePacks || []).join(", ") || "None" },
    ],
  }));
  const capabilityDocs = CAPABILITY_REGISTRY.map(c => doc(`ai-cap-${c.capabilityId}`, "ai-engines", `Capability: ${c.name}`, {
    overview: `AI Capability: ${c.name}`,
    purpose: `Enables EXEC™ to ${c.name.toLowerCase().replace(/^can /, "")}`,
    owner: c.workspace,
    dependencies: c.dependencies,
    relatedComponents: [c.framework, c.knowledgePack, c.aiPersona].filter(Boolean),
    sections: [
      { heading: "Overview", body: `**${c.name}** — Status: ${c.status}` },
      { heading: "Workspace", body: c.workspace },
      { heading: "Framework", body: c.framework || "None" },
      { heading: "Knowledge Pack", body: c.knowledgePack || "None" },
      { heading: "AI Persona", body: c.aiPersona },
      { heading: "Evidence Source", body: c.evidenceSource },
      { heading: "Dependencies", body: (c.dependencies || []).join(", ") || "None" },
    ],
  }));
  return [...personaDocs, ...capabilityDocs];
}

function generateSecurityDocs() {
  const modules = filterModules(["security", "guardian", "identity-verification"]);
  return [
    doc("security-overview", "security", "Security Overview", {
      overview: "Security architecture, controls, and identity management",
      purpose: "Documents the platform's security posture and controls",
      owner: "Platform Security",
      sections: [
        { heading: "Overview", body: "EXECLEAD.AI implements a multi-layered security architecture including zero-trust access, RBAC, identity verification, session management, and security event monitoring." },
        { heading: "Security Modules", body: modules.map(m => `- **${m.moduleName}** — \`${m.route}\``).join("\n") },
        { heading: "Key Capabilities", body: "- Role-based access control (RBAC)\n- Identity verification\n- Session management\n- Security event tracking\n- Guardian™ consistency monitoring\n- Zero-trust architecture" },
      ],
    }),
    ...modules.map(m => moduleToDoc(m, "security")),
  ];
}

function generatePrivacyDocs() {
  const modules = filterModules(["privacy", "consent", "data-subject"]);
  return [
    doc("privacy-overview", "privacy", "Privacy Overview", {
      overview: "Privacy compliance and data protection under the Philippine Data Privacy Act",
      purpose: "Documents the platform's privacy controls and compliance posture",
      owner: "Platform Privacy",
      sections: [
        { heading: "Overview", body: "EXECLEAD.AI is designed for compliance with the Philippine Data Privacy Act (RA 10173) and international privacy standards including GDPR." },
        { heading: "Privacy Modules", body: modules.map(m => `- **${m.moduleName}** — \`${m.route}\``).join("\n") || "Privacy modules integrated into platform governance" },
        { heading: "Key Controls", body: "- Consent management\n- Data subject rights (access, correction, deletion)\n- Data retention policies\n- Privacy impact assessments\n- AI data usage transparency" },
      ],
    }),
    ...modules.map(m => moduleToDoc(m, "privacy")),
  ];
}

function generateTelemetryDocs() {
  const modules = filterModules(["telemetry", "observability", "system-health", "system-status", "stability"]);
  return [
    doc("telemetry-overview", "telemetry", "Telemetry Overview", {
      overview: "Observability, telemetry, and platform health monitoring",
      purpose: "Documents the platform's telemetry infrastructure",
      owner: "Platform Engineering",
      sections: [
        { heading: "Overview", body: "EXECLEAD.AI captures privacy-safe telemetry events across navigation, interactions, AI sessions, errors, and performance metrics." },
        { heading: "Telemetry Modules", body: modules.map(m => `- **${m.moduleName}** — \`${m.route}\``).join("\n") || "Telemetry integrated into platform observability" },
        { heading: "Event Categories", body: "- Navigation events\n- Search events\n- Workspace events\n- Interaction events\n- AI session events\n- Error and warning events\n- Performance metrics" },
      ],
    }),
    ...modules.map(m => moduleToDoc(m, "telemetry")),
  ];
}

function generateProductIntelligenceDocs() {
  const modules = filterModules(["product-intelligence", "beta-operations", "customer-lifecycle", "release-readiness"]);
  return [
    doc("product-intelligence-overview", "product-intelligence", "Product Intelligence Overview", {
      overview: "Product analytics, beta operations, and customer lifecycle management",
      purpose: "Documents the platform's product intelligence capabilities",
      owner: "Product Operations",
      sections: [
        { heading: "Overview", body: "EXECLEAD.AI's product intelligence infrastructure tracks adoption, health, feedback, and lifecycle metrics across the platform." },
        { heading: "Product Modules", body: modules.map(m => `- **${m.moduleName}** — \`${m.route}\``).join("\n") || "Product intelligence modules" },
        { heading: "Key Metrics", body: "- Feature adoption rates\n- Beta program health\n- Customer lifecycle stages\n- Release readiness scores\n- NPS / CSAT / CES" },
      ],
    }),
    ...modules.map(m => moduleToDoc(m, "product-intelligence")),
  ];
}

// ============================================================
// PUBLIC API
// ============================================================

export function generateAllDocs() {
  return [
    ...generateArchitectureDocs(),
    ...generateApiDocs(),
    ...generateNavigationDocs(),
    ...generateFeatureFlagDocs(),
    ...generatePermissionDocs(),
    ...generateWorkspaceDocs(),
    ...generateComponentDocs(),
    ...generateDependencyDocs(),
    ...generateAiEngineDocs(),
    ...generateSecurityDocs(),
    ...generatePrivacyDocs(),
    ...generateTelemetryDocs(),
    ...generateProductIntelligenceDocs(),
  ];
}

export function searchDocs(docs, query) {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  return docs.filter(d =>
    d.title.toLowerCase().includes(q) ||
    d.overview.toLowerCase().includes(q) ||
    d.purpose.toLowerCase().includes(q) ||
    d.owner.toLowerCase().includes(q) ||
    d.dependencies.some(dep => dep.toLowerCase().includes(q)) ||
    d.sections.some(s => s.body.toLowerCase().includes(q))
  );
}

export function exportToMarkdown(doc) {
  let md = `# ${doc.title}\n\n`;
  md += `> ${doc.overview}\n\n`;
  md += `| Field | Value |\n|-------|-------|\n`;
  md += `| Category | ${doc.category} |\n`;
  md += `| Owner | ${doc.owner} |\n`;
  md += `| Version | ${doc.version} |\n`;
  md += `| Last Modified | ${doc.lastModified} |\n`;
  md += `| Dependencies | ${doc.dependencies.join(", ") || "None"} |\n`;
  md += `| Related Components | ${doc.relatedComponents.join(", ") || "None"} |\n\n`;
  md += `---\n\n`;
  doc.sections.forEach(s => { md += `## ${s.heading}\n\n${s.body}\n\n`; });
  md += `\n---\n*Auto-generated by EXECLEAD.AI Developer Portal™ v${DOC_VERSION}*\n`;
  return md;
}

export function createEntityDoc(entityName, schema) {
  const properties = schema?.properties || {};
  const required = schema?.required || [];
  const propRows = Object.entries(properties).map(([key, prop]) => {
    const req = required.includes(key) ? "✓" : "";
    const type = prop.type || (prop.enum ? "enum" : "any");
    const desc = (prop.description || "").replace(/\|/g, "\\|").substring(0, 80);
    return `| \`${key}\` | ${type} | ${req} | ${desc} |`;
  }).join("\n");
  return doc(`entity-${entityName}`, "entities", entityName, {
    overview: `Data entity: ${entityName}`,
    purpose: schema?.description || `Stores ${entityName.toLowerCase()} records`,
    owner: "Platform",
    sections: [
      { heading: "Overview", body: `**${entityName}** is a data entity stored in the Base44 database. It has ${Object.keys(properties).length} fields (${required.length} required).` },
      { heading: "Schema", body: `| Field | Type | Required | Description |\n|-------|------|----------|-------------|\n${propRows || "| — | — | — | No fields |"}` },
      { heading: "Code References", body: `\`\`\`javascript\nimport { base44 } from "@/api/base44Client";\n\n// List all\nbase44.entities.${entityName}.list()\n\n// Filter\nbase44.entities.${entityName}.filter({ status: 'active' }, '-created_date', 20)\n\n// Create\nbase44.entities.${entityName}.create({ /* fields */ })\n\n// Update\nbase44.entities.${entityName}.update(id, { /* fields */ })\n\n// Delete\nbase44.entities.${entityName}.delete(id)\n\n// Schema\nbase44.entities.${entityName}.schema()\n\`\`\`` },
    ],
  });
}

export function getDependencyGraphData() {
  const allNodes = FRAMEWORK_REGISTRY.map(f => ({
    id: f.frameworkId,
    label: f.name,
    color: f.color || (f.type === "methodology" ? "#f59e0b" : f.type === "intelligence" ? "#6366f1" : "#10b981"),
    deps: f.dependencies || [],
  }));

  // Also include "elim" as a virtual node if referenced
  const referencedIds = new Set(allNodes.flatMap(n => n.deps));
  const existingIds = new Set(allNodes.map(n => n.id));
  for (const refId of referencedIds) {
    if (!existingIds.has(refId)) {
      allNodes.push({ id: refId, label: refId.toUpperCase(), color: "#6b7280", deps: [] });
    }
  }

  // Compute levels (topological depth)
  const levelMap = {};
  function getLevel(id, visiting = new Set()) {
    if (levelMap[id] !== undefined) return levelMap[id];
    if (visiting.has(id)) return 0; // cycle guard
    visiting.add(id);
    const node = allNodes.find(n => n.id === id);
    if (!node || !node.deps.length) { levelMap[id] = 0; return 0; }
    const maxDep = Math.max(...node.deps.map(d => getLevel(d, visiting)));
    levelMap[id] = maxDep + 1;
    return levelMap[id];
  }
  allNodes.forEach(n => { n.level = getLevel(n.id); });

  const maxLevel = Math.max(...allNodes.map(n => n.level));
  const levels = [];
  for (let i = 0; i <= maxLevel; i++) levels.push(allNodes.filter(n => n.level === i));

  // Position nodes
  const NW = 150, NH = 40, HG = 24, VG = 70;
  const positioned = [];
  levels.forEach((lvl, li) => {
    const totalW = lvl.length * (NW + HG) - HG;
    const startX = -totalW / 2;
    lvl.forEach((node, i) => {
      positioned.push({ ...node, x: startX + i * (NW + HG), y: li * (NH + VG), width: NW, height: NH });
    });
  });

  // Edges: from dependency (top) → dependent (bottom)
  const edges = [];
  allNodes.forEach(n => {
    (n.deps || []).forEach(depId => {
      if (existingIds.has(depId) || positioned.find(p => p.id === depId)) {
        edges.push({ from: depId, to: n.id });
      }
    });
  });

  return { nodes: positioned, edges, maxLevel };
}