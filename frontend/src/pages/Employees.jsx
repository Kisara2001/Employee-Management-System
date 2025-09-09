import React, { useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";

const GENDERS = ["MALE", "FEMALE", "OTHER"];
const EMP_TYPES = ["PERMANENT", "CONTRACT", "INTERNSHIP"];
const STATUSES = ["ACTIVE", "INACTIVE", "TERMINATED", "RESIGNED"];

/* ----------------------- Floating field helper ----------------------- */
function FloatField({ label, children, filled, hint, style }) {
  return (
    <div
      className="ff field"
      data-filled={filled ? "true" : "false"}
      style={style}
    >
      {children}
      <label className="ff-label">{label}</label>
      {hint && <div className="ff-hint">{hint}</div>}
    </div>
  );
}

export default function Employees() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const emptyForm = {
    code: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    address: "",
    departmentId: "",
    designation: "",
    joinDate: "",
    employmentType: "PERMANENT",
    status: "ACTIVE",
    managerId: "",
  };
  const [form, setForm] = useState(emptyForm);

  const deptMap = useMemo(() => {
    const m = {};
    departments.forEach((d) => (m[d._id] = d.name));
    return m;
  }, [departments]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.listEmployees(q);
      setList(res.items || []);
    } finally {
      setLoading(false);
    }
  };

  const loadDeps = async () => {
    const deps = await api.listDepartments();
    setDepartments(deps || []);
  };

  useEffect(() => {
    load();
    loadDeps();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      phone: form.phone || undefined,
      gender: form.gender || undefined,
      dob: form.dob ? new Date(form.dob) : undefined,
      address: form.address || undefined,
      departmentId: form.departmentId || undefined,
      designation: form.designation || undefined,
      joinDate: form.joinDate ? new Date(form.joinDate) : undefined,
      employmentType: form.employmentType || "PERMANENT",
      status: form.status || "ACTIVE",
      managerId: form.managerId || undefined,
    };

    if (editing) {
      await api.updateEmployee(editing._id, payload);
    } else {
      await api.createEmployee(payload);
    }
    setForm(emptyForm);
    setEditing(null);
    load();
  };

  const edit = (it) => {
    setEditing(it);
    setForm({
      code: it.code || "",
      firstName: it.firstName || "",
      lastName: it.lastName || "",
      email: it.email || "",
      phone: it.phone || "",
      gender: it.gender || "",
      dob: it.dob ? it.dob.slice(0, 10) : "",
      address: it.address || "",
      departmentId: it.departmentId || "",
      designation: it.designation || "",
      joinDate: it.joinDate ? it.joinDate.slice(0, 10) : "",
      employmentType: it.employmentType || "PERMANENT",
      status: it.status || "ACTIVE",
      managerId: it.managerId || "",
    });
  };

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const Badge = ({ children, tone = "default" }) => {
    const tones = {
      default: "#eef4ff",
      good: "#e8fbf1",
      warn: "#fff6e5",
      danger: "#ffe9e9",
      info: "#eaf2ff",
      mute: "#f0f3f8",
    };
    const borders = {
      default: "#cfe0ff",
      good: "#b9f1d1",
      warn: "#ffe1a9",
      danger: "#ffc5c5",
      info: "#bcd6ff",
      mute: "#d8dee8",
    };
    return (
      <span
        style={{
          padding: "4px 8px",
          borderRadius: 999,
          background: tones[tone] || tones.default,
          border: `1px solid ${borders[tone] || borders.default}`,
          fontSize: 12,
          whiteSpace: "nowrap",
          color: "#0e1726",
        }}
      >
        {children}
      </span>
    );
  };

  const toneForStatus = (s) =>
    s === "ACTIVE"
      ? "good"
      : s === "INACTIVE"
      ? "mute"
      : s === "TERMINATED"
      ? "danger"
      : "warn";
  const toneForType = (t) =>
    t === "PERMANENT" ? "info" : t === "CONTRACT" ? "warn" : "mute";

  return (
    <div className="ems-wrap">
      <style>{`
        :root{
          --panel-2:#ffffff;
          --panel:#f6f8fc;
          --bd:rgba(0,0,0,.14);
          --ink:#0e1726;
          --muted:#5b6b84;
          --accent:#3b82f6;
          --accent2:#22c55e;
          --ring:rgba(59,130,246,.22);
        }
        .ems-wrap{ color:var(--ink); background:#fff; padding-bottom:16px; }
        .card{
          background:linear-gradient(180deg, var(--panel-2), var(--panel));
          border:1px solid var(--bd);
          border-radius:14px;
          padding:14px;
          box-shadow:0 6px 24px rgba(0,0,0,.06);
        }
        .toolbar{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
        .btn{
          background:linear-gradient(135deg, var(--accent), var(--accent2));
          color:#06121f; font-weight:800; letter-spacing:.3px;
          border:none; border-radius:10px; padding:10px 14px; cursor:pointer;
          box-shadow:0 8px 20px rgba(59,130,246,.25);
        }
        .btn.secondary{ background:#f3f6fb; color:#0e1726; border:1px solid var(--bd); box-shadow:none; }

        /* Grid for form */
        .grid{ display:grid; gap:16px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }

        /* -------- Floating fields -------- */
        .field{ position:relative; }
        .control{
          width:100%; height:44px; background:#fff; color:var(--ink);
          border:1px solid var(--bd); border-radius:10px;
          padding:18px 12px 10px 12px; outline:none;
          transition:border .15s ease, box-shadow .15s ease;
        }
        /* Make selects match height better */
        select.control { padding-top: 10px; padding-bottom: 10px; height: 44px; }
        .control:focus{ border-color:var(--accent); box-shadow:0 0 0 4px var(--ring); }
        .ff-label{
          position:absolute; left:10px; top:50%; transform:translateY(-50%);
          background:#fff; padding:0 6px; color:#8aa0bd; border-radius:6px;
          pointer-events:none; transition:all .15s ease;
        }
        .field:focus-within .ff-label,
        .field[data-filled="true"] .ff-label{
          top:-8px; transform:none; font-size:12px; color:var(--accent);
          box-shadow:0 0 0 6px #fff inset;
        }
        .ff-hint{ position:absolute; right:10px; bottom:6px; font-size:11px; color:#8aa0bd; }
        .muted{ color:var(--muted); font-size:13px; }
        .input{ height:44px; }

        /* --- IMPORTANT: Fix 'yyyy-mm-dd' ghost text clashing with floating label --- */
        /* Hide WebKit date edit text ONLY when the field is empty and not focused */
        .ff[data-filled="false"] input[type="date"]:not(:focus)::-webkit-datetime-edit,
        .ff[data-filled="false"] input[type="date"]:not(:focus)::-webkit-datetime-edit-year-field,
        .ff[data-filled="false"] input[type="date"]:not(:focus)::-webkit-datetime-edit-month-field,
        .ff[data-filled="false"] input[type="date"]:not(:focus)::-webkit-datetime-edit-day-field {
          color: transparent;
        }
        /* Optional: hide caret while empty to avoid a lone blinking bar */
        .ff[data-filled="false"] input[type="date"]:not(:focus) { caret-color: transparent; }
        /* Restore text color generally */
        .ff input[type="date"]::-webkit-datetime-edit { color: inherit; }

        /* Table */
        .table-wrap{ overflow:auto; border-radius:12px; border:1px solid var(--bd); background:#fff; }
        table{ width:100%; border-collapse:collapse; min-width:820px; }
        thead th{
          position:sticky; top:0; z-index:1; text-align:left; font-weight:700; font-size:13px;
          background:#eef4ff; color:#0e1726; border-bottom:1px solid var(--bd); padding:10px;
        }
        tbody td{ padding:10px; border-bottom:1px solid #eef1f6; font-size:14px; color:#0e1726; }
        tbody tr:nth-child(odd){ background:#fafcff; }
        tbody tr:hover{ background:#f2f6ff; }
      `}</style>

      {/* Search */}
      <div className="card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <h3 style={{ margin: 0 }}>Employees</h3>
          <div className="muted">
            {list.length} result{list.length === 1 ? "" : "s"}
          </div>
        </div>
        <div className="toolbar" style={{ marginTop: 10 }}>
          <input
            className="control input"
            placeholder="Search by name, email, code…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Search"}
          </button>
          {editing && (
            <button className="btn secondary" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <h4 style={{ marginTop: 0 }}>
          {editing ? "Edit Employee" : "Create Employee"}
        </h4>

        <form onSubmit={submit} className="grid" style={{ maxWidth: 1100 }}>
          <FloatField label="Code (EMP-0001)" filled={!!form.code}>
            <input
              className="control input"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
              autoComplete="off"
            />
          </FloatField>

          <FloatField label="Email" filled={!!form.email}>
            <input
              className="control input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </FloatField>

          <FloatField label="Phone" filled={!!form.phone}>
            <input
              className="control input"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              autoComplete="tel"
            />
          </FloatField>

          <FloatField label="First Name" filled={!!form.firstName}>
            <input
              className="control input"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
              autoComplete="given-name"
            />
          </FloatField>

          <FloatField label="Last Name" filled={!!form.lastName}>
            <input
              className="control input"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
              autoComplete="family-name"
            />
          </FloatField>

          <FloatField label="Gender (optional)" filled={!!form.gender}>
            <select
              className="control"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value=""></option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </FloatField>

          <FloatField label="Date of Birth" filled={!!form.dob}>
            <input
              className="control"
              type="date"
              placeholder=" " /* important for floating label */
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
            />
          </FloatField>

          <FloatField label="Department" filled={!!form.departmentId}>
            <select
              className="control"
              value={form.departmentId}
              onChange={(e) =>
                setForm({ ...form, departmentId: e.target.value })
              }
            >
              <option value=""></option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </FloatField>

          <FloatField
            label="Address"
            filled={!!form.address}
            style={{ gridColumn: "1 / -2" }}
          >
            <input
              className="control input"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              autoComplete="street-address"
            />
          </FloatField>

          <FloatField label="Designation" filled={!!form.designation}>
            <input
              className="control input"
              value={form.designation}
              onChange={(e) =>
                setForm({ ...form, designation: e.target.value })
              }
            />
          </FloatField>

          <FloatField label="Join Date" filled={!!form.joinDate}>
            <input
              className="control"
              type="date"
              placeholder=" " /* important for floating label */
              value={form.joinDate}
              onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
            />
          </FloatField>

          <FloatField label="Employment Type" filled={!!form.employmentType}>
            <select
              className="control"
              value={form.employmentType}
              onChange={(e) =>
                setForm({ ...form, employmentType: e.target.value })
              }
            >
              {EMP_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FloatField>

          <FloatField label="Status" filled={!!form.status}>
            <select
              className="control"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FloatField>

          <FloatField
            label="Manager ID (optional)"
            filled={!!form.managerId}
            style={{ gridColumn: "span 1" }}
          >
            <input
              className="control input"
              value={form.managerId}
              onChange={(e) => setForm({ ...form, managerId: e.target.value })}
              autoComplete="off"
            />
          </FloatField>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              gridColumn: "1 / -1",
            }}
          >
            <button className="btn" type="submit">
              {editing ? "Update" : "Create"}
            </button>
            {editing && (
              <button
                className="btn secondary"
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Type</th>
                <th>Status</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((it) => (
                <tr key={it._id}>
                  <td>{it.code}</td>
                  <td>
                    {it.firstName} {it.lastName}
                  </td>
                  <td>{it.email}</td>
                  <td>{deptMap[it.departmentId] || "-"}</td>
                  <td>{it.designation || "-"}</td>
                  <td>
                    <Badge tone={toneForType(it.employmentType)}>
                      {it.employmentType || "-"}
                    </Badge>
                  </td>
                  <td>
                    <Badge tone={toneForStatus(it.status)}>
                      {it.status || "-"}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn secondary"
                        onClick={() => edit(it)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn secondary"
                        onClick={async () => {
                          if (confirm("Delete?")) {
                            await api.deleteEmployee(it._id);
                            load();
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      color: "#9fb0cc",
                      padding: 18,
                    }}
                  >
                    {loading ? "Loading…" : "No employees found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
