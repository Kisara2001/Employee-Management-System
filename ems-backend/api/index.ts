// ems-backend/api/index.ts
import serverless from "serverless-http";
import app from "../src/app";
import { connectDB } from "../src/config/db";

let dbReady: Promise<void> | null = null;
function ensureDB() {
  if (!dbReady) dbReady = connectDB();
  return dbReady;
}

// ✅ Only require DB for API calls, not for docs/health/assets
app.use(async (req, _res, next) => {
  const p = req.path || req.url || "";
  if (
    p === "/health" ||
    p.startsWith("/docs") || // swagger ui + assets
    p === "/docs.json" // raw spec
  ) {
    return next();
  }

  try {
    await ensureDB();
    next();
  } catch (err) {
    next(err);
  }
});

export const config = { api: { bodyParser: false } };
export default serverless(app);
