import { NavLink } from "react-router-dom";
import AccountPill from "./AccountPill";

const navLinkStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "inherit",
  padding: "4px 8px",
  borderRadius: 6,
  fontSize: 14,
};

const navLinkActiveStyle: React.CSSProperties = {
  ...navLinkStyle,
  fontWeight: 600,
  background: "rgba(0,0,0,.06)",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <header
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: "1px solid rgba(0,0,0,.08)",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 20 }}>BookShook Vault</div>

        <nav style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <NavLink
            to="/"
            end
            style={({ isActive }) => (isActive ? navLinkActiveStyle : navLinkStyle)}
          >
            Home
          </NavLink>
          <NavLink
            to="/books"
            style={({ isActive }) => (isActive ? navLinkActiveStyle : navLinkStyle)}
          >
            Books
          </NavLink>
          <NavLink
            to="/collections"
            style={({ isActive }) => (isActive ? navLinkActiveStyle : navLinkStyle)}
          >
            Collections
          </NavLink>
          <NavLink
            to="/recommendations"
            style={({ isActive }) => (isActive ? navLinkActiveStyle : navLinkStyle)}
          >
            Recommendations
          </NavLink>
          <NavLink
            to="/my/library"
            style={({ isActive }) => (isActive ? navLinkActiveStyle : navLinkStyle)}
          >
            My Library
          </NavLink>
        </nav>

        <AccountPill />
      </header>

      <main>{children}</main>
    </div>
  );
}
