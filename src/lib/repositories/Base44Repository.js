import { base44 } from '@/api/base44Client';
import { recordRepositoryCall, recordError } from '@/lib/serviceObservability';

// Base44Repository™ — Phase 3 Repository Layer™.
// Generic data-access boundary over Base44 entities. No UI component should
// know which repository (Base44 / Supabase / PostgreSQL / Azure) is active.
// Swapping backends is a configuration decision, not a product rewrite.
// All calls are observed via Service Observability™.

function wrap(service, fn) {
  return async (...args) => {
    recordRepositoryCall(service);
    try { return await fn(...args); }
    catch (e) { recordError(service); throw e; }
  };
}

export function createBase44Repository(entityName) {
  const entity = base44.entities[entityName];
  if (!entity) throw new Error(`[Base44Repository] Unknown entity: ${entityName}`);
  const svc = `Repository:${entityName}`;
  return {
    name: entityName,
    backend: 'base44',
    list: wrap(svc, entity.list.bind(entity)),
    filter: wrap(svc, entity.filter.bind(entity)),
    get: wrap(svc, entity.get.bind(entity)),
    create: wrap(svc, entity.create.bind(entity)),
    bulkCreate: wrap(svc, entity.bulkCreate.bind(entity)),
    update: wrap(svc, entity.update.bind(entity)),
    updateMany: wrap(svc, entity.updateMany.bind(entity)),
    bulkUpdate: wrap(svc, entity.bulkUpdate.bind(entity)),
    delete: wrap(svc, entity.delete.bind(entity)),
    deleteMany: wrap(svc, entity.deleteMany.bind(entity)),
    subscribe: (cb) => entity.subscribe(cb),
  };
}

const REPOS = {};

export function getRepository(entityName) {
  if (!REPOS[entityName]) REPOS[entityName] = createBase44Repository(entityName);
  return REPOS[entityName];
}

export function registerRepository(entityName, repo) { REPOS[entityName] = repo; }

export function listRepositories() {
  return Object.keys(REPOS).map((n) => ({ entity: n, backend: REPOS[n].backend }));
}

export default { createBase44Repository, getRepository, registerRepository, listRepositories };