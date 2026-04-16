import { create, SetState } from "zustand";

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  loadFromStorage: () => void;
}

export const useThemeStore = create<ThemeState>(
  (set: SetState<ThemeState>) => ({
    isDarkMode: false,

    toggleTheme: () => {
      set((state) => {
        const newDarkMode = !state.isDarkMode;
        localStorage.setItem("theme", newDarkMode ? "dark" : "light");
        updateDOM(newDarkMode);
        return { isDarkMode: newDarkMode };
      });
    },

    setTheme: (isDark: boolean) => {
      localStorage.setItem("theme", isDark ? "dark" : "light");
      updateDOM(isDark);
      set({ isDarkMode: isDark });
    },

    loadFromStorage: () => {
      const theme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const isDark = theme ? theme === "dark" : prefersDark;
      updateDOM(isDark);
      set({ isDarkMode: isDark });
    },
  }),
);

function updateDOM(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}
