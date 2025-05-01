// src/components/Navbar.jsx
import "./Navbar.css";
import logo from "../Assets/logo.png";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export const Navbar = () => {
  const isLoggedIn = !!localStorage.getItem("auth-token");
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  /* 锁定 body 滚动，避免移动端菜单打开后背景滚动 */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("schedule-id");
    window.location.replace("/");
  };

  return (
    <nav className="navbar">
      {/* logo */}
      <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
        <img src={logo} alt="logo" />
      </Link>

      {/* hamburger */}
      <button
        aria-label="Toggle menu"
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span />
        <span />
        <span />
      </button>

      {/* desktop links */}
      <ul className="nav-menu desktop-only">
        {isLoggedIn && (
          <>
            <li>
              <Link
                to="/homepage"
                className={`nav-menu-item ${
                  pathname === "/homepage" ? "active" : ""
                }`}
              >
                Chat with AI
              </Link>
            </li>
            <li>
              <Link
                to="/calendar"
                className={`nav-menu-item ${
                  pathname === "/calendar" ? "active" : ""
                }`}
              >
                Calendar
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className={`nav-menu-item ${
                  pathname === "/settings" ? "active" : ""
                }`}
              >
                Settings
              </Link>
            </li>
          </>
        )}
      </ul>

      {/* desktop auth */}
      <div className="nav-login desktop-only">
        {isLoggedIn ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login">
            <button>Login</button>
          </Link>
        )}
      </div>

      {/* mobile panel */}
      <div className={`mobile-panel ${menuOpen ? "show" : ""}`}>
        <ul className="nav-menu mobile-only" onClick={() => setMenuOpen(false)}>
          {isLoggedIn && (
            <>
              <li>
                <Link
                  to="/homepage"
                  className={`nav-menu-item ${
                    pathname === "/homepage" ? "active" : ""
                  }`}
                >
                  Chat with AI
                </Link>
              </li>
              <li>
                <Link
                  to="/calendar"
                  className={`nav-menu-item ${
                    pathname === "/calendar" ? "active" : ""
                  }`}
                >
                  Calendar
                </Link>
              </li>
              <li>
                <Link
                  to="/settings"
                  className={`nav-menu-item ${
                    pathname === "/settings" ? "active" : ""
                  }`}
                >
                  Settings
                </Link>
              </li>
            </>
          )}
        </ul>
        <div className="nav-login mobile-only">
          {isLoggedIn ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <Link to="/login">
              <button>Login</button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
