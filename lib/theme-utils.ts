// Centralized theme management
export const THEME_CONFIG = {
  MODE_STORAGE_KEY: "gym-notes-mode",
  PALETTE_STORAGE_KEY: "gym-notes-theme",
  DEFAULT_MODE: "light",
  DEFAULT_PALETTE: "default",
} as const;

export const PALETTES = [
  { value: "default", label: "Default" },
  { value: "darkmatter", label: "Dark Matter" },
  { value: "doom64", label: "Doom 64" },
] as const;

export type Palette = (typeof PALETTES)[number]["value"];

// Apply theme to document synchronously
export function applyTheme() {
  if (typeof window === "undefined") return;

  try {
    const mode = localStorage.getItem(THEME_CONFIG.MODE_STORAGE_KEY);
    const palette = localStorage.getItem(THEME_CONFIG.PALETTE_STORAGE_KEY);

    // Apply dark mode
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Apply palette
    if (palette && palette !== THEME_CONFIG.DEFAULT_PALETTE) {
      document.documentElement.dataset.theme = palette;
    } else {
      delete document.documentElement.dataset.theme;
    }
  } catch (_e) {
    // localStorage might be unavailable in some contexts
  }
}

// Get inline script for HTML head (prevents FOUC)
export function getThemeScript() {
  return `
    (function() {
      try {
        const mode = localStorage.getItem("${THEME_CONFIG.MODE_STORAGE_KEY}");
        const palette = localStorage.getItem("${THEME_CONFIG.PALETTE_STORAGE_KEY}");
        if (mode === "dark") {
          document.documentElement.classList.add("dark");
        }
        if (palette && palette !== "${THEME_CONFIG.DEFAULT_PALETTE}") {
          document.documentElement.dataset.theme = palette;
        }
      } catch (e) {}
    })()
  `;
}
