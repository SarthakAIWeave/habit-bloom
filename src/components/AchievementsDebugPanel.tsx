import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AchievementCategory, AchievementTier, Achievement } from '@/types/gamification';
import { useGamification } from '@/contexts/GamificationContext';

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
    default:
      return 'bg-gray-500 text-white';
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
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const AchievementsDebugPanel = () => {
  const gamification = useGamification();
  
  if (!gamification || !gamification.state) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Loading gamification...</p>
      </Card>
    );
  }

  const { state } = gamification;

  if (!state.achievements || state.achievements.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No achievements available</p>
      </Card>
    );
  }

  const groupedAchievements = state.achievements.reduce((acc, achievement) => {
    const category = achievement.category || 'unknown';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const unlockedCount = state.achievements.filter(a => a.unlockedAt).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Achievements Debug Panel</h2>
        <Badge variant="outline">
          {unlockedCount} / {state.achievements.length} Unlocked
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
              const total = achievement.total || achievement.criteria?.target || 1;
              const progress = achievement.progress || 0;
              const progressPercent = (progress / total) * 100;
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

                  {!isUnlocked && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{progress} / {total}</span>
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
};
