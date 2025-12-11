import { useState, useEffect, useCallback } from 'react';
import { Habit, UserStats, Badge, BADGES, XP_VALUES, calculateLevel } from '@/types/habit';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'habitflow_data';

interface HabitData {
  habits: Habit[];
  stats: UserStats;
}

const defaultStats: UserStats = {
  xp: 0,
  level: 1,
  totalHabitsCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  badges: [],
  streakFreezes: 3,
};

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: HabitData = JSON.parse(stored);
      setHabits(data.habits || []);
      setStats(data.stats || defaultStats);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ habits, stats }));
    }
  }, [habits, stats, loaded]);

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completions' | 'createdAt' | 'streakFreezes'>) => {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      streak: 0,
      bestStreak: 0,
      streakFreezes: 0,
      completions: [],
      createdAt: new Date().toISOString(),
    };
    setHabits(prev => [...prev, newHabit]);
    toast({ title: '✨ New habit created!', description: `Start building "${habit.name}" today.` });
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    toast({ title: 'Habit removed', description: 'The habit has been deleted.' });
  }, []);

  const toggleCompletion = useCallback((habitId: string, date: string, note?: string, mood?: string) => {
    let xpGained = 0;
    let newBadges: Badge[] = [];

    setHabits(prev => prev.map(habit => {
      if (habit.id !== habitId) return habit;

      const existingIndex = habit.completions.findIndex(c => c.date === date);
      let newCompletions = [...habit.completions];
      let newStreak = habit.streak;

      if (existingIndex >= 0) {
        // Toggle off
        newCompletions.splice(existingIndex, 1);
        newStreak = Math.max(0, newStreak - 1);
      } else {
        // Toggle on
        newCompletions.push({ date, completed: true, note, mood: mood as any });
        xpGained = XP_VALUES[habit.difficulty];
        
        // Calculate streak
        const today = format(new Date(), 'yyyy-MM-dd');
        const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
        const hasYesterday = newCompletions.some(c => c.date === yesterday);
        
        if (date === today) {
          newStreak = hasYesterday ? habit.streak + 1 : 1;
        }
      }

      return {
        ...habit,
        completions: newCompletions,
        streak: newStreak,
        bestStreak: Math.max(habit.bestStreak, newStreak),
      };
    }));

    if (xpGained > 0) {
      setStats(prev => {
        const newXp = prev.xp + xpGained;
        const newLevel = calculateLevel(newXp);
        const newTotal = prev.totalHabitsCompleted + 1;

        // Check for new badges
        BADGES.forEach(badge => {
          if (prev.badges.some(b => b.id === badge.id)) return;
          
          let earned = false;
          if (badge.type === 'completion' && newTotal >= badge.requirement) earned = true;
          if (badge.type === 'xp' && newXp >= badge.requirement) earned = true;
          
          if (earned) {
            newBadges.push({ ...badge, earnedAt: new Date().toISOString() });
          }
        });

        if (newLevel > prev.level) {
          toast({ title: '🎉 Level Up!', description: `You've reached level ${newLevel}!` });
        }

        newBadges.forEach(badge => {
          toast({ title: '🏆 Badge Earned!', description: badge.name });
        });

        return {
          ...prev,
          xp: newXp,
          level: newLevel,
          totalHabitsCompleted: newTotal,
          badges: [...prev.badges, ...newBadges],
        };
      });

      toast({ title: `+${xpGained} XP`, description: 'Keep going!' });
    }
  }, []);

  const useStreakFreeze = useCallback((habitId: string) => {
    if (stats.streakFreezes <= 0) {
      toast({ title: 'No streak freezes', description: 'You have no streak freezes left.', variant: 'destructive' });
      return;
    }

    setStats(prev => ({ ...prev, streakFreezes: prev.streakFreezes - 1 }));
    toast({ title: '❄️ Streak Freeze Used', description: 'Your streak is protected for today.' });
  }, [stats.streakFreezes]);

  const addNote = useCallback((habitId: string, date: string, note: string, mood?: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id !== habitId) return habit;
      
      const completions = habit.completions.map(c => 
        c.date === date ? { ...c, note, mood: mood as any } : c
      );
      
      return { ...habit, completions };
    }));
  }, []);

  return {
    habits,
    stats,
    loaded,
    addHabit,
    deleteHabit,
    toggleCompletion,
    useStreakFreeze,
    addNote,
  };
}
