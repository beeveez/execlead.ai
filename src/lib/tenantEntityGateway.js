// NOTE: UserProfile is intentionally NOT routed through manageTenantData.
// It has its own RLS (read: created_by_id === user.id) on the entity schema,
// so the standard SDK path provides equivalent security without requiring a
// backend function invocation. Routing it through manageTenantData caused
// HTTP 402 on plans that don't include backend functions, breaking profile
// loading for every authenticated user.
const TENANT_ENTITIES = new Set([
  "Organization", "OrgMembership", "Department", "Team", "IdentityProvider",
  "IdentitySyncEvent", "SuccessionPlan", "CPQQuote", "CPQApprovalWorkflow",
  "ProcurementRequest", "Vendor", "BetaFeedback", "ExecutiveOutcome",
  "IdentityVerification", "Subscription",
]);

const invoke = async (client, entity, operation, args) => {
  const response = await client.functions.invoke("manageTenantData", { entity, operation, args });
  return response.data.result;
};

const wrapEntity = (client, name, entity) => new Proxy(entity, {
  get(target, operation) {
    if (!TENANT_ENTITIES.has(name) || typeof operation !== "string") return target[operation];
    if (operation === "list") return (sort, limit) => invoke(client, name, operation, { sort, limit });
    if (operation === "filter") return (query, sort, limit) => invoke(client, name, operation, { query, sort, limit });
    if (operation === "get") return (id) => invoke(client, name, operation, { id });
    if (operation === "create") return (data) => invoke(client, name, operation, { data });
    if (operation === "bulkCreate") return (data) => invoke(client, name, operation, { data });
    if (operation === "update") return (id, data) => invoke(client, name, operation, { id, data });
    if (operation === "delete") return (id) => invoke(client, name, operation, { id });
    return target[operation];
  },
});

export function createTenantAwareClient(client) {
  const entities = new Proxy(client.entities, {
    get(target, name) { return wrapEntity(client, name, target[name]); },
  });
  return new Proxy(client, {
    get(target, key) { return key === "entities" ? entities : target[key]; },
  });
}