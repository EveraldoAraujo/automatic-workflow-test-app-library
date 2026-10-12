import { config as loadDotenv } from 'dotenv';

export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  corsOrigins: string[];
}

/**
 * Loads `.env` into `process.env` (no-op if the file is absent).
 * Exported so entrypoints control when this happens; tests that pass an
 * explicit `env` object are unaffected.
 */
export function loadEnvFile(): void {
  loadDotenv({ quiet: true });
}

/**
 * Reads configuration from environment variables.
 *
 * Note: configuration is intentionally centralized here so that deployment
 * environments (PORT, CORS_ORIGINS, NODE_ENV) never leak into handlers.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const nodeEnv = (env.NODE_ENV as AppConfig['nodeEnv']) ?? 'development';
  const origins = (env.CORS_ORIGINS ?? 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    port: Number(env.PORT ?? 3000),
    nodeEnv,
    // CORS must never be '*' in production; the allowlist comes from env.
    corsOrigins: nodeEnv === 'production' ? origins.filter((o) => o !== '*') : origins,
  };
}
