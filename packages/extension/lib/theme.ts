const THEME_KEY = 'devkits-theme';

export type Theme = 'light' | 'dark';

export function getTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') return stored;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}

export function toggleTheme(): void {
  const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}
