import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { staticSeoPlugin } from './src/lib/staticSeoPlugin.js'

// Ensure the Base44 /api proxy target is available even when the platform
// does not inject VITE_BASE44_APP_BASE_URL into the dev-server environment.
// The Base44 vite-plugin reads this via loadEnv() to enable the /api proxy.
process.env.VITE_BASE44_APP_BASE_URL = process.env.VITE_BASE44_APP_BASE_URL || 'https://base44.app';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    react(),
    staticSeoPlugin(),
  ],
  // Belt-and-suspenders: configure the /api proxy directly at the Vite level
  // so it is present even if the Base44 plugin's sandbox mode skips the proxy.
  server: {
    proxy: {
      '/api': {
        target: 'https://base44.app',
        changeOrigin: true,
      },
    },
  },
});