// backend/api/[...path].js
import serverless from "serverless-http";
import app from "../src/app.js";

export const config = { runtime: "nodejs20" }; // optional
export default serverless(app);
