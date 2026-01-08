import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../auth/AdminContext";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAdmin();

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }

    setSubmitting(true);
    setError(null);
    const result = await login(password.trim());
    if (!result.success) {
      setError(result.error || "Invalid password");
    }
    setSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="admin-login">
        <div className="admin-login__card">
          <p style={{ opacity: 0.6 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <h1 className="admin-login__title">Admin Portal</h1>
        <p className="admin-login__subtitle">Enter your curator password</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="admin-login__error">{error}</div>}

          <input
            type="password"
            className="admin-login__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            disabled={submitting}
            autoFocus
          />

          <button type="submit" className="admin-login__btn" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
