import React, { useContext, useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
  useLocation,
} from "react-router-dom";
import { FiArrowRight, FiArrowUpRight, FiMenu, FiX } from "react-icons/fi";
import { Auth, api, Brand } from "./shared";
import Home from "./Home";
import About from "./About";
import Project from "./Project";
import Privacy from "./Privacy";
import AuthPage from "./AuthPage";
import Dashboard from "./Dashboard";
import NotFound from "./NotFound";
import ThemeToggle from "./ThemeToggle";
import "./App.css";
import "./theme.css";
function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
function Header() {
  const { user, logout } = useContext(Auth);
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc]);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <div className="header-controls">
          <ThemeToggle />
          <button
            className="menu-toggle"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
        <nav aria-label="Main navigation" className={open ? "open" : ""}>
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/about">Our approach</NavLink>
          <NavLink to="/contact">The project</NavLink>
          {user ? (
            <>
              <Link className="btn small" to="/dashboard">
                My workspace <FiArrowUpRight />
              </Link>
              <button className="text-btn" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/user-login">Sign in</Link>
              <Link className="btn small" to="/registration">
                Get started <FiArrowRight />
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
export default function App() {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
      setUser(null);
      window.location.assign("/user-login");
    } catch (e) {
      window.alert(e.message);
    }
  }
  return (
    <Auth.Provider value={{ user, setUser, loading, logout }}>
      <BrowserRouter>
        <ScrollReset />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Project />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/registration" element={<AuthPage signup />} />
          <Route path="/user-login" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/patient-dashboard"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/doctor-dashboard"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Auth.Provider>
  );
}
