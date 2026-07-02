"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "cafeatlas-theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function subscribe(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener("cafeatlas-theme-change", handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("cafeatlas-theme-change", handler);
  };
}

function getSnapshot() {
  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  return storedTheme === "light" || storedTheme === "dark" ? storedTheme : null;
}

function getServerSnapshot() {
  return null;
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function handleToggle() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
    window.dispatchEvent(new Event("cafeatlas-theme-change"));
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--site-border)] bg-[var(--site-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--site-foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span
        aria-hidden="true"
        className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-950 text-[10px] text-white"
      >
        {theme === "dark" ? "☀" : "☾"}
      </span>
      <span>{theme === "dark" ? "Light" : theme === "light" ? "Dark" : "Theme"}</span>
    </button>
  );
}
