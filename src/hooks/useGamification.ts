import { useState, useEffect, useCallback } from 'react';
import { 
  GamificationState,
  calculateLevel,
  getXPForCurrentLevel,
  getXPForNextLevel,
  calculateDayQuality,
  calculateXPForCompletion,
  DayQuality,
  RecoveryEvent,
  getRecoveryType,
  calculateRecoveryXP,
  RECOVERY_CONFIG,
  STREAK_RULES,
  ELITE_ACHIEVEMENTS,
  getLevelTier,
  StreakFreezeEvent,
} from '@/types/gamification';

const STORAGE_KEY = 'habitbloom_gamification';

const getInitialState = (): GamificationState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        achievements: parsed.achievements?.length > 0 
          ? parsed.achievements 
          : ELITE_ACHIEVEMENTS.map(a => ({ 
              ...a, 
              progress: 0, 
              total: a.criteria.target 
            })),
      };
    }
  } catch (e) {
    console.error('Failed to parse gamification state:', e);
  }
  
  const now = new Date().toISOString();
  return {
    totalXP: 0,
    level: 1,
    currentLevelXP: 0,
    nextLevelXP: 100,
    tierName: 'Foundation',
    identity: 'Starting your journey',
    
    streaks: {
      current: 0,
      longest: 0,
      freezesAvailable: 0,
      freezesUsed: 0,
      lastCompletedDate: null,
      isPaused: false,
      freezeHistory: [],
    },
    
    recoveries: [],
    achievements: ELITE_ACHIEVEMENTS.map(a => ({ 
      ...a, 
      progress: 0, 
      total: a.criteria.target 
    })),
    
    dayQuality: null,
    weeklyReflection: null,
    
    firstUseDate: now,
    lastActiveDate: now,
    totalDaysActive: 1,
  };
};

