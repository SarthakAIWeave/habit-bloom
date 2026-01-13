import { useGamification } from '@/contexts/GamificationContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AchievementCategory, AchievementTier } from '@/types/gamification';

export const AchievementsDebugPanel = () => {
  try {
    const { state } = useGamification();

    if (!state || !state.achievements) {
      return (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading achievements...</p>
        </Card>
      );
    }

    const getTierColor = (tier: AchievementTier) => {
      switch (tier) {
        case AchievementTier.BRONZE:
          return 'bg-orange-700 text-white';
        case AchievementTier.SILVER:
          return 'bg-gray-400 text-gray-900';
        case AchievementTier.GOLD:
          return 'bg-yellow-500 text-gray-900';
        case AchievementTier.PLATINUM:
          return 'bg-purple-600 text-white';
      }
    };

    const getCategoryColor = (category: AchievementCategory) => {
      switch (category) {
        case AchievementCategory.RECOVERY:
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case AchievementCategory.CONSISTENCY:
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case AchievementCategory.DISCIPLINE:
          return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case AchievementCategory.LONGEVITY:
          return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        case AchievementCategory.QUALITY:
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      }
    };

    const groupedAchievements = state.achievements.reduce((acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    }, {} as Record<AchievementCategory, typeof state.achievements>);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Achievements Debug Panel</h2>
          <Badge variant="outline">
            {state.achievements.filter(a => a.unlockedAt).length} / {state.achievements.length} Unlocked
          </Badge>
        </div>

        {Object.entries(groupedAchievements).map(([category, achievements]) => (
          <Card key={category} className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Badge className={getCategoryColor(category as AchievementCategory)}>
                {category}
              </Badge>
              <span className="text-muted-foreground text-sm">
                ({achievements.filter(a => a.unlockedAt).length}/{achievements.length})
              </span>
            </h3>

            <div className="grid gap-3">
              {achievements.map(achievement => {
                const progressPercent = achievement.total 
                  ? ((achievement.progress || 0) / achievement.total) * 100 
                  : 0;
                const isUnlocked = !!achievement.unlockedAt;

                return (
                  <div 
                    key={achievement.id} 
                    className={`p-3 border rounded-lg ${isUnlocked ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {achievement.icon && <span className="text-xl">{achievement.icon}</span>}
                          <h4 className={`font-semibold ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {achievement.name}
                          </h4>
                          <Badge className={getTierColor(achievement.tier)} variant="secondary">
                            {achievement.tier}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm font-medium">+{achievement.xpReward} XP</div>
                        {isUnlocked && (
                          <div className="text-xs text-primary">✓ Unlocked</div>
                        )}
                      </div>
                    </div>

                    {!isUnlocked && achievement.total && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>{achievement.progress || 0} / {achievement.total}</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    )}

                    {isUnlocked && achievement.unlockedAt && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    );
  } catch (error) {
    console.error('AchievementsDebugPanel error:', error);
    return (
      <Card className="p-8 text-center">
        <p className="text-destructive">Error loading achievements</p>
      </Card>
    );
  }
};
