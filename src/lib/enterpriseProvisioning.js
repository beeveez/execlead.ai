import { base44 } from "@/api/base44Client";

// ============================================================
// ENTERPRISE PROVISIONING ENGINE
// Provisions the full enterprise workspace after activation:
//   1. Assigns Organization Owner role to the purchaser
//   2. Creates default departments
//   3. Allocates purchased seats (already on org)
//   4. Enables purchased modules (already on org)
// ============================================================

const DEFAULT_DEPARTMENTS = [
  { name: "Executive Leadership", description: "C-suite and senior executives" },
  { name: "Operations", description: "Day-to-day business operations" },
  { name: "Sales & Marketing", description: "Revenue, growth, and brand teams" },
  { name: "Engineering & Technology", description: "Product, engineering, and IT" },
  { name: "Finance", description: "Financial planning and accounting" },
  { name: "Human Resources", description: "People, talent, and culture" },
];

export async function provisionEnterpriseWorkspace(quote, breakdown, org, user) {
  const results = { departments: [], roleAssigned: false, modulesEnabled: [] };

  // 1. Assign Organization Owner role to the purchaser
  if (user) {
    try {
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: user.id });
      if (profiles[0]) {
        await base44.entities.UserProfile.update(profiles[0].id, {
          organization_id: org.id,
          custom_role: "Organization Owner",
          subscription_plan: "enterprise",
          subscription_status: "active",
          subscription_cycle: "annual",
        });
        results.roleAssigned = true;
      }
    } catch (e) {}
  }

  // 2. Create default departments
  try {
    const departments = DEFAULT_DEPARTMENTS.map((d, i) => ({
      name: d.name,
      organization_id: org.id,
      description: d.description,
      sort_order: i,
      is_active: true,
    }));
    results.departments = await base44.entities.Department.bulkCreate(departments);
  } catch (e) {}

  // 3. Modules + seats are already provisioned on the org during creation
  results.modulesEnabled = org.enabled_modules || [];

  return results;
}