export const useGamification = () => {
  const [state, setState] = useState<GamificationState>(getInitialState);

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save gamification state:', e);
    }
  }, [state]);

  // Add XP and recalculate level
  const addXP = useCallback((xpAmount: number) => {
    if (xpAmount <= 0) return;

    setState(prev => {
      const newTotalXP = prev.totalXP + xpAmount;
      const newLevel = calculateLevel(newTotalXP);
      const currentLevelXP = getXPForCurrentLevel(newTotalXP, newLevel);
      const nextLevelXP = getXPForNextLevel(newLevel);
      const tier = getLevelTier(newLevel);
      
      // Check if we earned new freezes
      const prevFreezes = Math.floor(prev.totalXP / 500);
      const newFreezes = Math.floor(newTotalXP / 500);
      const freezesEarned = newFreezes - prevFreezes;
      
      return {
        ...prev,
        totalXP: newTotalXP,
        level: newLevel,
        currentLevelXP,
        nextLevelXP,
        tierName: tier.name,
        identity: tier.identity,
        lastActiveDate: new Date().toISOString(),
        streaks: {
          ...prev.streaks,
          freezesAvailable: Math.min(
            prev.streaks.freezesAvailable + freezesEarned,
            STREAK_RULES.MAX_FREEZES
          ),
        },
      };
    });
  }, []);

  // Handle habit completion with full XP calculation
  const onHabitComplete = useCallback((params: {
    habitId: string;
    isFirstTime: boolean;
    currentStreak: number;
    completedToday: number;
    totalToday: number;
    lastCompletedDate: string | null;
  }) => {
    setState(prev => {
      const { 
        habitId, 
        isFirstTime, 
        currentStreak, 
        completedToday, 
        totalToday, 
        lastCompletedDate 
      } = params;

      // Calculate day quality
      const dayQuality = calculateDayQuality(completedToday, totalToday);
      
      // Check for recovery
      let isRecovery = false;
      let recoveryGapDays = 0;
      
      if (lastCompletedDate) {
        const lastDate = new Date(lastCompletedDate);
        const today = new Date();
        lastDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        const diffTime = today.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
          isRecovery = true;
          recoveryGapDays = diffDays - 1;
        }
      }
      
      // Calculate XP earned
      const habitXP = calculateXPForCompletion({
        isFirstTime,
        currentStreak,
        dayQuality: dayQuality.quality,
        isRecovery,
        recoveryGapDays,
      });
      
      const totalXPEarned = habitXP + dayQuality.bonusXP;
      
      // Update totals
      const newTotalXP = prev.totalXP + totalXPEarned;
      const newLevel = calculateLevel(newTotalXP);
      const currentLevelXP = getXPForCurrentLevel(newTotalXP, newLevel);
      const nextLevelXP = getXPForNextLevel(newLevel);
      const tier = getLevelTier(newLevel);
      
      // Handle recovery event
      const newRecoveries = [...prev.recoveries];
      if (isRecovery && recoveryGapDays > 0) {
        const recoveryType = getRecoveryType(recoveryGapDays);
        const recoveryXP = calculateRecoveryXP(recoveryGapDays);
        
        const recoveryEvent: RecoveryEvent = {
          id: `recovery_${Date.now()}_${Math.random()}`,
          habitId,
          missedDays: recoveryGapDays,
          recoveryDate: new Date().toISOString(),
          xpAwarded: recoveryXP,
          type: recoveryType,
          achievementUnlocked: RECOVERY_CONFIG[recoveryType].badge,
        };
        
        newRecoveries.push(recoveryEvent);
      }
      
      // Check freeze earnings
      const prevFreezes = Math.floor(prev.totalXP / 500);
      const newFreezes = Math.floor(newTotalXP / 500);
      const freezesEarned = newFreezes - prevFreezes;
      
      return {
        ...prev,
        totalXP: newTotalXP,
        level: newLevel,
        currentLevelXP,
        nextLevelXP,
        tierName: tier.name,
        identity: tier.identity,
        dayQuality,
        recoveries: newRecoveries,
        lastActiveDate: new Date().toISOString(),
        streaks: {
          ...prev.streaks,
          freezesAvailable: Math.min(
            prev.streaks.freezesAvailable + freezesEarned,
            STREAK_RULES.MAX_FREEZES
          ),
        },
      };
    });
  }, []);

  // Increment streak
  const incrementStreak = useCallback(() => {
    setState(prev => {
      const newCurrent = prev.streaks.current + 1;
      const newLongest = Math.max(prev.streaks.longest, newCurrent);
      
      return {
        ...prev,
        streaks: {
          ...prev.streaks,
          current: newCurrent,
          longest: newLongest,
          lastCompletedDate: new Date().toISOString(),
          isPaused: false,
        },
      };
    });
  }, []);

  // Break streak (reset to 0)
  const breakStreak = useCallback(() => {
    setState(prev => ({
      ...prev,
      streaks: {
        ...prev.streaks,
        current: 0,
        isPaused: false,
      },
    }));
  }, []);

  // Use a streak freeze
  const useStreakFreeze = useCallback((habitId: string) => {
    setState(prev => {
      if (prev.streaks.freezesAvailable <= 0) {
        console.warn('No freezes available');
        return prev;
      }
      
      const freezeEvent: StreakFreezeEvent = {
        id: `freeze_${Date.now()}_${Math.random()}`,
        usedAt: new Date().toISOString(),
        habitId,
        reason: 'manual',
        daysProtected: STREAK_RULES.FREEZE_DURATION_DAYS,
      };
      
      return {
        ...prev,
        streaks: {
          ...prev.streaks,
          freezesAvailable: prev.streaks.freezesAvailable - 1,
          freezesUsed: prev.streaks.freezesUsed + 1,
          isPaused: true,
          freezeHistory: [...prev.streaks.freezeHistory, freezeEvent],
        },
      };
    });
  }, []);

  // Update day quality
  const updateDayQuality = useCallback((completed: number, total: number) => {
    const quality = calculateDayQuality(completed, total);
    setState(prev => ({
      ...prev,
      dayQuality: quality,
    }));
  }, []);

  // Check and unlock achievements
  const checkAchievements = useCallback(() => {
    setState(prev => {
      const updatedAchievements = prev.achievements.map(achievement => {
        if (achievement.unlockedAt) return achievement;
        
        let progress = achievement.progress || 0;
        let completed = false;
        
        switch (achievement.criteria.type) {
          case 'recovery':
            progress = prev.recoveries.length;
            completed = progress >= achievement.criteria.target;
            break;
            
          case 'longevity':
            const daysSinceFirst = Math.floor(
              (new Date().getTime() - new Date(prev.firstUseDate).getTime()) / (1000 * 60 * 60 * 24)
            );
            progress = daysSinceFirst;
            completed = progress >= achievement.criteria.target;
            break;
            
          case 'streak':
            progress = prev.streaks.longest;
            completed = progress >= achievement.criteria.target;
            break;
            
          case 'day_quality':
            progress = achievement.progress || 0;
            if (prev.dayQuality?.quality === DayQuality.PERFECT) {
              progress += 1;
            }
            completed = progress >= achievement.criteria.target;
            break;
            
          case 'completion_rate':
            progress = 0;
            break;
            
          case 'custom':
            progress = 0;
            break;
        }
        
        if (completed && !achievement.unlockedAt) {
          return {
            ...achievement,
            progress: achievement.criteria.target,
            unlockedAt: new Date().toISOString(),
          };
        }
        
        return { ...achievement, progress };
      });
      
      return { ...prev, achievements: updatedAchievements };
    });
  }, []);

  const resetGamification = useCallback(() => {
    setState(getInitialState());
  }, []);

  return {
    state,
    addXP,
    onHabitComplete,
    incrementStreak,
    breakStreak,
    useStreakFreeze,
    updateDayQuality,
    checkAchievements,
    resetGamification,
  };
};
