import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import ForgotPasswordModal from "../../components/ForgotPasswordModal";
import { authService } from "../../services/api";

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

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
    }
    return newErrors;
  };

  const handleLogin = () => {
    setApiError("");
    setErrors({});
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    authService
      .login(email, password)
      .then(({ status, data }) => {
        setLoading(false);
        if (status === 200) {
          localStorage.setItem("user", JSON.stringify(data.user));
          onLoginSuccess(data.user);
          navigate("/dashboard");        // ← navigate after login
        } else {
          const errMsg = data.error || "Something went wrong. Try again.";
          const lowerMsg = errMsg.toLowerCase();
          if (lowerMsg.includes("password")) {
            setErrors({ password: errMsg });
          } else if (
            lowerMsg.includes("email") ||
            lowerMsg.includes("user") ||
            lowerMsg.includes("not found")
          ) {
            setErrors({ email: errMsg });
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
        <div className="brand">
          <div className="brand-icon">🎬</div>
          <span className="brand-name">Movies App</span>
        </div>

        <div className="login-card">
          <h1>Sign in</h1>
          <p className="subtitle">Enter your credentials to continue</p>

          {apiError && <div className="alert alert-error">{apiError}</div>}

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

          <div className="field">
            <div className="pw-label-row">
              <label htmlFor="password">Password</label>
              <button className="forgot-link" onClick={() => setShowForgot(true)}>
                Forgot password?
              </button>
            </div>
            <div className="pw-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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

          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="switch-link">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
}