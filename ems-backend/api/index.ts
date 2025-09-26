import serverless from "serverless-http";
import app from "../src/app";
import { connectDB } from "../src/config/db";

// connect **once per cold start**, reuse on warm
let dbReady: Promise<void> | null = null;
function ensureDB() {
  if (!dbReady) dbReady = connectDB();
  return dbReady;
}

app.use(async (_req, _res, next) => {
  try {
    await ensureDB();
    next();
  } catch (e) {
    next(e);
  }
});

export const config = { api: { bodyParser: false } };
export default serverless(app);
