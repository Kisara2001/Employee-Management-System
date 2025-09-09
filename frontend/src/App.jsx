import React, { useEffect, useState } from "react";
import Login from "./pages/Login.jsx";
import Employees from "./pages/Employees.jsx";
import Departments from "./pages/Departments.jsx";
import Attendance from "./pages/Attendance.jsx";
import { getToken } from "./services/api.js";

export default function App() {
  const [tab, setTab] = useState("employees");
  const [authed, setAuthed] = useState(!!getToken());

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const TabButton = ({ id, children }) => (
    <button className="tab" data-active={tab === id} onClick={() => setTab(id)}>
      {children}
    </button>
  );

  return (
    <div className="app-shell">
      <style>{`
        /* ====== Base ====== */
        :root{
          --ink:#0f172a;             /* text */
          --muted:#6b7a94;           /* secondary text */
          --bg:#f6f8fc;              /* page */
          --card:#ffffff;            /* panels */
          --bd:rgba(0,0,0,.12);      /* borders */
          --acc1:#4f46e5;            /* indigo */
          --acc2:#22c55e;            /* green */
          --glow: 0 10px 30px rgba(79,70,229,.22);
        }
        *{ box-sizing:border-box; }
        body{ margin:0; }

        .app-shell{
          min-height:100vh;
          color:var(--ink);
          background:
            radial-gradient(1600px 600px at 80% -200px, rgba(79,70,229,.05), transparent 60%),
            radial-gradient(1200px 500px at -10% -200px, rgba(34,197,94,.06), transparent 60%),
            var(--bg);
          padding: 10px 14px 22px;
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        }

        /* ====== Header (glass + neon line) ====== */
        .app-header{
          position: sticky;
          top: 8px;
          z-index: 10;
          border-radius: 16px;
          padding: 14px;
          background: rgba(255,255,255,.65);
          border: 1px solid rgba(255,255,255,.6);
          box-shadow: var(--glow);
          backdrop-filter: saturate(140%) blur(12px);
        }
        .brand-row{
          display:flex; align-items:center; gap:12px; justify-content:space-between;
        }
        .brand-left{
          display:flex; align-items:center; gap:12px; min-width:0;
        }
        .logo-dot{
          width:42px; height:42px; border-radius:50%;
          background: conic-gradient(from 140deg, var(--acc1), var(--acc2), var(--acc1));
          box-shadow: 0 10px 30px rgba(79,70,229,.35), inset 0 0 8px rgba(255,255,255,.85);
          position: relative;
        }
        .logo-dot::after{
          content:""; position:absolute; inset:3px; border-radius:50%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.9), rgba(255,255,255,.15) 45%, transparent 60%);
        }
        .title-wrap{ line-height:1.05; }
        .title{
          margin:0; font-weight:900; letter-spacing:.3px;
          font-size: clamp(18px, 2.3vw, 26px);
        }
        .subtitle{ margin:2px 0 0; color:var(--muted); font-size:12.5px; }

        .neon-bar{
          height:8px; margin-top:12px; border-radius:999px;
          background: linear-gradient(90deg, var(--acc1), var(--acc2), var(--acc1));
          background-size: 200% 100%;
          animation: slide 10s linear infinite;
          box-shadow: 0 6px 22px rgba(79,70,229,.28);
        }
        @keyframes slide{ from{background-position:0 0} to{background-position:200% 0} }

        /* ====== Tabs ====== */
        .tabs{
          display:flex; align-items:center; gap:8px; flex-wrap:wrap;
          background: rgba(255,255,255,.7);
          border:1px solid var(--bd);
          border-radius: 12px;
          padding: 8px;
        }
        .tab{
          border:none; cursor:pointer;
          padding:10px 14px; border-radius: 10px;
          color: var(--ink);
          background: transparent;
          font-weight: 700; letter-spacing:.2px;
          transition: transform .08s ease, background .15s ease, box-shadow .15s ease;
        }
        .tab:hover{ background:#eef2ff; }
        .tab[data-active="true"]{
          background: linear-gradient(135deg, var(--acc1), var(--acc2));
          color:#070c1a;
          box-shadow: var(--glow);
        }

        .logout{
          margin-left:auto;
          border:1px solid var(--bd);
          background:#ffffff;
          padding:10px 12px;
          border-radius:10px;
          cursor:pointer;
          font-weight:700;
        }
        .logout:hover{ background:#fafcff; }

        /* ====== Page content wrapper (pads children pages) ====== */
        .page-wrap{
         
          margin: 12px auto 0;
        }

        /* Compact on small screens */
        @media (max-width:720px){
          .tabs{ padding:6px; }
          .tab{ padding:8px 12px; }
          .logout{ padding:8px 10px; }
        }
      `}</style>

      {/* HEADER */}
      <header className="app-header">
        <div className="brand-row">
          <div className="brand-left">
            <div className="logo-dot" />
            <div className="title-wrap">
              <h2 className="title">Employee Management System</h2>
              <div className="subtitle">Elegant • Fast • Future-ready</div>
            </div>
          </div>

          <button
            className="logout"
            onClick={() => {
              localStorage.removeItem("token");
              location.reload();
            }}
            title="Sign out"
          >
            Logout
          </button>
        </div>

        <div className="neon-bar" />

        <div className="tabs" style={{ marginTop: 10 }}>
          <TabButton id="employees">Employees</TabButton>
          <TabButton id="departments">Departments</TabButton>
          <TabButton id="attendance">Attendance</TabButton>
        </div>
      </header>

      {/* CONTENT */}
      <main className="page-wrap">
        {tab === "employees" && <Employees />}
        {tab === "departments" && <Departments />}
        {tab === "attendance" && <Attendance />}
      </main>
    </div>
  );
}
