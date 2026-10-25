import React, { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || "light",
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#0e2428" : "#126653");
  }, [theme]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const followSystem = (event) => {
      let saved;
      try {
        saved = localStorage.getItem("mc_theme");
      } catch {
        /* optional preference */
      }
      if (!["light", "dark"].includes(saved))
        setTheme(event.matches ? "dark" : "light");
    };
    const syncTabs = (event) => {
      if (event.key === "mc_theme" || event.key === null) {
        setTheme(
          ["light", "dark"].includes(event.newValue)
            ? event.newValue
            : media.matches
              ? "dark"
              : "light",
        );
      }
    };
    media.addEventListener("change", followSystem);
    window.addEventListener("storage", syncTabs);
    return () => {
      media.removeEventListener("change", followSystem);
      window.removeEventListener("storage", syncTabs);
    };
  }, []);
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("mc_theme", next);
    } catch {
      /* theme still works for this visit */
    }
    setTheme(next);
  }
  return (
    <button
      className="theme-toggle"
      role="switch"
      aria-label="Dark mode"
      aria-checked={theme === "dark"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
    >
      {theme === "dark" ? <FiSun /> : <FiMoon />}
      <span>{theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
