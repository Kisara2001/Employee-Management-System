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

const expressHandler = serverless(app);

type ExpressHandlerArgs = Parameters<typeof expressHandler>;

function getEventPath(event: ExpressHandlerArgs[0]): string {
  if (event && typeof event === "object") {
    if ("path" in event && typeof (event as { path?: unknown }).path === "string") {
      return (event as { path?: string }).path ?? "";
    }
    if ("rawPath" in event && typeof (event as { rawPath?: unknown }).rawPath === "string") {
      return (event as { rawPath?: string }).rawPath ?? "";
    }
  }
  return "";
}

function shouldSkipDB(path: string) {
  return (
    path === "/health" ||
    path.startsWith("/docs") || // swagger ui + assets
    path === "/docs.json"
  );
}

const handler: typeof expressHandler = async (event, context) => {
  const path = getEventPath(event);
  if (!shouldSkipDB(path)) {
    await ensureDB();
  }
  return expressHandler(event, context);
};

export const config = { api: { bodyParser: false } };
export default handler;
