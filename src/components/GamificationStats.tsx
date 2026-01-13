import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap, Flame, Snowflake, Trophy } from 'lucide-react';

// Import from context, but handle errors gracefully
let useGamification: any;
try {
  useGamification = require('@/contexts/GamificationContext').useGamification;
} catch (e) {
  useGamification = null;
}

export const GamificationStats = () => {
  // If context not available, show nothing (don't break the app)
  if (!useGamification) {
    return null;
  }

  try {
    const { state } = useGamification();

    if (!state) {
      return null;
    }

    const xpPercentage = state.nextLevelXP > 0 
      ? (state.currentLevelXP / state.nextLevelXP) * 100 
      : 0;

    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Level & XP */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Level {state.level}</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-1">
            {state.tierName} - {state.identity}
          </div>
          <Progress value={xpPercentage} className="h-2" />
          <div className="text-xs text-muted-foreground mt-1">
            {state.currentLevelXP} / {state.nextLevelXP} XP
          </div>
        </Card>

        {/* Total XP */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">Total XP</span>
            </div>
            <div className="text-2xl font-bold">{state.totalXP}</div>
          </div>
        </Card>

        {/* Current Streak */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Streak</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{state.streaks?.current || 0}</div>
              <div className="text-xs text-muted-foreground">
                Best: {state.streaks?.longest || 0}
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
              <div className="text-2xl font-bold">{state.streaks?.freezesAvailable || 0}</div>
              <div className="text-xs text-muted-foreground">
                Used: {state.streaks?.freezesUsed || 0}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('GamificationStats error:', error);
    return null; // Don't break the app
  }
};
