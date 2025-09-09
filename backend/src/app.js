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

// allow multiple comma-separated origins
const allowList = process.env.CLIENT_ORIGIN?.split(",") ?? [];
app.use(
  cors({
    origin: (origin, cb) =>
      !origin || allowList.includes(origin)
        ? cb(null, true)
        : cb(new Error("Not allowed by CORS")),
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) =>
  res.json({ ok: true, message: "EMS Backend running" })
);
app.get("/healthz", (req, res) => res.status(200).send("ok"));

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/attendance", attendanceRoutes);

// ---- Mongo connection (cached for serverless) ----
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
