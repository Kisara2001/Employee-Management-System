// backend/src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
import employeeRoutes from "./routes/employees.js";
import departmentRoutes from "./routes/departments.js";
import attendanceRoutes from "./routes/attendance.js";

dotenv.config();

const app = express();

/* ----------------------- CORS (Vercel + local) ----------------------- */
const allowList = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    // allow requests with no Origin (curl, server-to-server) and any allowed origin
    if (!origin || allowList.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// respond to all CORS preflight requests
app.options("*", cors(corsOptions));

/* ---------------------------- Middleware ----------------------------- */
app.use(express.json());
app.use(morgan("dev"));

/* ------------------------------ Health -------------------------------- */
app.get("/", (_req, res) =>
  res.json({ ok: true, message: "EMS Backend running" })
);
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

/* -------------------------------- API --------------------------------- */
// support both /api/... and root /...
app.use(["/api/auth", "/auth"], authRoutes);
app.use(["/api/employees", "/employees"], employeeRoutes);
app.use(["/api/departments", "/departments"], departmentRoutes);
app.use(["/api/attendance", "/attendance"], attendanceRoutes);

/* -------------------- Mongo connection (serverless) ------------------- */
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ems_quickstart";

if (!global._mongoosePromise) {
  global._mongoosePromise = mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB");
      return mongoose;
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
      throw err;
    });
}

export default app;
