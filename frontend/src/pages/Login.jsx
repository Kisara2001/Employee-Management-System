import React, { useState } from "react";
import { api, setToken } from "../services/api.js";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@ems.local");
  const [password, setPassword] = useState("admin123");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await api.login(email.trim(), password);
      setToken(token);
      onLogin?.();
    } catch (e) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Self-contained styles */}
      <style>{`
        /* --- remove browser gutters and let the bg touch edges --- */
        html, body, #root { height: 100%; margin: 0; padding: 0; }
        body { overflow: hidden; }

        :root{
          --bg1: #0b0f1a;
          --bg2: #0e1a2b;
          --card: rgba(255,255,255,0.08);
          --card-2: rgba(255,255,255,0.14);
          --border: rgba(255,255,255,0.18);
          --text: #e7eefc;
          --muted: #9fb0cc;
          --primary: #7aa2ff;
          --primary-2: #86ffd3;
          --error: #ff6b6b;
          --glow: 0 10px 40px rgba(122,162,255,0.25);
        }

        /* --- fullscreen background container --- */
        .login-wrap{
          position: fixed;         /* cover the viewport */
          inset: 0;                /* top/right/bottom/left: 0 */
          width: 100vw;
          height: 100dvh;          /* dynamic viewport height (mobile-safe) */
          min-height: 100svh;      /* small viewport fallback */
          display: grid;
          place-items: center;
          color: var(--text);
          background:
            radial-gradient(1200px 800px at 20% 10%, #0c1730 0%, transparent 60%),
            radial-gradient(900px 700px at 80% 90%, #112641 0%, transparent 60%),
            linear-gradient(160deg, var(--bg1), var(--bg2));
          overflow: hidden;        /* hide orb overflow */
        }

        /* floating orbs */
        .orb{
          position:absolute; border-radius:50%; filter:blur(40px); opacity:0.45;
          animation: float 12s ease-in-out infinite;
        }
        .orb.o1{ width:280px; height:280px; background:#6f86ff; top:-60px; left:-40px; animation-delay:0s;}
        .orb.o2{ width:220px; height:220px; background:#2dd3a0; bottom:-40px; right:-20px; animation-delay:1.2s;}
        .orb.o3{ width:160px; height:160px; background:#8a7dff; top:40%; right:10%; animation-delay:2.1s;}
        @keyframes float{
          0%,100%{ transform:translateY(0) translateX(0) scale(1); }
          50%{ transform:translateY(-14px) translateX(6px) scale(1.02); }
        }

        .card{
          width:min(92vw, 420px);
          backdrop-filter: saturate(160%) blur(10px);
          background: linear-gradient(180deg, var(--card-2), var(--card));
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 26px 22px;
          box-shadow: var(--glow);
          position:relative;
        }
        .brand{
          display:flex; align-items:center; gap:10px; margin-bottom:14px;
        }
        .logo{
          width:36px; height:36px; border-radius:12px;
          background: linear-gradient(135deg, var(--primary), var(--primary-2));
          display:grid; place-items:center; color:#06101b; font-weight:900;
          box-shadow: 0 6px 30px rgba(134,255,211,0.25);
        }
        h3{ margin:0; letter-spacing:.3px; font-weight:700; }
        .sub{ margin:4px 0 18px; color:var(--muted); font-size:13px; }

        .field{ margin-top:10px; display:grid; gap:6px; }
        .label{ font-size:13px; color:var(--muted); }
        .control{
          position:relative; display:flex; align-items:center;
          border:1px solid var(--border);
          background: rgba(255,255,255,0.06);
          padding: 12px 12px 12px 42px;
          border-radius:12px;
          transition: border .2s ease, background .2s ease, box-shadow .2s ease;
        }
        .control:focus-within{
          border-color: rgba(122,162,255,0.6);
          box-shadow: 0 0 0 4px rgba(122,162,255,0.12);
          background: rgba(255,255,255,0.09);
        }
        .icon{ position:absolute; left:12px; opacity:0.8; }
        .input{
          width:100%; background:transparent; border:none; outline:none; color:var(--text);
          font-size:14px; letter-spacing:.2px;
        }
        .toggle{
          position:absolute; right:10px; cursor:pointer; opacity:.8;
          border:none; background:none; color:var(--muted);
        }

        .btn{
          width:100%; margin-top:14px; border:none; cursor:pointer;
          background: linear-gradient(135deg, var(--primary), var(--primary-2));
          color:#09131f; font-weight:800; letter-spacing:.4px;
          padding:12px 14px; border-radius:12px;
          box-shadow: 0 8px 28px rgba(122,162,255,0.30);
          transition: transform .08s ease, filter .2s ease;
        }
        .btn:hover{ filter:brightness(1.05); }
        .btn:active{ transform: translateY(1px) scale(.997); }
        .btn[disabled]{ opacity:.6; cursor:not-allowed; }

        .error{
          margin:8px 0; font-size:13px; color:#fff;
          background: linear-gradient(180deg, rgba(255,107,107,.28), rgba(255,107,107,.18));
          border:1px solid rgba(255,107,107,.45);
          padding:10px 12px; border-radius:10px;
        }
        .tip{ margin-top:12px; color:var(--muted); font-size:12px; text-align:center; }
        .footer{
          margin-top:14px; display:flex; justify-content:space-between; align-items:center; color:var(--muted); font-size:12px;
        }
        .kbd{
          background: rgba(255,255,255,0.08);
          border: 1px solid var(--border);
          padding: 2px 6px; border-radius:6px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          color: var(--text);
        }
      `}</style>

      <div className="login-wrap">
        {/* ambient orbs */}
        <div className="orb o1" />
        <div className="orb o2" />
        <div className="orb o3" />

        <div className="card">
          <div className="brand">
            <div className="logo">EMS</div>
            <div>
              <h3>Welcome back</h3>
              <div className="sub">
                Sign in to your Employee Management System
              </div>
            </div>
          </div>

          {error && (
            <div className="error">
              <span style={{ marginRight: 8 }}>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={submit} autoComplete="on">
            <div className="field">
              <label className="label">Email</label>
              <div className="control">
                <span className="icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 6h16v12H4z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M4 7l8 6 8-6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>
                <input
                  className="input"
                  type="email"
                  required
                  value={email}
                  placeholder="you@company.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Password</label>
              <div className="control">
                <span className="icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="9"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M8 10V8a4 4 0 1 1 8 0v2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>
                <input
                  className="input"
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  title={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>

            <div className="footer">
              <span>Use seeded admin to login</span>
              <span className="kbd">admin@ems.local / admin123</span>
            </div>

            <div className="tip">
              Press <span className="kbd">Enter</span> to submit • Your session
              is secured by JWT
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
