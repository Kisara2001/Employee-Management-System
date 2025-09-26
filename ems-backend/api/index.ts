// ems-backend/api/index.ts
import serverless from "serverless-http";
import type { Handler, HandlerContext, HandlerEvent } from "serverless-http";
import app from "../src/app";
import { connectDB } from "../src/config/db";

let dbReady: Promise<void> | null = null;
function ensureDB() {
  if (!dbReady) dbReady = connectDB();
  return dbReady;
}

function isDocsPath(path: string) {
  return path === "/docs" || path.startsWith("/docs/");
}

function shouldSkipEnsureDB(path: string | undefined) {
  if (!path) return false;
  const cleanPath = path.split("?")[0];
  return (
    cleanPath === "/health" ||
    cleanPath === "/docs.json" ||
    isDocsPath(cleanPath)
  );
}

export const config = { api: { bodyParser: false } };

const expressHandler = serverless(app);

type ExpressHandler = Handler<unknown, unknown>;

const handler: ExpressHandler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  const path = event?.path || event?.rawPath || event?.rawUrl;
  if (!shouldSkipEnsureDB(path)) {
    await ensureDB();
  }

  return expressHandler(event, context);
};

export default handler;
