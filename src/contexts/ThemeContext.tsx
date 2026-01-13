import React, { createContext, useContext, useEffect, useState } from 'react';

type VisualTheme = 'light' | 'dark';
type AppMode = 'professional' | 'game';

interface ThemeContextType {
  visualTheme: VisualTheme;
  mode: AppMode;
  setVisualTheme: (theme: VisualTheme) => void;
  setMode: (mode: AppMode) => void;
  toggleVisualTheme: () => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  VISUAL_THEME: 'habitbloom_visual_theme',
  MODE: 'habitbloom_mode',
  SYSTEM_PREFERENCE_OVERRIDE: 'habitbloom_system_override'
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [visualTheme, setVisualThemeState] = useState<VisualTheme>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.VISUAL_THEME);
    if (stored === 'light' || stored === 'dark') return stored;
    
    // Respect system preference by default
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [mode, setModeState] = useState<AppMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.MODE);
    // Default to professional mode
    return stored === 'game' ? 'game' : 'professional';
  });

  const setVisualTheme = (theme: VisualTheme) => {
    setVisualThemeState(theme);
    localStorage.setItem(STORAGE_KEYS.VISUAL_THEME, theme);
    localStorage.setItem(STORAGE_KEYS.SYSTEM_PREFERENCE_OVERRIDE, 'true');
  };

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEYS.MODE, newMode);
  };

  const toggleVisualTheme = () => {
    setVisualTheme(visualTheme === 'light' ? 'dark' : 'light');
  };

  const toggleMode = () => {
    setMode(mode === 'professional' ? 'game' : 'professional');
  };

  // Apply theme classes to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'professional', 'game');
    root.classList.add(visualTheme, mode);
    root.setAttribute('data-theme', visualTheme);
    root.setAttribute('data-mode', mode);
  }, [visualTheme, mode]);

  // Listen for system theme changes (only if user hasn't overridden)
  useEffect(() => {
    const hasOverride = localStorage.getItem(STORAGE_KEYS.SYSTEM_PREFERENCE_OVERRIDE);
    if (hasOverride === 'true') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setVisualThemeState(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ 
      visualTheme, 
      mode, 
      setVisualTheme, 
      setMode, 
      toggleVisualTheme, 
      toggleMode 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
