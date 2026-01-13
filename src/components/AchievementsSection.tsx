import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Safe import
let useGamification: any;
try {
  useGamification = require('@/contexts/GamificationContext').useGamification;
} catch (e) {
  useGamification = null;
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'bronze': return 'bg-amber-700 text-white';
    case 'silver': return 'bg-slate-400 text-slate-900';
    case 'gold': return 'bg-yellow-500 text-yellow-900';
    case 'platinum': return 'bg-violet-600 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'recovery': return 'text-green-600 dark:text-green-400';
    case 'consistency': return 'text-blue-600 dark:text-blue-400';
    case 'discipline': return 'text-red-600 dark:text-red-400';
    case 'longevity': return 'text-purple-600 dark:text-purple-400';
    case 'quality': return 'text-yellow-600 dark:text-yellow-400';
    default: return 'text-gray-600';
  }
};

export const AchievementsSection = () => {
  const [showAll, setShowAll] = useState(false);

  if (!useGamification) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Achievements</h3>
        <p className="text-muted-foreground">Achievements system loading...</p>
      </Card>
    );
  }

  try {
    const { state } = useGamification();

    if (!state || !state.achievements || state.achievements.length === 0) {
      return (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Achievements</h3>
          <p className="text-muted-foreground">No achievements available yet.</p>
        </Card>
      );
    }

    const unlockedCount = state.achievements.filter((a: any) => a.unlockedAt).length;
    const totalCount = state.achievements.length;

    // Group by category
    const grouped = state.achievements.reduce((acc: any, achievement: any) => {
      const cat = achievement.category || 'other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(achievement);
      return acc;
    }, {});

    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Achievements</h3>
            <p className="text-sm text-muted-foreground">
              {unlockedCount} of {totalCount} unlocked
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={(unlockedCount / totalCount) * 100} className="w-24 h-2" />
            <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(grouped).map(([category, achievements]: [string, any]) => {
            const catUnlocked = achievements.filter((a: any) => a.unlockedAt).length;

            return (
              <div key={category} className="border rounded-lg overflow-hidden">
                <div className="p-3 bg-muted/30 flex items-center justify-between">
                  <span className={`font-semibold capitalize ${getCategoryColor(category)}`}>
                    {category}
                  </span>
                  <Badge variant="outline">{catUnlocked}/{achievements.length}</Badge>
                </div>
                
                {showAll && (
                  <div className="p-3 grid gap-2 sm:grid-cols-2">
                    {achievements.map((achievement: any) => {
                      const isUnlocked = !!achievement.unlockedAt;
                      const total = achievement.total || achievement.criteria?.target || 1;
                      const progress = achievement.progress || 0;
                      const percent = Math.min((progress / total) * 100, 100);

                      return (
                        <div 
                          key={achievement.id}
                          className={`p-3 border rounded-lg ${isUnlocked ? 'bg-primary/5' : 'bg-muted/20'}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{achievement.icon || '🏆'}</span>
                            <span className={`font-medium ${isUnlocked ? '' : 'text-muted-foreground'}`}>
                              {achievement.name}
                            </span>
                            <Badge className={getTierColor(achievement.tier)} variant="secondary">
                              {achievement.tier}
                            </Badge>
                            {isUnlocked && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                          <p className="text-xs text-primary mt-1">+{achievement.xpReward} XP</p>
                          
                          {!isUnlocked && (
                            <div className="mt-2">
                              <Progress value={percent} className="h-1" />
                              <p className="text-xs text-muted-foreground mt-1">{progress}/{total}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    );
  } catch (error) {
    console.error('AchievementsSection error:', error);
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Achievements</h3>
        <p className="text-muted-foreground">Error loading achievements.</p>
      </Card>
    );
  }
};
