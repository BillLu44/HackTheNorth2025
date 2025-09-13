"use client";

import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";

function Sun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
function Moon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
    </svg>
  );
}
function Sys() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M8 21h8M12 18v3" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  // load saved choice
  useEffect(() => {
    const stored = (localStorage.getItem("theme") as Theme | null) ?? "system";
    setTheme(stored);
  }, []);

  // apply choice
  useEffect(() => {
    const root = document.documentElement;
    const applySystem = () => {
      root.removeAttribute("data-theme");
      root.style.colorScheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    };
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
    } else if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
    } else {
      applySystem();
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // cycle: system -> light -> dark -> system
  const cycle = () =>
    setTheme((t) => (t === "system" ? "light" : t === "light" ? "dark" : "system"));

  const label = theme === "system" ? "Theme: System"
              : theme === "light"  ? "Theme: Light"
              : "Theme: Dark";

  const Icon = theme === "system" ? Sys : theme === "light" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={cycle}
      title={label}
      aria-label={label}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "8px 10px", borderRadius: 999,
        border: "1px solid var(--c-border)",
        background: "var(--c-panel)",
        color: "var(--c-text)",
        boxShadow: "0 6px 16px var(--c-shadow)",
        cursor: "pointer"
      }}
    >
      <Icon />
      <span style={{ fontSize: 13, color: "var(--c-text-secondary)" }}>
        {theme === "system" ? "System" : theme === "light" ? "Light" : "Dark"}
      </span>
    </button>
  );
}
