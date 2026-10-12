/**
 * Production environment.
 *
 * `apiBaseUrl` is NOT hardcoded: it resolves, in order of precedence, from
 *  1. `globalThis.__API_BASE_URL__` — injected at runtime by the hosting shell
 *     (e.g. a `<script>window.__API_BASE_URL__ = 'https://api.example.com/api'</script>`
 *     before the bundle loads, or a config endpoint);
 *  2. the build-time default below.
 *
 * To change the production API URL without touching code, either set
 * `globalThis.__API_BASE_URL__` at runtime or edit the `productionApiBaseUrl`
 * default here (then rebuild with `ng build --configuration production`).
 */
const runtimeOverride =
  typeof globalThis !== 'undefined'
    ? (globalThis as { __API_BASE_URL__?: string }).__API_BASE_URL__
    : undefined;

export const environment = {
  production: true,
  apiBaseUrl: runtimeOverride ?? '/api',
};
