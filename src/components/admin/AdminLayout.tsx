import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAdmin } from "../../auth/AdminContext";
import { useEffect } from "react";

export function AdminLayout() {
  const { isAuthenticated, isLoading, logout } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/admin/login", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="admin-portal">
        <p style={{ padding: 24, opacity: 0.6 }}>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-portal">
      <header className="admin-header">
        <div className="admin-header__brand">BookShook Admin</div>
        <nav className="admin-header__nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `admin-nav-link ${isActive ? "admin-nav-link--active" : ""}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/submissions"
            className={({ isActive }) => `admin-nav-link ${isActive ? "admin-nav-link--active" : ""}`}
          >
            Submissions
          </NavLink>
          <NavLink
            to="/admin/proposals"
            className={({ isActive }) => `admin-nav-link ${isActive ? "admin-nav-link--active" : ""}`}
          >
            Proposals
          </NavLink>
          <button onClick={handleLogout} className="admin-nav-link admin-nav-link--logout">
            Logout
          </button>
        </nav>
      </header>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
