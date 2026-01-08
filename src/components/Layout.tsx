import { NavLink, Link } from "react-router-dom";
import { BookOpen, Flame, User, Menu, X } from "lucide-react";
import { useState } from "react";
import AccountPill from "./AccountPill";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="vault-layout">
      {/* Floating Navigation */}
      <header className="vault-nav">
        <Link to="/" className="vault-nav__logo">
          <span className="vault-nav__logo-text">BookShook</span>
        </Link>

        <nav className="vault-nav__links">
          <NavLink
            to="/books"
            className={({ isActive }) =>
              `vault-nav__link ${isActive ? "vault-nav__link--active" : ""}`
            }
          >
            The Vault
          </NavLink>
          <NavLink
            to="/collections"
            className={({ isActive }) =>
              `vault-nav__link ${isActive ? "vault-nav__link--active" : ""}`
            }
          >
            Collections
          </NavLink>
          <NavLink
            to="/friday-pick"
            className={({ isActive }) =>
              `vault-nav__link ${isActive ? "vault-nav__link--active" : ""}`
            }
          >
            Friday Pick
          </NavLink>
          <NavLink
            to="/my/library"
            className={({ isActive }) =>
              `vault-nav__link ${isActive ? "vault-nav__link--active" : ""}`
            }
          >
            My Library
          </NavLink>
        </nav>

        <div className="vault-nav__actions">
          <AccountPill />
          <button
            className="vault-nav__mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="vault-nav__mobile-menu">
          <NavLink
            to="/books"
            className="vault-nav__mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            The Vault
          </NavLink>
          <NavLink
            to="/collections"
            className="vault-nav__mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Collections
          </NavLink>
          <NavLink
            to="/friday-pick"
            className="vault-nav__mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Friday Pick
          </NavLink>
          <NavLink
            to="/my/library"
            className="vault-nav__mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            My Library
          </NavLink>
          <NavLink
            to="/membership"
            className="vault-nav__mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Membership
          </NavLink>
          <NavLink
            to="/about"
            className="vault-nav__mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </NavLink>
        </div>
      )}

      <main className="vault-main">{children}</main>

      {/* Footer */}
      <footer className="vault-footer">
        <div className="vault-footer__content">
          <div className="vault-footer__brand">
            <span className="vault-footer__logo">BookShook</span>
            <p className="vault-footer__tagline">
              350 books a year so you never waste a night.
            </p>
          </div>

          <nav className="vault-footer__nav">
            <div className="vault-footer__col">
              <h4 className="vault-footer__heading">Explore</h4>
              <Link to="/books" className="vault-footer__link">The Vault</Link>
              <Link to="/collections" className="vault-footer__link">Collections</Link>
              <Link to="/friday-pick" className="vault-footer__link">Friday Pick</Link>
            </div>
            <div className="vault-footer__col">
              <h4 className="vault-footer__heading">Account</h4>
              <Link to="/my/library" className="vault-footer__link">My Library</Link>
              <Link to="/membership" className="vault-footer__link">Membership</Link>
            </div>
            <div className="vault-footer__col">
              <h4 className="vault-footer__heading">About</h4>
              <Link to="/about" className="vault-footer__link">The Founder</Link>
              <a href="mailto:shook@bookshook.com" className="vault-footer__link">Contact</a>
            </div>
          </nav>
        </div>

        <div className="vault-footer__bottom">
          <p className="vault-footer__copyright">
            &copy; {new Date().getFullYear()} BookShook. Made with <Flame size={14} className="vault-footer__flame" /> in the vault.
          </p>
        </div>
      </footer>
    </div>
  );
}
