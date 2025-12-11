import { Moon, Sun, Flame, Zap, Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UserStats, getXpForNextLevel, LEVEL_THRESHOLDS } from '@/types/habit';
import { useTheme } from 'next-themes';

interface HeaderProps {
  stats: UserStats;
}

export function Header({ stats }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const currentLevelXp = LEVEL_THRESHOLDS[stats.level - 1] || 0;
  const nextLevelXp = getXpForNextLevel(stats.level);
  const progressXp = stats.xp - currentLevelXp;
  const neededXp = nextLevelXp - currentLevelXp;
  const progressPercent = neededXp > 0 ? (progressXp / neededXp) * 100 : 100;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
              HF
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground">HabitFlow</h1>
              <p className="text-xs text-muted-foreground">Build better habits</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* Stats Pills */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5 rounded-full bg-xp/10 px-3 py-1.5 text-sm font-medium">
                <Zap className="h-4 w-4 text-xp" />
                <span className="text-foreground">{stats.xp} XP</span>
              </div>
              
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-sm font-medium">
                <Flame className="h-4 w-4 text-destructive" />
                <span className="text-foreground">{stats.currentStreak} day</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium">
                <Snowflake className="h-4 w-4 text-primary" />
                <span className="text-foreground">{stats.streakFreezes}</span>
              </div>
            </div>

            {/* Level Progress */}
            <div className="hidden md:flex flex-col gap-1 min-w-[120px]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Level {stats.level}</span>
                <span className="text-muted-foreground">{progressXp}/{neededXp}</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
