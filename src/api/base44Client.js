import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { createTenantAwareClient } from '@/lib/tenantEntityGateway';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

//Create a client with authentication required
const rawClient = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});

export const base44 = createTenantAwareClient(rawClient);