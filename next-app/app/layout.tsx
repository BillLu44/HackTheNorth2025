import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "../components/theme-toggle";

export const metadata: Metadata = {
  title: "Wishlist™ App",
  description: "An app built for Hack The North 2025.",
  icons: [
    { rel: "icon", url: "/wishlist-light-16.png", sizes: "16x16", media: "(prefers-color-scheme: light)"},
    { rel: "icon", url: "/wishlist-light-32.png", sizes: "32x32", media: "(prefers-color-scheme: light)"},
    { rel: "icon", url: "/wishlist-light-64.png", sizes: "64x64", media: "(prefers-color-scheme: light)"},
    { rel: "icon", url: "/wishlist-light-1000.png", sizes: "1000x1000", media: "(prefers-color-scheme: light)"},
    { rel: "icon", url: "/wishlist-dark-16.png", sizes: "16x16", media: "(prefers-color-scheme: dark)"},
    { rel: "icon", url: "/wishlist-dark-32.png", sizes: "32x32", media: "(prefers-color-scheme: dark)"},
    { rel: "icon", url: "/wishlist-dark-64.png", sizes: "64x64", media: "(prefers-color-scheme: dark)"},
    { rel: "icon", url: "/wishlist-dark-1000.png", sizes: "1000x1000", media: "(prefers-color-scheme: dark)"},
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {/* Global top-right theme switcher */}
        <div style={{ position: "fixed", bottom: 12, left: 72, zIndex: 50 }}>
          <ThemeToggle />
        </div>
        {children}
      </body>
    </html>
  );
}

const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme'); // 'light' | 'dark' | 'system' | null
    var root = document.documentElement;

    function apply(theme) {
      if (theme === 'light') { root.setAttribute('data-theme','light'); return; }
      if (theme === 'dark')  { root.setAttribute('data-theme','dark');  return; }
      // system (default): remove explicit attr and let CSS @media drive it
      root.removeAttribute('data-theme');
    }

    apply(stored);
    if (!stored || stored === 'system') {
      var m = window.matchMedia('(prefers-color-scheme: dark)');
      // keep in sync while on 'system'
      m.addEventListener('change', function(){ if(!localStorage.getItem('theme') || localStorage.getItem('theme')==='system'){ apply('system'); }});
    }
  } catch (_) {}
})();`;