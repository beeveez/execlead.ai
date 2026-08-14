import { authorizeKnowledgeFunction } from './knowledgeFunctionSecurity.ts';

function assertEquals(actual, expected, message) {
  if (actual !== expected) throw new Error(message || `Expected ${expected}, received ${actual}`);
}

function mockClient(user, events = []) {
  return {
    auth: { me: async () => { if (!user) throw new Error('unauthenticated'); return user; } },
    asServiceRole: {
      entities: {
        SecurityEvent: {
          filter: async () => events,
          create: async (record) => record,
        },
        PlatformActivity: { create: async (record) => record },
      },
    },
  };
}

function request(body = {}, method = 'POST') {
  return new Request('https://app.local/api/knowledge', {
    method,
    headers: { 'content-type': 'application/json' },
    body: method === 'POST' ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
  });
}

const options = {
  action: 'get_knowledge_intelligence',
  allowServiceToken: false,
  limit: 2,
  windowMs: 60_000,
};

Deno.test('rejects unauthenticated direct invocation', async () => {
  const result = await authorizeKnowledgeFunction(request(), mockClient(null), options);
  assertEquals(result.response?.status, 401);
});

Deno.test('rejects authenticated standard user', async () => {
  const result = await authorizeKnowledgeFunction(request(), mockClient({ id: 'user-a', role: 'customer' }), options);
  assertEquals(result.response?.status, 403);
});

Deno.test('allows authenticated platform admin', async () => {
  const result = await authorizeKnowledgeFunction(request(), mockClient({ id: 'admin-a', role: 'platform_admin' }), options);
  assertEquals(result.response, null);
});

Deno.test('rejects client-supplied organization scope', async () => {
  const result = await authorizeKnowledgeFunction(request({ organization_id: 'org-b' }), mockClient({ id: 'admin-a', role: 'platform_admin' }), options);
  assertEquals(result.response?.status, 400);
});

Deno.test('rejects client-supplied user scope', async () => {
  const result = await authorizeKnowledgeFunction(request({ user_id: 'user-b' }), mockClient({ id: 'admin-a', role: 'platform_admin' }), options);
  assertEquals(result.response?.status, 400);
});

Deno.test('rejects malformed JSON after authentication', async () => {
  const result = await authorizeKnowledgeFunction(request('{bad-json'), mockClient({ id: 'admin-a', role: 'platform_admin' }), options);
  assertEquals(result.response?.status, 400);
});

Deno.test('rate limits repeated admin requests', async () => {
  const now = new Date().toISOString();
  const events = [
    { description: 'knowledge:get_knowledge_intelligence:allowed', created_date: now },
    { description: 'knowledge:get_knowledge_intelligence:allowed', created_date: now },
  ];
  const result = await authorizeKnowledgeFunction(request(), mockClient({ id: 'admin-a', role: 'platform_admin' }, events), options);
  assertEquals(result.response?.status, 429);
});

Deno.test('rejects unsupported HTTP methods', async () => {
  const result = await authorizeKnowledgeFunction(request({}, 'GET'), mockClient({ id: 'admin-a', role: 'platform_admin' }), options);
  assertEquals(result.response?.status, 405);
});