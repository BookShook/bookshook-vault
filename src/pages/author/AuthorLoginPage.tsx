import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthor } from "../../auth/AuthorContext";

export function AuthorLoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuthor();

  const [tokenInput, setTokenInput] = useState(searchParams.get("token") || "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Auto-login if token in URL
  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken && !isAuthenticated && !isLoading && !submitting) {
      handleLogin(urlToken);
    }
  }, [searchParams, isAuthenticated, isLoading]);

  // Redirect if already authenticated and clean up token from URL
  useEffect(() => {
    if (isAuthenticated) {
      // Remove token from URL to prevent leaking via screenshots, analytics, referrers
      if (window.location.search.includes("token=")) {
        window.history.replaceState({}, "", window.location.pathname);
      }
      navigate("/author", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleLogin(token: string) {
    if (!token.trim()) {
      setError("Please enter your invite token");
      return;
    }

    setSubmitting(true);
    setError(null);
    const result = await login(token.trim());
    if (!result.success) {
      setError(result.error || "Invalid or expired token");
    }
    setSubmitting(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(tokenInput);
  };

  if (isLoading) {
    return (
      <div className="author-login">
        <div className="author-login__card">
          <p style={{ opacity: 0.6 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="author-login">
      <div className="author-login__card">
        <h1 className="author-login__title">Author Portal</h1>
        <p className="author-login__subtitle">Enter your invite token to continue</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="author-login__error">{error}</div>}

          <input
            type="text"
            className="author-login__input"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Paste your invite token"
            disabled={submitting}
            autoFocus
          />

          <button type="submit" className="author-login__btn" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: 13, opacity: 0.6 }}>
          Don't have a token? Contact your publisher or BookShook support.
        </p>
      </div>
    </div>
  );
}
