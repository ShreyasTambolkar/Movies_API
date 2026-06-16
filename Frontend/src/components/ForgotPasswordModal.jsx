import { useState } from "react";
import { authService } from "../services/api";

export default function ForgotPasswordModal({ onClose }) {
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotSubmit = () => {
    setForgotError("");
    setForgotMessage("");
    if (!forgotEmail.trim()) {
      setForgotError("Please enter your email.");
      return;
    }

    setLoading(true);
    authService
      .forgotPassword(forgotEmail)
      .then((data) => {
        setLoading(false);
        setForgotMessage(data.message || "Reset link sent!");
      })
      .catch(() => {
        setLoading(false);
        setForgotError("Could not connect. Try again.");
      });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Reset password</h2>
        <p>Enter your email and we'll send a reset link.</p>

        {forgotError && <div className="alert alert-error">{forgotError}</div>}
        {forgotMessage && <div className="alert alert-success">{forgotMessage}</div>}

        <div className="field">
          <label htmlFor="forgot-email">Email</label>
          <input
            id="forgot-email"
            type="email"
            placeholder="you@example.com"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="modal-btns">
          <button className="send-btn" onClick={handleForgotSubmit} disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
          <button className="modal-cancel-btn" onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
