import fs from 'fs';
import path from 'path';
import { config } from './config.js';

const DATA_DIR = path.resolve(process.cwd(), config.dataDir);
const DATA_FILE = path.join(DATA_DIR, config.dataFileName);

let neonSql = null;
let neonReady = false;

export function getDataPaths() {
  return { DATA_DIR, DATA_FILE };
}

export async function initNeon() {
  if (!config.databaseUrl) {
    neonReady = false;
    neonSql = null;
    return { connected: false, reason: 'DATABASE_URL not set' };
  }

  try {
    const { neon } = await import('@neondatabase/serverless');
    neonSql = neon(config.databaseUrl);
    await neonSql`
      CREATE TABLE IF NOT EXISTS erp_store_state (
        id text PRIMARY KEY,
        payload jsonb NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `;
    neonReady = true;
    return { connected: true };
  } catch (err) {
    neonReady = false;
    neonSql = null;
    return { connected: false, reason: err.message };
  }
}

async function loadFromNeon() {
  if (!neonReady || !neonSql) return null;
  const rows = await neonSql`
    SELECT payload FROM erp_store_state WHERE id = 'main' LIMIT 1
  `;
  if (!rows?.length) return null;
  return rows[0].payload;
}

async function saveToNeon(data) {
  if (!neonReady || !neonSql) return false;
  await neonSql`
    INSERT INTO erp_store_state (id, payload, updated_at)
    VALUES ('main', ${data}, now())
    ON CONFLICT (id) DO UPDATE SET
      payload = EXCLUDED.payload,
      updated_at = now()
  `;
  return true;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadFromFile(fallback) {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return fallback;
  }
}

export function saveToFile(data) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function loadStoreData(initialERPData) {
  const useNeon =
    config.databaseUrl &&
    (config.storageMode === 'neon' || config.storageMode === 'hybrid');

  if (useNeon) {
    if (!neonReady) {
      await initNeon();
    }
    if (neonReady) {
      try {
        const fromNeon = await loadFromNeon();
        if (fromNeon) {
          saveToFile(fromNeon);
          return fromNeon;
        }
      } catch (err) {
        console.warn('[store] Neon load failed, using file:', err.message);
      }
    }
  }

  return loadFromFile(initialERPData);
}

export async function saveStoreData(data) {
  const useFile =
    config.storageMode === 'file' || config.storageMode === 'hybrid' || !config.databaseUrl;
  const useNeon =
    config.databaseUrl &&
    (config.storageMode === 'neon' || config.storageMode === 'hybrid');

  if (useFile) {
    saveToFile(data);
  }

  if (useNeon) {
    if (!neonReady) {
      await initNeon();
    }
    if (neonReady) {
      try {
        await saveToNeon(data);
        data.neonConfig = {
          ...(data.neonConfig || {}),
          connected: true,
          lastSynced: new Date().toISOString(),
          source: 'env',
        };
      } catch (err) {
        console.error('[store] Neon save failed:', err.message);
        throw err;
      }
    }
  }

  if (useFile && !useNeon) {
    data.neonConfig = {
      ...(data.neonConfig || {}),
      connected: false,
      connectionUrl: '',
    };
  }
}

export async function testNeonConnection(connectionUrl) {
  const url = (connectionUrl || config.databaseUrl || '').trim();
  if (!url || !url.startsWith('postgres')) {
    return { ok: false, error: 'Set DATABASE_URL in backend .env or provide a PostgreSQL connection URL.' };
  }

  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(url);
  const result = await sql`SELECT NOW() as current_time, current_database() as db_name`;
  return { ok: true, message: 'Connected to Neon PostgreSQL successfully.', result };
}

export function isNeonReady() {
  return neonReady;
}
