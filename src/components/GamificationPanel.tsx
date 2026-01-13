import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/hooks/useGamification';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Flame, Snowflake, Trophy, Zap } from 'lucide-react';

export const GamificationPanel = () => {
  const { mode } = useTheme();
  const { stats } = useGamification();

  if (mode === 'professional') return null;

  const xpPercentage = (stats.currentLevelXP / stats.nextLevelXP) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Level & XP */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Level {stats.level}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {stats.currentLevelXP} / {stats.nextLevelXP} XP
          </span>
        </div>
        <Progress value={xpPercentage} className="h-2" />
      </Card>

      {/* Current Streak */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium">Streak</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <div className="text-xs text-muted-foreground">
              Best: {stats.longestStreak}
            </div>
          </div>
        </div>
      </Card>

      {/* Streak Freezes */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium">Freezes</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stats.freezesAvailable}</div>
            <div className="text-xs text-muted-foreground">
              Used: {stats.freezesUsed}
            </div>
          </div>
        </div>
      </Card>

      {/* Perfect Days */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium">Perfect Days</span>
          </div>
          <div className="text-2xl font-bold">{stats.perfectDays}</div>
        </div>
      </Card>
    </div>
  );
};
