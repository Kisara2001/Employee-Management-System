import React, { useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";

// Helper to format an employee's display name
const empLabel = (e) =>
  e
    ? `${e.firstName || ""} ${e.lastName || ""}`.trim() || e.email || e.code
    : "";

export default function Departments() {
  const [list, setList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const emptyForm = { name: "", code: "", description: "", managerId: "" };
  const [form, setForm] = useState(emptyForm);

  const employeesById = useMemo(() => {
    const m = {};
    for (const e of employees) m[e._id] = e;
    return m;
  }, [employees]);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const deps = await api.listDepartments();
      setList(deps || []);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    const res = await api.listEmployees(""); // { items, total, ... }
    setEmployees(res.items || []);
  };

  useEffect(() => {
    loadDepartments();
    loadEmployees();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      code: form.code,
      description: form.description || undefined,
      managerId: form.managerId || undefined,
    };
    if (editing) {
      await api.updateDepartment(editing._id, payload);
    } else {
      await api.createDepartment(payload);
    }
    setForm(emptyForm);
    setEditing(null);
    loadDepartments();
  };

  const startEdit = (dep) => {
    setEditing(dep);
    setForm({
      name: dep.name || "",
      code: dep.code || "",
      description: dep.description || "",
      managerId: dep.managerId || "",
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const remove = async (id) => {
    if (!confirm("Delete this department?")) return;
    await api.deleteDepartment(id);
    loadDepartments();
  };

  return (
    <div className="dept-wrap">
      <style>{`
        :root{
          --ink:#0e1726;
          --muted:#6b7a94;
          --bd:rgba(0,0,0,.14);
          --panel:#ffffff;
          --panel2:#f6f8fc;
          --accent:#4f46e5;
          --accent2:#22c55e;
          --ring:rgba(79,70,229,.22);
        }
        .dept-wrap{ color:var(--ink); }

        .card{
          background: linear-gradient(180deg, var(--panel), var(--panel2));
          border:1px solid var(--bd);
          border-radius:14px;
          padding:14px;
          box-shadow:0 6px 24px rgba(0,0,0,.06);
        }
        .card + .card{ margin-top:14px; }

        .section-title{
          display:flex; align-items:center; justify-content:space-between;
          gap:10px; margin:6px 0 10px;
        }
        .muted{ color:var(--muted); font-size:13px; }

        .input, .select, .textarea{
          width:100%; background:#fff; border:1px solid var(--bd); color:var(--ink);
          padding:10px 12px; border-radius:10px; outline:none;
          transition: box-shadow .15s ease, border .15s ease, background .15s ease;
        }
        .input:focus, .select:focus, .textarea:focus{
          border-color: var(--accent);
          box-shadow:0 0 0 4px var(--ring);
        }
        .textarea{ resize:vertical; }

        .btn{
          background:linear-gradient(135deg, var(--accent), var(--accent2));
          color:#07121f; font-weight:800; letter-spacing:.3px;
          border:none; border-radius:10px; padding:10px 14px; cursor:pointer;
          box-shadow:0 8px 20px rgba(79,70,229,.25);
        }
        .btn.secondary{
          background:#f3f6fb; color:#0e1726;
          border:1px solid var(--bd); box-shadow:none;
        }

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

        .actions{ display:flex; gap:8px; }
      `}</style>

      {/* Header */}
      <div className="card">
        <div className="section-title">
          <h3 style={{ margin: 0 }}>Departments</h3>
          <div className="muted">{list.length} total</div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="grid" style={{ maxWidth: 980 }}>
          <input
            className="input"
            required
            placeholder="Department Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="input"
            required
            placeholder="Code (e.g., HR, ENG)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />

          <select
            className="select"
            value={form.managerId}
            onChange={(e) => setForm({ ...form, managerId: e.target.value })}
          >
            <option value="">Manager (optional)</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {empLabel(emp)} {emp.code ? `(${emp.code})` : ""}
              </option>
            ))}
          </select>

          <textarea
            className="textarea"
            rows={3}
            placeholder="Description (optional)"
            style={{ gridColumn: "1 / -1" }}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

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
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="muted">Loading…</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 220 }}>Name</th>
                  <th style={{ width: 120 }}>Code</th>
                  <th style={{ width: 240 }}>Manager</th>
                  <th>Description</th>
                  <th style={{ width: 150 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(list || []).map((dep) => {
                  const mgr = employeesById[dep.managerId];
                  return (
                    <tr key={dep._id}>
                      <td>{dep.name}</td>
                      <td>{dep.code}</td>
                      <td>{mgr ? empLabel(mgr) : "-"}</td>
                      <td style={{ maxWidth: 520, whiteSpace: "pre-wrap" }}>
                        {dep.description || "-"}
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            className="btn secondary"
                            onClick={() => startEdit(dep)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn secondary"
                            onClick={() => remove(dep._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {(!list || list.length === 0) && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        color: "#9fb0cc",
                        padding: 18,
                      }}
                    >
                      No departments yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
