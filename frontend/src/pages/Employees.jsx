import React, { useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";

const GENDERS = ["MALE", "FEMALE", "OTHER"];
const EMP_TYPES = ["PERMANENT", "CONTRACT", "INTERNSHIP"];
const STATUSES = ["ACTIVE", "INACTIVE", "TERMINATED", "RESIGNED"];

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
        /* High-contrast light theme */
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
        .hero{ margin:8px 0 16px; display:flex; align-items:center; gap:10px; }
        .bar{
          height:8px; flex:1; border-radius:999px;
          background:linear-gradient(90deg, var(--accent), var(--accent2), var(--accent));
          background-size:200% 100%; animation: slide 8s linear infinite;
          box-shadow:0 6px 18px rgba(59,130,246,.25);
        }
        @keyframes slide{ 0%{background-position:0% 0} 100%{background-position:200% 0} }

        .card{
          background:linear-gradient(180deg, var(--panel-2), var(--panel));
          border:1px solid var(--bd);
          border-radius:14px;
          padding:14px;
          box-shadow:0 6px 24px rgba(0,0,0,.06);
        }
        .card + .card{ margin-top:14px; }
        .toolbar{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; }

        .input, .select, .date, .textarea{
          <width:90></width:90>%; background:#fff; border:1px solid var(--bd); color:var(--ink);
          padding:10px 12px; border-radius:10px; outline:none;
          transition: box-shadow .15s ease, border .15s ease, background .15s ease;
        }
        .input:focus, .select:focus, .date:focus, .textarea:focus{
          border-color: var(--accent);
          box-shadow:0 0 0 4px var(--ring);
        }
        .btn{
          background:linear-gradient(135deg, var(--accent), var(--accent2));
          color:#06121f; font-weight:800; letter-spacing:.3px;
          border:none; border-radius:10px; padding:10px 14px; cursor:pointer;
          box-shadow:0 8px 20px rgba(59,130,246,.25);
        }
        .btn.secondary{
          background:#f3f6fb; color:#0e1726;
          border:1px solid var(--bd); box-shadow:none;
        }

        /* >>> Responsive grid fix <<< */
        .grid{
          display:grid;
          gap:16px;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        }

        .table-wrap{ overflow:auto; border-radius:12px; border:1px solid var(--bd); background:#fff; }
        table{ width:100%; border-collapse:collapse; min-width:820px; }
        thead th{
          position:sticky; top:0; z-index:1; text-align:left; font-weight:700; font-size:13px;
          background:#eef4ff; color:#0e1726; border-bottom:1px solid var(--bd); padding:10px;
        }
        tbody td{ padding:10px; border-bottom:1px solid #eef1f6; font-size:14px; color:#0e1726; }
        tbody tr:nth-child(odd){ background:#fafcff; }
        tbody tr:hover{ background:#f2f6ff; }

        .section-title{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin:6px 0 10px; }
        .muted{ color:var(--muted); font-size:13px; }
      `}</style>

      {/* Header accent */}
      {/* <div className="hero">
        <div className="bar" />
      </div> */}

      {/* Search */}
      <div className="card">
        <div className="section-title">
          <h3 style={{ margin: 0 }}>Employees</h3>
          <div className="muted">
            {list.length} result{list.length === 1 ? "" : "s"}
          </div>
        </div>
        <div className="toolbar">
          <input
            className="input"
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
          <input
            className="input"
            required
            placeholder="Code (EMP-0001)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <input
            className="input"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="input"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            className="input"
            required
            placeholder="First Name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
          <input
            className="input"
            required
            placeholder="Last Name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
          <select
            className="select"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="">Gender (optional)</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <div className="relative">
            <input
              type="date"
              value={form.dob || ""}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className="w-full rounded-md border px-3 py-2"
            />
            {!form.dob && (
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                Date of Birth
              </span>
            )}
          </div>

          <select
            className="select"
            value={form.departmentId}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
          >
            <option value="">Department</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Address — full row on any width */}
          <input
            className="input"
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            style={{ gridColumn: "1 / -2" }}
          />

          <input
            className="input"
            placeholder="Designation"
            value={form.designation}
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
          />
          <input
            className="date"
            type="date"
            value={form.joinDate}
            onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
          />
          <select
            className="select"
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

          <select
            className="select"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Manager ID – take 2 columns on large screens, full on small */}
          <input
            className="input"
            placeholder="Manager ID (optional)"
            value={form.managerId}
            onChange={(e) => setForm({ ...form, managerId: e.target.value })}
            style={{ gridColumn: "span 1" }}
          />

          {/* Button row — full width to avoid cramping */}
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
