import { createContext, useContext, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

const readTheme = () => {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.classList.contains('light') ? 'light' : 'dark';
};

const applyTheme = (theme) => {
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem('runboard-theme', theme);
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(readTheme);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggle: () => {
        setTheme((current) => {
          const next = current === 'dark' ? 'light' : 'dark';
          applyTheme(next);
          return next;
        });
      },
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
