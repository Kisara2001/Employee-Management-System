// backend/src/routes/attendance.js
import { Router } from "express";
import dayjs from "dayjs";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js"; // ← add this
import { requireAuth, allow } from "../middleware/auth.js";

const router = Router();

async function ensureEmployeeExists(employeeId) {
  if (!employeeId) return false;
  try {
    const emp = await Employee.findById(employeeId).select("_id");
    return !!emp;
  } catch {
    return false;
  }
}

// Check-in (self) - role any logged-in
router.post("/check-in", requireAuth, async (req, res) => {
  const { employeeId } = req.body;
  if (!(await ensureEmployeeExists(employeeId))) {
    return res
      .status(400)
      .json({ message: "Invalid employeeId: employee not found" });
  }
  const date = dayjs().format("YYYY-MM-DD");
  const now = dayjs().format("HH:mm");
  try {
    const rec = await Attendance.create({
      employeeId,
      date,
      checkIn: now,
      source: "WEB",
    });
    res.json(rec);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Check-out (self)
router.post("/check-out", requireAuth, async (req, res) => {
  const { employeeId } = req.body;
  if (!(await ensureEmployeeExists(employeeId))) {
    return res
      .status(400)
      .json({ message: "Invalid employeeId: employee not found" });
  }
  const date = dayjs().format("YYYY-MM-DD");
  const now = dayjs().format("HH:mm");
  const rec = await Attendance.findOne({ employeeId, date });
  if (!rec)
    return res.status(404).json({ message: "No check-in found for today" });
  rec.checkOut = now;
  const [h1, m1] = (rec.checkIn || "00:00").split(":").map(Number);
  const [h2, m2] = now.split(":").map(Number);
  const mins = h2 * 60 + m2 - (h1 * 60 + m1);
  rec.workHours = Math.max(0, Math.round((mins / 60) * 100) / 100);
  await rec.save();
  res.json(rec);
});

// Query
router.get(
  "/",
  requireAuth,
  allow("ADMIN", "HR", "MANAGER"),
  async (req, res) => {
    const { employeeId, month } = req.query; // month = YYYY-MM
    const filter = {};
    if (employeeId) filter.employeeId = employeeId;
    if (month) filter.date = new RegExp("^" + month);
    const items = await Attendance.find(filter).sort({ date: -1 });
    res.json(items);
  }
);

export default router;
