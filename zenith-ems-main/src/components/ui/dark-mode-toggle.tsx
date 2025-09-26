import { Moon, Sun } from 'lucide-react';
import { Button } from './button';
import { getTheme, setTheme } from '@/store/theme';
import { useState, useEffect } from 'react';

export function DarkModeToggle() {
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    setThemeState(getTheme());
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setThemeState(newTheme);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 p-0 hover:bg-glass-background hover:backdrop-blur-sm"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}