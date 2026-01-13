import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ThemeToggle: React.FC = () => {
  const { visualTheme, toggleVisualTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleVisualTheme}
      aria-label={`Switch to ${visualTheme === 'light' ? 'dark' : 'light'} theme`}
      title={`Switch to ${visualTheme === 'light' ? 'dark' : 'light'} theme`}
    >
      {visualTheme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
};
