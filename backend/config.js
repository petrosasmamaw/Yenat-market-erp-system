import dotenv from 'dotenv';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const APP_STAGE = process.env.APP_STAGE || 'development';

function requireEnv(name, demoFallback) {
  const value = process.env[name];
  if (value && value.trim()) return value.trim();
  if (APP_STAGE === 'development' && demoFallback !== undefined) return demoFallback;
  if (NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return demoFallback ?? '';
}

export const config = {
  nodeEnv: NODE_ENV,
  appStage: APP_STAGE,
  isDevelopment: NODE_ENV === 'development' || APP_STAGE === 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: requireEnv(
    'JWT_SECRET',
    'demo_yenat_jwt_secret_replace_before_production_use_a_long_random_string'
  ),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  databaseUrl: (process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '').trim(),
  /** file | neon | hybrid — hybrid writes to file + Neon when URL is set */
  storageMode: (process.env.STORAGE_MODE || 'hybrid').toLowerCase(),
  requireAuth: process.env.REQUIRE_AUTH !== 'false',
  dataDir: process.env.DATA_DIR || 'data',
  dataFileName: process.env.DATA_FILE || 'erp_store_state.json',
};

export function getStorageInfo() {
  const neonConfigured = Boolean(config.databaseUrl);
  let effectiveMode = config.storageMode;
  if (!neonConfigured && effectiveMode === 'neon') {
    effectiveMode = 'file';
  }
  if (neonConfigured && effectiveMode === 'file') {
    effectiveMode = 'hybrid';
  }
  return {
    appStage: config.appStage,
    nodeEnv: config.nodeEnv,
    storageMode: effectiveMode,
    neonConfigured,
    requireAuth: config.requireAuth,
    jwtConfigured: Boolean(config.jwtSecret),
  };
}
