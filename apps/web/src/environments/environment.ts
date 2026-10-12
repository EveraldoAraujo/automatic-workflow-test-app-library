/**
 * Base environment (used as the source for build-time `fileReplacements`).
 *
 * The active file is swapped by `angular.json`:
 *  - `development` -> `environment.development.ts`
 *  - `production`  -> `environment.production.ts`
 *
 * Do not import this file directly in app code; import `./environments/environment`
 * and let the Angular CLI pick the right variant for the active configuration.
 */
export const environment = {
  production: false,
  apiBaseUrl: '/api',
};
