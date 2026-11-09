import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import { readJSON, writeJSON } from '../utils/storage';

type Mode = 'light' | 'dark';
interface ThemeContextValue {
  mode: Mode;
  setMode: (m: Mode) => void;
}
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>(() => readJSON<Mode>(STORAGE_KEYS.theme, 'light'));
  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    writeJSON(STORAGE_KEYS.theme, m);
    document.documentElement.dataset.theme = m;
  }, []);
  document.documentElement.dataset.theme = mode;
  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within <ThemeProvider>');
  return ctx;
}
