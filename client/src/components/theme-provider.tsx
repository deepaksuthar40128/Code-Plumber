import { createContext, useContext, useEffect, useState } from "react";
import { Toaster } from "sonner";

export type Theme = "Old-House" | "Android-Studio" | "Electronic" | "Basic-Light" | "Basic-Dark" | "Light" | "Dark" | "Kimbie-Red" | "Tomorrow-Night-Blue" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "Basic-Dark"
        : "Basic-Light";
      root.classList.add(systemTheme);
      setTheme(systemTheme);
      return;
    }
    root.classList.add(globalThemeMapper(theme));
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      <Toaster position="top-center" theme={globalThemeMapper(theme)} />
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

type originalThemes = "light" | "dark";

const globalThemeMapper = (theme: Theme): originalThemes => {
  if (theme === 'Light' || theme === 'Basic-Light') return 'light';
  else return "dark";
}