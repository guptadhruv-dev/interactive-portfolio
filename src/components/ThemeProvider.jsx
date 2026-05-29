import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fontFamily, typography, colors, motion } from '../design.config';

const STORAGE_KEY = 'theme-mode';

const ThemeContext = createContext({ mode: 'dark', toggleMode: () => {} });

function getInitialMode() {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  if (typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    const root  = document.documentElement;
    const theme = colors[mode];

    root.classList.remove('dark', 'light');
    root.classList.add(mode);

    root.style.setProperty('--font-family', fontFamily);

    root.style.setProperty('--color-bg-primary',   theme.background.primary);
    root.style.setProperty('--color-bg-secondary', theme.background.secondary);
    root.style.setProperty('--color-fg-primary',   theme.foreground.primary);
    root.style.setProperty('--color-fg-secondary', theme.foreground.secondary);

    root.style.setProperty('--text-heading-size',   typography.heading.fontSize);
    root.style.setProperty('--text-heading-weight', typography.heading.fontWeight);
    root.style.setProperty('--text-heading-lh',     typography.heading.lineHeight);

    root.style.setProperty('--text-nav-size',   typography.navButton.fontSize);
    root.style.setProperty('--text-nav-weight', typography.navButton.fontWeight);
    root.style.setProperty('--text-nav-lh',     typography.navButton.lineHeight);

    root.style.setProperty('--text-body-size',   typography.body.fontSize);
    root.style.setProperty('--text-body-weight', typography.body.fontWeight);
    root.style.setProperty('--text-body-lh',     typography.body.lineHeight);

    root.style.setProperty('--motion-duration', motion.duration);
    root.style.setProperty('--motion-ease',     motion.ease);

    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((m) => (m === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
