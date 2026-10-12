import { createApp } from './app.js';
import { loadConfig, loadEnvFile } from './config.js';

// Load `.env` (if present) before reading the configuration.
loadEnvFile();

const config = loadConfig();
const app = createApp({ config });

app.listen(config.port, () => {
  console.log(`[api] listening on http://localhost:${config.port} (${config.nodeEnv})`);
  console.log('[api] persistence: in-memory (volatile) | auth: disabled');
});
