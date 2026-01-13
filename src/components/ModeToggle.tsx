import { useTheme } from '@/contexts/ThemeContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Gamepad2 } from 'lucide-react';

export const ModeToggle = () => {
  const { mode, toggleMode } = useTheme();

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Gamepad2 className="h-4 w-4 text-muted-foreground" />
        <Label htmlFor="gamification-mode" className="text-sm font-medium cursor-pointer">
          Gamification Mode
        </Label>
      </div>
      <Switch
        id="gamification-mode"
        checked={mode === 'game'}
        onCheckedChange={toggleMode}
      />
    </div>
  );
};
