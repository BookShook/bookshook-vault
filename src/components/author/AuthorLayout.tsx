import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthor } from "../../auth/AuthorContext";
import { useEffect } from "react";

export function AuthorLayout() {
  const { author, isAuthenticated, isLoading, logout } = useAuthor();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/author/login", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/author/login");
  };

  if (isLoading) {
    return (
      <div className="author-portal">
        <div className="author-content" style={{ textAlign: "center", paddingTop: 80 }}>
          <p style={{ opacity: 0.6 }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const authorName = author && "display_name" in author && author.display_name
    ? author.display_name
    : author && "email" in author
    ? author.email
    : "Author";

  return (
    <div className="author-portal">
      <header className="author-header">
        <div className="author-header__brand">BookShook Author Portal</div>
        <nav className="author-header__nav">
          <NavLink
            to="/author"
            end
            className={({ isActive }) => `author-nav-link ${isActive ? "author-nav-link--active" : ""}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/author/submissions"
            className={({ isActive }) => `author-nav-link ${isActive ? "author-nav-link--active" : ""}`}
          >
            Submissions
          </NavLink>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              opacity: 0.8,
              fontSize: "0.875rem",
            }}
          >
            Logout
          </button>
        </nav>
      </header>
      <main className="author-content">
        <Outlet />
      </main>
    </div>
  );
}
