// ems-backend/src/server.ts
import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";

async function startLocal() {
  try {
    await connectDB();
    const port = env.PORT ?? 3000;
    const server = app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on http://localhost:${port}`);
      // eslint-disable-next-line no-console
      console.log(`CORS allowed origin: ${env.CORS_ORIGIN}`);
      // eslint-disable-next-line no-console
      console.log("Swagger docs at /docs");
    });
    server.on("error", (err) => {
      // eslint-disable-next-line no-console
      console.error("Server error", err);
      process.exit(1);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to start", err);
    process.exit(1);
  }
}

// Only run a real HTTP server when NOT on Vercel (i.e., local dev)
if (!process.env.VERCEL) {
  void startLocal();
}
