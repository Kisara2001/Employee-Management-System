import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../services/api.js";

export default function Attendance() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [loadingSug, setLoadingSug] = useState(false);

  const [month, setMonth] = useState("");
  const [rows, setRows] = useState([]);

  const boxRef = useRef(null);
  const debouncer = useRef(null);

  const empLabel = (e) =>
    e
      ? `${e.firstName || ""} ${e.lastName || ""}`.trim() ||
        e.email ||
        e.code ||
        e._id
      : "";

  // Load attendance for the chosen employee/month
  const load = async () => {
    if (!selectedEmployee?._id) return setRows([]);
    const data = await api.listAttendance(selectedEmployee._id, month);
    setRows(data || []);
  };
  useEffect(() => {
    if (selectedEmployee?._id) load();
  }, [selectedEmployee?._id, month]);

  // Close suggestions on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setShowSug(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Debounced search
  const searchEmployees = (text) => {
    if (debouncer.current) clearTimeout(debouncer.current);
    setLoadingSug(true);
    debouncer.current = setTimeout(async () => {
      try {
        const res = await api.listEmployees(text || "");
        setSuggestions(res.items || []);
      } finally {
        setLoadingSug(false);
      }
    }, 250);
  };

  const onChangeQuery = (e) => {
    const text = e.target.value;
    setQuery(text);
    setShowSug(true);
    searchEmployees(text);
  };

  const chooseEmployee = (emp) => {
    setSelectedEmployee(emp);
    setQuery(empLabel(emp) + (emp.code ? ` (${emp.code})` : ""));
    setShowSug(false);
    load();
  };

  return (
    <div className="att-wrap">
      <style>{`
        :root{
          --ink:#0e1726;
          --muted:#6b7a94;
          --bd:rgba(0,0,0,.14);
          --panel:#ffffff;
          --panel2:#f6f8fc;
          --acc1:#4f46e5;
          --acc2:#22c55e;
          --ring:rgba(79,70,229,.22);
        }

        .att-wrap{ color:var(--ink); }

        .card{
          background: linear-gradient(180deg, var(--panel), var(--panel2));
          border:1px solid var(--bd);
          border-radius:14px;
          padding:14px;
          box-shadow:0 6px 24px rgba(0,0,0,.06);
        }
        .card + .card{ margin-top:14px; }

        .section-title{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin:6px 0 10px; }
        .muted{ color:var(--muted); font-size:13px; }

        .grid{
          display:grid;
          gap:12px;
          grid-template-columns: minmax(260px, 1fr) 180px auto;
          align-items:start;
        }
        @media (max-width: 760px){
          .grid{
            grid-template-columns: 1fr;
          }
        }

        .input, .select, .date, .textarea{
          width:100%; background:#fff; border:1px solid var(--bd); color:var(--ink);
          padding:10px 12px; border-radius:10px; outline:none;
          transition: box-shadow .15s ease, border .15s ease, background .15s ease;
        }
        .input:focus, .select:focus, .date:focus{
          border-color: var(--acc1);
          box-shadow:0 0 0 4px var(--ring);
        }

        .btn{
          background:linear-gradient(135deg, var(--acc1), var(--acc2));
          color:#07121f; font-weight:800; letter-spacing:.3px;
          border:none; border-radius:10px; padding:10px 14px; cursor:pointer;
          box-shadow:0 8px 20px rgba(79,70,229,.25);
        }
        .btn.secondary{
          background:#f3f6fb; color:#0e1726;
          border:1px solid var(--bd); box-shadow:none;
        }
        .btn:disabled{ opacity:.6; cursor:not-allowed; }

        /* Typeahead dropdown */
        .suggest-box{ position:relative; }
        .suggest-panel{
          position:absolute; top:110%; left:0; right:0; z-index:10;
          background:#fff; border:1px solid var(--bd); border-radius:10px;
          max-height:240px; overflow:auto; box-shadow:0 10px 26px rgba(0,0,0,.08);
        }
        .sug-item{ padding:10px 12px; cursor:pointer; }
        .sug-item:hover{ background:#f5f8ff; }
        .sug-name{ font-weight:700; }
        .sug-sub{ font-size:12px; color:#667; }

        /* Table */
        .table-wrap{ overflow:auto; border-radius:12px; border:1px solid var(--bd); background:#fff; }
        table{ width:100%; border-collapse:collapse; min-width:720px; }
        thead th{
          position:sticky; top:0; z-index:1; text-align:left; font-weight:700; font-size:13px;
          background:#eef4ff; color:#0e1726; border-bottom:1px solid var(--bd); padding:10px;
        }
        tbody td{ padding:10px; border-bottom:1px solid #eef1f6; font-size:14px; color:#0e1726; }
        tbody tr:nth-child(odd){ background:#fafcff; }
        tbody tr:hover{ background:#f2f6ff; }
      `}</style>

      {/* Search + Controls */}
      <div className="card">
        <div className="section-title">
          <h3 style={{ margin: 0 }}>Attendance</h3>
          <div className="muted">
            {selectedEmployee ? empLabel(selectedEmployee) : "Pick an employee"}
          </div>
        </div>

        <div className="grid">
          {/* Typeahead */}
          <div className="suggest-box" ref={boxRef}>
            <input
              className="input"
              placeholder="Search employee by name / email / code…"
              value={query}
              onChange={onChangeQuery}
              onFocus={() => {
                setShowSug(true);
                if (!suggestions.length) searchEmployees(query);
              }}
            />
            {showSug && (
              <div className="suggest-panel">
                {loadingSug && (
                  <div className="sug-item" style={{ color: "#666" }}>
                    Searching…
                  </div>
                )}
                {!loadingSug && suggestions.length === 0 && (
                  <div className="sug-item" style={{ color: "#777" }}>
                    No matches
                  </div>
                )}
                {!loadingSug &&
                  suggestions.map((emp) => (
                    <div
                      key={emp._id}
                      className="sug-item"
                      onClick={() => chooseEmployee(emp)}
                      onMouseDown={(e) => e.preventDefault()} // keep focus in input
                    >
                      <div className="sug-name">{empLabel(emp)}</div>
                      <div className="sug-sub">
                        {emp.email} {emp.code ? `• ${emp.code}` : ""}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Month filter (use native month picker where supported) */}
          <input
            className="input"
            type="month"
            placeholder="Month (YYYY-MM)"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />

          {/* Controls */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="btn secondary"
              onClick={load}
              disabled={!selectedEmployee?._id}
            >
              Load
            </button>
            <button
              className="btn"
              onClick={async () => {
                if (!selectedEmployee?._id)
                  return alert("Pick an employee first");
                await api.checkIn(selectedEmployee._id);
                load();
              }}
              disabled={!selectedEmployee?._id}
            >
              Check-in
            </button>
            <button
              className="btn"
              onClick={async () => {
                if (!selectedEmployee?._id)
                  return alert("Pick an employee first");
                await api.checkOut(selectedEmployee._id);
                load();
              }}
              disabled={!selectedEmployee?._id}
            >
              Check-out
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {selectedEmployee?._id ? (
          <div className="muted" style={{ marginBottom: 8 }}>
            Showing records for{" "}
            <b style={{ color: "#0e1726" }}>{empLabel(selectedEmployee)}</b>{" "}
            {selectedEmployee.code ? `(${selectedEmployee.code})` : ""} —{" "}
            <span>{selectedEmployee.email}</span>
            {month ? ` • ${month}` : ""}
          </div>
        ) : (
          <div className="muted" style={{ marginBottom: 8 }}>
            Pick an employee above to view or mark attendance.
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 140 }}>Date</th>
                <th style={{ width: 120 }}>In</th>
                <th style={{ width: 120 }}>Out</th>
                <th style={{ width: 120 }}>Hours</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  <td>{r.date}</td>
                  <td>{r.checkIn || "-"}</td>
                  <td>{r.checkOut || "-"}</td>
                  <td>{r.workHours ?? "-"}</td>
                  <td>{r.notes || ""}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      color: "#9fb0cc",
                      padding: 18,
                    }}
                  >
                    No attendance records
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
