import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import { authService } from "../../services/api";

export default function Register({ onRegisterSuccess }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    if (!password.trim()) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    return newErrors;
  };

  const handleRegister = () => {
    setApiError("");
    setErrors({});

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    authService
      .register(email, password)
      .then(({ status, data }) => {
        setLoading(false);
        if (status === 201) {
          onRegisterSuccess(data.user);
          navigate("/dashboard");
        } else {
          const errMsg = data.error || "Something went wrong. Try again.";
          const lowerMsg = errMsg.toLowerCase();
          if (lowerMsg.includes("email")) {
            setErrors({ email: errMsg });
          } else if (lowerMsg.includes("password")) {
            setErrors({ password: errMsg });
          } else {
            setApiError(errMsg);
          }
        }
      })
      .catch(() => {
        setLoading(false);
        setApiError("Cannot reach the server. Check your connection.");
      });
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* ── Brand ─────────────────────────────────────────────── */}
        <div className="brand">
          <div className="brand-icon">🎬</div>
          <span className="brand-name">Movies App</span>
        </div>

        {/* ── Card ──────────────────────────────────────────────── */}
        <div className="login-card">
          <h1>Create account</h1>
          <p className="subtitle">Sign up to get started</p>

          {apiError && <div className="alert alert-error">{apiError}</div>}

          {/* Email */}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="pw-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: "" }));
                }}
                className={errors.password ? "input-error" : ""}
              />
              <button
                className="eye-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="pw-wrap">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
                className={errors.confirmPassword ? "input-error" : ""}
              />
              <button
                className="eye-btn"
                onClick={() => setShowConfirm((prev) => !prev)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword}</span>
            )}
          </div>

          <button className="login-btn" onClick={handleRegister} disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>

          {/* Link to Login */}
          <p className="switch-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}