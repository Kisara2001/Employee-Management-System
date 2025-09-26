import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env if present; otherwise fall back to .env.example in current project root
const rootDir = process.cwd();
const envPath = path.join(rootDir, '.env');
const examplePath = path.join(rootDir, '.env.example');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config({ path: examplePath });
  // eslint-disable-next-line no-console
  console.warn('No .env found. Using .env.example defaults.');
}

const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGO_URI = process.env.MONGO_URI || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';
const ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME || 'System';
const ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME || 'Admin';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_change_me';

function parseCorsOrigins(value: string | undefined): string[] {
  if (!value) return [];

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const rawCorsOrigins =
  process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:5173';
const parsedCorsOrigins = parseCorsOrigins(rawCorsOrigins);
const corsOrigins = parsedCorsOrigins.length
  ? parsedCorsOrigins
  : ['http://localhost:5173'];
const CORS_ORIGIN: string | string[] =
  corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins;


export const env = {
  PORT,
  NODE_ENV,
  MONGO_URI,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_FIRST_NAME,
  ADMIN_LAST_NAME,
  JWT_SECRET,
  CORS_ORIGIN,
};
