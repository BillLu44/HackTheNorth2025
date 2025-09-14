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

  const label = theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode";

  return (
    <button
      type="button"
      onClick={cycle}
      title={label}
      aria-label={label}
      className="theme-toggle"
    >
      <div className="toggle-track">
        <div className={`toggle-thumb ${theme === "dark" ? "dark" : "light"}`}>
          {theme === "light" ? <Sun /> : <Moon />}
        </div>
      </div>
      <style jsx>{`
        .theme-toggle {
          position: relative;
          width: 64px;
          height: 32px;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          padding: 0;
          outline: none;
        }
        
        .theme-toggle:focus-visible {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
        
        .toggle-track {
          width: 100%;
          height: 100%;
          background: ${theme === "light" ? "linear-gradient(135deg, #fbbf24, #f59e0b)" : "linear-gradient(135deg, #1e293b, #334155)"};
          border-radius: 16px;
          position: relative;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid var(--c-border);
        }
        
        .toggle-thumb {
          position: absolute;
          top: 2px;
          width: 28px;
          height: 28px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          color: ${theme === "light" ? "#f59e0b" : "#60a5fa"};
        }
        
        .toggle-thumb.light {
          left: 2px;
          transform: translateX(0);
        }
        
        .toggle-thumb.dark {
          left: 2px;
          transform: translateX(32px);
        }
        
        .theme-toggle:hover .toggle-thumb {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transform: ${theme === "light" ? "translateX(0) scale(1.1)" : "translateX(32px) scale(1.1)"};
        }
      `}</style>
    </button>
  );
}
