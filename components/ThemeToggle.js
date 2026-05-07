"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      return stored;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      return;
    }

    document.documentElement.classList.remove("dark");
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label="Alternar tema"
      onClick={toggleTheme}
      className="inline-flex items-center justify-center text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
    >
      {isDark ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
        >
          <path
            d="M12 3.25v2.5M12 18.25v2.5M4.75 12h2.5M16.75 12h2.5M6.22 6.22l1.77 1.77M16.01 16.01l1.77 1.77M17.78 6.22l-1.77 1.77M7.99 16.01l-1.77 1.77"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M12 16.25a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
        >
          <path
            d="M21 14.5A7.5 7.5 0 0 1 9.5 3a6.75 6.75 0 1 0 11.5 11.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
