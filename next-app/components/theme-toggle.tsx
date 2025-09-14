"use client";
import { useTheme } from "@/context/theme-context";

function Sun() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
function Moon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycle = () => setTheme(theme === "light" ? "dark" : "light");

  const label = theme === "light" ? "Theme: Light" : "Theme: Dark";

  const Icon = theme === "light" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={cycle}
      title={label}
      aria-label={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 999,
        border: "1px solid var(--c-border)",
        background: "var(--c-panel)",
        color: "var(--c-text)",
        boxShadow: "0 6px 16px var(--c-shadow)",
        cursor: "pointer",
      }}
    >
      <Icon />
      <span style={{ fontSize: 13, color: "var(--c-text-secondary)" }}>
        {theme === "light" ? "light" : "dark"}
      </span>
    </button>
  );
}
