import { base44 } from '@/api/base44Client';

// Base44Repository™ — Phase 3 Repository Layer™.
// Generic data-access boundary over Base44 entities. No UI component should
// know which repository (Base44 / Supabase / PostgreSQL / Azure) is active.
// Swapping backends is a configuration decision, not a product rewrite.

export function createBase44Repository(entityName) {
  const entity = base44.entities[entityName];
  if (!entity) throw new Error(`[Base44Repository] Unknown entity: ${entityName}`);
  return {
    name: entityName,
    backend: 'base44',
    list: (sort, limit) => entity.list(sort, limit),
    filter: (query, sort, limit) => entity.filter(query, sort, limit),
    get: (id) => entity.get(id),
    create: (data) => entity.create(data),
    bulkCreate: (items) => entity.bulkCreate(items),
    update: (id, data) => entity.update(id, data),
    updateMany: (query, ops) => entity.updateMany(query, ops),
    bulkUpdate: (items) => entity.bulkUpdate(items),
    delete: (id) => entity.delete(id),
    deleteMany: (query) => entity.deleteMany(query),
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