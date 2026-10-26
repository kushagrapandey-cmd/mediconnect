// Apply theme before the first paint; only a visual preference is stored.
(() => {
  let saved;
  try {
    saved = localStorage.getItem("mc_theme");
  } catch {
    /* storage may be blocked */
  }
  const theme = ["light", "dark"].includes(saved)
    ? saved
    : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#0e2428" : "#126653");
})();
