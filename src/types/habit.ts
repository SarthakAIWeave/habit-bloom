export type HabitCategory = 'fitness' | 'study' | 'wealth' | 'mental' | 'productivity' | 'custom';
export type HabitDifficulty = 'easy' | 'medium' | 'hard';
export type Mood = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

export interface HabitCompletion {
  date: string; // YYYY-MM-DD
  completed: boolean;
  note?: string;
  mood?: Mood;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  category: HabitCategory;
  difficulty: HabitDifficulty;
  streak: number;
  bestStreak: number;
  streakFreezes: number;
  completions: HabitCompletion[];
  createdAt: string;
  color: string;
}

export interface UserStats {
  xp: number;
  level: number;
  totalHabitsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  streakFreezes: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  requirement: number;
  type: 'streak' | 'completion' | 'xp' | 'perfect_week';
}

export const HABIT_TEMPLATES: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completions' | 'createdAt' | 'streakFreezes'>[] = [
  { name: 'Morning Workout', icon: 'Dumbbell', category: 'fitness', difficulty: 'medium', color: 'hsl(var(--chart-1))' },
  { name: 'Read for 30 min', icon: 'BookOpen', category: 'study', difficulty: 'easy', color: 'hsl(var(--chart-2))' },
  { name: 'Meditate', icon: 'Brain', category: 'mental', difficulty: 'easy', color: 'hsl(var(--xp))' },
  { name: 'Save $10', icon: 'PiggyBank', category: 'wealth', difficulty: 'medium', color: 'hsl(var(--success))' },
  { name: 'No Social Media', icon: 'Smartphone', category: 'productivity', difficulty: 'hard', color: 'hsl(var(--warning))' },
  { name: 'Drink 8 Glasses', icon: 'Droplets', category: 'fitness', difficulty: 'easy', color: 'hsl(var(--primary))' },
  { name: 'Journal Entry', icon: 'PenLine', category: 'mental', difficulty: 'easy', color: 'hsl(var(--chart-3))' },
  { name: 'Learn New Skill', icon: 'GraduationCap', category: 'study', difficulty: 'hard', color: 'hsl(var(--chart-4))' },
];

export const BADGES: Badge[] = [
  { id: 'first_step', name: 'First Step', description: 'Complete your first habit', icon: 'Footprints', requirement: 1, type: 'completion' },
  { id: 'week_warrior', name: 'Week Warrior', description: '7-day streak', icon: 'Flame', requirement: 7, type: 'streak' },
  { id: 'consistency_king', name: 'Consistency King', description: '30-day streak', icon: 'Crown', requirement: 30, type: 'streak' },
  { id: 'century', name: 'Century', description: 'Complete 100 habits', icon: 'Trophy', requirement: 100, type: 'completion' },
  { id: 'perfect_week', name: 'Perfect Week', description: 'Complete all habits for 7 days', icon: 'Star', requirement: 1, type: 'perfect_week' },
  { id: 'xp_hunter', name: 'XP Hunter', description: 'Earn 1000 XP', icon: 'Zap', requirement: 1000, type: 'xp' },
  { id: 'xp_master', name: 'XP Master', description: 'Earn 5000 XP', icon: 'Sparkles', requirement: 5000, type: 'xp' },
];

export const XP_VALUES: Record<HabitDifficulty, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
};

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000];

export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXpForNextLevel(level: number): number {
  return LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}
