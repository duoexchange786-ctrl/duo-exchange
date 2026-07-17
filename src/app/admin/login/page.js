"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/admin/check-session");
        if (res.ok) router.replace("/admin/dashboard");
      } catch (err) {
        // no cookie
      }
    };
    checkAdmin();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.replace("/admin/dashboard");
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .admin-login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: #080a12;
          font-family: 'Inter', -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Animated grid background */
        .admin-login-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
        }

        /* Glow orbs */
        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .glow-orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          top: -100px;
          left: -100px;
          animation: floatOrb1 8s ease-in-out infinite;
        }

        .glow-orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%);
          bottom: -80px;
          right: -80px;
          animation: floatOrb2 10s ease-in-out infinite;
        }

        @keyframes floatOrb1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 20px); }
        }

        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, -30px); }
        }

        .login-wrapper {
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
          animation: slideUp 0.5s cubic-bezier(0.34, 1.4, 0.64, 1) both;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Logo area */
        .login-logo {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-logo-icon {
          width: 68px;
          height: 68px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 28px;
          box-shadow: 0 0 40px rgba(99, 102, 241, 0.4), 0 8px 32px rgba(0,0,0,0.4);
          animation: pulseLogo 3s ease-in-out infinite;
        }

        @keyframes pulseLogo {
          0%, 100% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.4), 0 8px 32px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 60px rgba(99, 102, 241, 0.6), 0 8px 32px rgba(0,0,0,0.4); }
        }

        .login-logo-title {
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, #f0f2ff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }

        .login-logo-sub {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        /* Card */
        .login-card {
          background: rgba(19, 21, 31, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 24px;
          padding: 36px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
        }

        /* Fields */
        .field-group {
          margin-bottom: 20px;
        }

        .field-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #a0aec0;
          margin-bottom: 8px;
          letter-spacing: 0.01em;
        }

        .field-wrap {
          position: relative;
        }

        .field-prefix {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #4a5068;
          font-size: 14px;
          pointer-events: none;
          z-index: 1;
        }

        .field-input {
          width: 100%;
          padding: 13px 14px 13px 44px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: #f0f2ff;
          background: rgba(11, 13, 20, 0.8);
          transition: all 0.2s ease;
          outline: none;
          box-sizing: border-box;
          -webkit-text-fill-color: #f0f2ff;
        }

        .field-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15), 0 0 20px rgba(99, 102, 241, 0.08);
          background: rgba(15, 17, 26, 0.9);
        }

        .field-input::placeholder {
          color: #3a3f55;
        }

        .field-suffix {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #4a5068;
          font-size: 14px;
          cursor: pointer;
          transition: color 0.2s;
          background: none;
          border: none;
          padding: 4px;
          line-height: 1;
        }

        .field-suffix:hover {
          color: #a0aec0;
        }

        /* Error */
        .error-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #f87171;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 20px;
          animation: shakeIn 0.3s ease;
        }

        @keyframes shakeIn {
          0%  { transform: translateX(-6px); }
          25% { transform: translateX(6px); }
          50% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
          100%{ transform: translateX(0); }
        }

        /* Submit button */
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-weight: 700;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 4px;
          letter-spacing: 0.01em;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(99, 102, 241, 0.45);
          filter: brightness(1.05);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Divider */
        .login-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 24px 0 20px;
        }

        /* Footer */
        .login-footer {
          text-align: center;
          font-size: 12px;
          color: #3a3f55;
          margin-top: 28px;
        }

        /* Spinner */
        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Security badge */
        .security-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 12px;
          color: #4a5068;
          margin-top: 16px;
        }

        @media (max-width: 480px) {
          .login-card { padding: 24px 20px; border-radius: 18px; }
          .login-logo-title { font-size: 24px; }
          .login-logo-icon { width: 56px; height: 56px; font-size: 22px; }
        }
      `}</style>

      <div className="admin-login-root">
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />

        <div className="login-wrapper">
          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo-icon">🛡️</div>
            <div className="login-logo-title">duoexchange </div>
            <div className="login-logo-sub">Admin Control Panel</div>
          </div>

          {/* Card */}
          <div className="login-card">
            <form onSubmit={handleLogin}>
              {/* Email */}
              <div className="field-group">
                <label className="field-label" htmlFor="admin-email">Email Address</label>
                <div className="field-wrap">
                  <span className="field-prefix">
                    <i className="fas fa-envelope" />
                  </span>
                  <input
                    id="admin-email"
                    type="email"
                    className="field-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@duoexchange.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field-group">
                <label className="field-label" htmlFor="admin-password">Password</label>
                <div className="field-wrap">
                  <span className="field-prefix">
                    <i className="fas fa-lock" />
                  </span>
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    className="field-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: "44px" }}
                  />
                  <button
                    type="button"
                    className="field-suffix"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="error-box" role="alert">
                  <i className="fas fa-exclamation-circle" />
                  {error}
                </div>
              )}

              <div className="login-divider" />

              {/* Submit */}
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
                id="admin-login-btn"
              >
                {loading ? (
                  <>
                    <span className="btn-spinner" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-shield-alt" />
                    Sign In to Dashboard
                  </>
                )}
              </button>
            </form>

            {/* Security notice */}
            <div className="security-badge">
              <i className="fas fa-lock" style={{ fontSize: "10px" }} />
              Secured with end-to-end encryption
            </div>
          </div>

          <div className="login-footer">
            © 2024 duoexchange . All rights reserved.
          </div>
        </div>
      </div>
    </>
  );
}
