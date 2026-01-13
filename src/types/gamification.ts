// ═══════════════════════════════════════════════════════════════
// ELITE GAMIFICATION TYPE SYSTEM
// Philosophy: Progress visualization, not addiction
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// XP SYSTEM (Derived, Not Stored)
// ─────────────────────────────────────────────────────────────

export const XP_RULES = {
  // Base XP
  BINARY_HABIT: 10,
  QUANTITATIVE_BASE: 10,
  QUANTITATIVE_BONUS_PER_UNIT: 2,
  
  // Streak Bonuses (subtle, not explosive)
  STREAK_BONUS_THRESHOLD: 7, // Weekly milestone
  STREAK_BONUS_MULTIPLIER: 1.2, // +20% max
  
  // Day Quality Bonuses
  GOOD_DAY_BONUS: 5,
  STRONG_DAY_BONUS: 10,
  PERFECT_DAY_BONUS: 20,
  
  // Recovery Rewards (SECRET SAUCE)
  RECOVERY_BONUS: 15, // Reward the comeback
  RESILIENCE_BONUS: 25, // 3+ day gap recovery
  
  // Anti-Patterns (What we DON'T reward)
  NO_AUTO_COMPLETE_XP: true,
  NO_XP_INFLATION: true,
} as const;

export const LEVEL_SYSTEM = {
  BASE_XP: 100,
  MULTIPLIER: 1.5, // Exponential curve
  MAX_LEVEL: 100, // Prevent infinite grinding
  
  // Identity-Based Level Names
  TIERS: [
    { min: 1, max: 5, name: 'Foundation', identity: 'Starting your journey', color: 'slate' },
    { min: 6, max: 10, name: 'Builder', identity: 'Building consistency', color: 'blue' },
    { min: 11, max: 20, name: 'Consistent', identity: 'Living your habits', color: 'indigo' },
    { min: 21, max: 35, name: 'Architect', identity: 'Mastering discipline', color: 'violet' },
    { min: 36, max: Infinity, name: 'Legend', identity: 'Embodying excellence', color: 'purple' },
  ] as const,
} as const;

// ─────────────────────────────────────────────────────────────
// DAY QUALITY SYSTEM (Better than "Perfect Day" obsession)
// ─────────────────────────────────────────────────────────────

export enum DayQuality {
  INCOMPLETE = 'incomplete',
  GOOD = 'good',           // 50-74% completion
  STRONG = 'strong',       // 75-99% completion
  PERFECT = 'perfect',     // 100% completion
}

export const DAY_QUALITY_CONFIG = {
  [DayQuality.INCOMPLETE]: { minRate: 0, maxRate: 49, label: 'Incomplete', color: 'gray' },
  [DayQuality.GOOD]: { minRate: 50, maxRate: 74, label: 'Good Day', color: 'blue' },
  [DayQuality.STRONG]: { minRate: 75, maxRate: 99, label: 'Strong Day', color: 'indigo' },
  [DayQuality.PERFECT]: { minRate: 100, maxRate: 100, label: 'Perfect Day', color: 'violet' },
} as const;

export interface DayQualityScore {
  quality: DayQuality;
  completionRate: number;
  habitCount: number;
  completedCount: number;
  bonusXP: number;
  message: string;
}

// ─────────────────────────────────────────────────────────────
// STREAK SYSTEM (Forgiving, Not Punishing)
// ─────────────────────────────────────────────────────────────

export interface StreakData {
  current: number;
  longest: number;
  freezesAvailable: number;
  freezesUsed: number;
  lastCompletedDate: string | null;
  isPaused: boolean; // Paused vs Broken
  freezeHistory: StreakFreezeEvent[];
}

export interface StreakFreezeEvent {
  id: string;
  usedAt: string;
  habitId: string;
  reason: 'manual' | 'auto';
  daysProtected: number;
}

export const STREAK_RULES = {
  FREEZE_EARN_THRESHOLD: 7, // Earn freeze every 7 days
  MAX_FREEZES: 3,
  FREEZE_DURATION_DAYS: 2, // Grace period
  AUTO_FREEZE: false, // Manual by default
  FREEZE_XP_COST: 0, // No cost - they earned it
} as const;

// ─────────────────────────────────────────────────────────────
// RECOVERY SYSTEM (What separates elite apps)
// ─────────────────────────────────────────────────────────────

export interface RecoveryEvent {
  id: string;
  habitId: string;
  missedDays: number;
  recoveryDate: string;
  xpAwarded: number;
  achievementUnlocked?: string;
  type: RecoveryType;
}

export enum RecoveryType {
  QUICK_RETURN = 'quick_return',      // 1-2 day gap
  RESILIENT_RETURN = 'resilient',     // 3-7 day gap
  COMEBACK = 'comeback',              // 7+ day gap
}

export const RECOVERY_CONFIG = {
  [RecoveryType.QUICK_RETURN]: { 
    minDays: 1, 
    maxDays: 2, 
    xp: 15, 
    message: 'Quick recovery! Back on track.',
    badge: 'resilient_i'
  },
  [RecoveryType.RESILIENT_RETURN]: { 
    minDays: 3, 
    maxDays: 7, 
    xp: 25, 
    message: 'Strong comeback after a break.',
    badge: 'resilient_ii'
  },
  [RecoveryType.COMEBACK]: { 
    minDays: 8, 
    maxDays: Infinity, 
    xp: 50, 
    message: 'Incredible comeback! Never too late.',
    badge: 'phoenix'
  },
} as const;

// ─────────────────────────────────────────────────────────────
// ACHIEVEMENT SYSTEM (Insightful, Not Collectible)
// ─────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  xpReward: number;
  criteria: AchievementCriteria;
  unlockedAt?: string;
  progress?: number;
  total?: number;
  icon?: string;
}

export enum AchievementCategory {
  CONSISTENCY = 'consistency',
  RECOVERY = 'recovery',
  DISCIPLINE = 'discipline',
  LONGEVITY = 'longevity',
  QUALITY = 'quality',
}

export enum AchievementTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export interface AchievementCriteria {
  type: 'streak' | 'completion_rate' | 'recovery' | 'day_quality' | 'longevity' | 'custom';
  target: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  customValidator?: (data: any) => boolean;
}

// ─────────────────────────────────────────────────────────────
// ELITE ACHIEVEMENT DEFINITIONS
// ─────────────────────────────────────────────────────────────

export const ELITE_ACHIEVEMENTS: Omit<Achievement, 'unlockedAt' | 'progress'>[] = [
  // RECOVERY (What makes this elite)
  {
    id: 'quick_recovery',
    name: 'Resilient I',
    description: 'Returned after missing a day',
    category: AchievementCategory.RECOVERY,
    tier: AchievementTier.BRONZE,
    xpReward: 15,
    criteria: { type: 'recovery', target: 1 },
    icon: '🔄',
  },
  {
    id: 'comeback_king',
    name: 'Phoenix',
    description: 'Returned after a 7+ day gap',
    category: AchievementCategory.RECOVERY,
    tier: AchievementTier.GOLD,
    xpReward: 50,
    criteria: { type: 'recovery', target: 7 },
    icon: '🔥',
  },
  
  // CONSISTENCY (Not perfection)
  {
    id: 'consistent_week',
    name: 'Steady I',
    description: 'Maintained 80% consistency for 7 days',
    category: AchievementCategory.CONSISTENCY,
    tier: AchievementTier.BRONZE,
    xpReward: 30,
    criteria: { type: 'completion_rate', target: 80, timeframe: 'weekly' },
    icon: '📈',
  },
  {
    id: 'consistent_month',
    name: 'Steady Builder',
    description: 'Maintained 80% consistency for 30 days',
    category: AchievementCategory.CONSISTENCY,
    tier: AchievementTier.SILVER,
    xpReward: 100,
    criteria: { type: 'completion_rate', target: 80, timeframe: 'monthly' },
    icon: '🏗️',
  },
  
  // QUALITY (Effort over outcome)
  {
    id: 'quality_week',
    name: 'Strong Week',
    description: 'Achieved 5+ Strong Days in a week',
    category: AchievementCategory.QUALITY,
    tier: AchievementTier.BRONZE,
    xpReward: 30,
    criteria: { type: 'day_quality', target: 5, timeframe: 'weekly' },
    icon: '💪',
  },
  
  // LONGEVITY (Identity building)
  {
    id: 'month_one',
    name: 'Foundation',
    description: 'Used the app for 30 days',
    category: AchievementCategory.LONGEVITY,
    tier: AchievementTier.BRONZE,
    xpReward: 50,
    criteria: { type: 'longevity', target: 30 },
    icon: '🌱',
  },
  {
    id: 'year_one',
    name: 'Architect',
    description: 'Used the app for 365 days',
    category: AchievementCategory.LONGEVITY,
    tier: AchievementTier.PLATINUM,
    xpReward: 500,
    criteria: { type: 'longevity', target: 365 },
    icon: '🏛️',
  },
  
  // DISCIPLINE
  {
    id: 'perfect_week',
    name: 'Perfectionist I',
    description: '7 Perfect Days in a row',
    category: AchievementCategory.DISCIPLINE,
    tier: AchievementTier.SILVER,
    xpReward: 75,
    criteria: { type: 'day_quality', target: 7, timeframe: 'weekly' },
    icon: '⭐',
  },
];

// ─────────────────────────────────────────────────────────────
// EXPANDED ELITE ACHIEVEMENT DEFINITIONS (20+)
// ─────────────────────────────────────────────────────────────

export const ELITE_ACHIEVEMENTS: Omit<Achievement, 'unlockedAt' | 'progress'>[] = [
  // ═══════════════════════════════════════════════════════════
  // RECOVERY ACHIEVEMENTS (Comeback Rewards)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'quick_recovery',
    name: 'Resilient I',
    description: 'Returned after missing a day',
    category: AchievementCategory.RECOVERY,
    tier: AchievementTier.BRONZE,
    xpReward: 15,
    criteria: { type: 'recovery', target: 1 },
    icon: '🔄',
  },
  {
    id: 'resilient_returner',
    name: 'Resilient II',
    description: 'Recovered from 5 different gaps',
    category: AchievementCategory.RECOVERY,
    tier: AchievementTier.SILVER,
    xpReward: 50,
    criteria: { type: 'recovery', target: 5 },
    icon: '💪',
  },
  {
    id: 'comeback_king',
    name: 'Phoenix',
    description: 'Returned after a 7+ day gap',
    category: AchievementCategory.RECOVERY,
    tier: AchievementTier.GOLD,
    xpReward: 75,
    criteria: { type: 'recovery', target: 7 },
    icon: '🔥',
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Recovered 10+ times',
    category: AchievementCategory.RECOVERY,
    tier: AchievementTier.PLATINUM,
    xpReward: 150,
    criteria: { type: 'recovery', target: 10 },
    icon: '⚡',
  },

  // ═══════════════════════════════════════════════════════════
  // CONSISTENCY ACHIEVEMENTS (Not Perfection)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'consistent_week',
    name: 'Steady I',
    description: '80%+ consistency for 7 days',
    category: AchievementCategory.CONSISTENCY,
    tier: AchievementTier.BRONZE,
    xpReward: 30,
    criteria: { type: 'completion_rate', target: 80, timeframe: 'weekly' },
    icon: '📈',
  },
  {
    id: 'consistent_month',
    name: 'Steady Builder',
    description: '80%+ consistency for 30 days',
    category: AchievementCategory.CONSISTENCY,
    tier: AchievementTier.SILVER,
    xpReward: 100,
    criteria: { type: 'completion_rate', target: 80, timeframe: 'monthly' },
    icon: '🏗️',
  },
  {
    id: 'consistent_quarter',
    name: 'Rock Solid',
    description: '75%+ consistency for 90 days',
    category: AchievementCategory.CONSISTENCY,
    tier: AchievementTier.GOLD,
    xpReward: 250,
    criteria: { type: 'completion_rate', target: 75, timeframe: 'all_time' },
    icon: '🪨',
  },
  {
    id: 'year_consistency',
    name: 'Unbreakable',
    description: '70%+ consistency for 365 days',
    category: AchievementCategory.CONSISTENCY,
    tier: AchievementTier.PLATINUM,
    xpReward: 500,
    criteria: { type: 'completion_rate', target: 70, timeframe: 'all_time' },
    icon: '💎',
  },

  // ═══════════════════════════════════════════════════════════
  // STREAK ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: '7 day streak',
    category: AchievementCategory.DISCIPLINE,
    tier: AchievementTier.BRONZE,
    xpReward: 25,
    criteria: { type: 'streak', target: 7 },
    icon: '🔥',
  },
  {
    id: 'streak_30',
    name: 'Month Master',
    description: '30 day streak',
    category: AchievementCategory.DISCIPLINE,
    tier: AchievementTier.SILVER,
    xpReward: 100,
    criteria: { type: 'streak', target: 30 },
    icon: '🌟',
  },
  {
    id: 'streak_100',
    name: 'Century',
    description: '100 day streak',
    category: AchievementCategory.DISCIPLINE,
    tier: AchievementTier.GOLD,
    xpReward: 300,
    criteria: { type: 'streak', target: 100 },
    icon: '💯',
  },
  {
    id: 'streak_365',
    name: 'Year Legend',
    description: '365 day streak',
    category: AchievementCategory.DISCIPLINE,
    tier: AchievementTier.PLATINUM,
    xpReward: 1000,
    criteria: { type: 'streak', target: 365 },
    icon: '👑',
  },

  // ═══════════════════════════════════════════════════════════
  // QUALITY ACHIEVEMENTS (Day Quality Focus)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'first_perfect_day',
    name: 'Perfectionist I',
    description: 'Complete all habits in one day',
    category: AchievementCategory.QUALITY,
    tier: AchievementTier.BRONZE,
    xpReward: 20,
    criteria: { type: 'day_quality', target: 1, timeframe: 'all_time' },
    icon: '⭐',
  },
  {
    id: 'quality_week',
    name: 'Strong Week',
    description: '5+ Strong Days in a week',
    category: AchievementCategory.QUALITY,
    tier: AchievementTier.BRONZE,
    xpReward: 30,
    criteria: { type: 'day_quality', target: 5, timeframe: 'weekly' },
    icon: '💪',
  },
  {
    id: 'perfect_week',
    name: 'Perfectionist II',
    description: '7 Perfect Days in a row',
    category: AchievementCategory.QUALITY,
    tier: AchievementTier.SILVER,
    xpReward: 75,
    criteria: { type: 'day_quality', target: 7, timeframe: 'weekly' },
    icon: '✨',
  },
  {
    id: 'ten_perfect_days',
    name: 'Excellence',
    description: '10 Perfect Days (total)',
    category: AchievementCategory.QUALITY,
    tier: AchievementTier.GOLD,
    xpReward: 150,
    criteria: { type: 'day_quality', target: 10, timeframe: 'all_time' },
    icon: '🌟',
  },

  // ═══════════════════════════════════════════════════════════
  // LONGEVITY ACHIEVEMENTS (Identity Building)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'week_one',
    name: 'First Steps',
    description: 'Used the app for 7 days',
    category: AchievementCategory.LONGEVITY,
    tier: AchievementTier.BRONZE,
    xpReward: 10,
    criteria: { type: 'longevity', target: 7 },
    icon: '👣',
  },
  {
    id: 'month_one',
    name: 'Foundation',
    description: 'Used the app for 30 days',
    category: AchievementCategory.LONGEVITY,
    tier: AchievementTier.BRONZE,
    xpReward: 50,
    criteria: { type: 'longevity', target: 30 },
    icon: '🌱',
  },
  {
    id: 'quarter_one',
    name: 'Committed',
    description: 'Used the app for 90 days',
    category: AchievementCategory.LONGEVITY,
    tier: AchievementTier.SILVER,
    xpReward: 150,
    criteria: { type: 'longevity', target: 90 },
    icon: '🌳',
  },
  {
    id: 'half_year',
    name: 'Dedicated',
    description: 'Used the app for 180 days',
    category: AchievementCategory.LONGEVITY,
    tier: AchievementTier.GOLD,
    xpReward: 300,
    criteria: { type: 'longevity', target: 180 },
    icon: '🏔️',
  },
  {
    id: 'year_one',
    name: 'Architect',
    description: 'Used the app for 365 days',
    category: AchievementCategory.LONGEVITY,
    tier: AchievementTier.PLATINUM,
    xpReward: 500,
    criteria: { type: 'longevity', target: 365 },
    icon: '🏛️',
  },

  // ═══════════════════════════════════════════════════════════
  // DISCIPLINE ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete habits before 9 AM for 7 days',
    category: AchievementCategory.DISCIPLINE,
    tier: AchievementTier.BRONZE,
    xpReward: 40,
    criteria: { type: 'custom', target: 7 },
    icon: '🌅',
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete all habits on 4 consecutive weekends',
    category: AchievementCategory.DISCIPLINE,
    tier: AchievementTier.SILVER,
    xpReward: 60,
    criteria: { type: 'custom', target: 4 },
    icon: '🎯',
  },
  {
    id: 'no_excuses',
    name: 'No Excuses',
    description: 'Never used a streak freeze',
    category: AchievementCategory.DISCIPLINE,
    tier: AchievementTier.GOLD,
    xpReward: 200,
    criteria: { type: 'custom', target: 0 },
    icon: '🛡️',
  },
];

// ─────────────────────────────────────────────────────────────
// GAMIFICATION STATE
// ─────────────────────────────────────────────────────────────

export interface GamificationState {
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  tierName: string;
  identity: string;
  
  streaks: StreakData;
  recoveries: RecoveryEvent[];
  achievements: Achievement[];
  
  dayQuality: DayQualityScore | null;
  weeklyReflection: WeeklyReflection | null;
  
  // Metadata
  firstUseDate: string;
  lastActiveDate: string;
  totalDaysActive: number;
}

export interface WeeklyReflection {
  weekStart: string;
  weekEnd: string;
  consistencyRate: number;
  bestDay: { date: string; quality: DayQuality };
  weakDay: { date: string; quality: DayQuality };
  longestStreak: number;
  recoveryWins: number;
  message: string;
  totalXP: number;
}

// ─────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────

export const calculateXPForCompletion = (params: {
  isFirstTime: boolean;
  currentStreak: number;
  dayQuality: DayQuality;
  isRecovery: boolean;
  recoveryGapDays?: number;
}): number => {
  let xp = XP_RULES.BINARY_HABIT;
  
  // Streak bonus (subtle) - only applies at weekly intervals
  const streakWeeks = Math.floor(params.currentStreak / XP_RULES.STREAK_BONUS_THRESHOLD);
  if (streakWeeks > 0) {
    xp = Math.floor(xp * Math.pow(XP_RULES.STREAK_BONUS_MULTIPLIER, streakWeeks));
  }
  
  // Day quality bonus
  switch (params.dayQuality) {
    case DayQuality.GOOD:
      xp += XP_RULES.GOOD_DAY_BONUS;
      break;
    case DayQuality.STRONG:
      xp += XP_RULES.STRONG_DAY_BONUS;
      break;
    case DayQuality.PERFECT:
      xp += XP_RULES.PERFECT_DAY_BONUS;
      break;
  }
  
  // Recovery bonus (SECRET SAUCE)
  if (params.isRecovery && params.recoveryGapDays) {
    xp += XP_RULES.RECOVERY_BONUS;
    if (params.recoveryGapDays >= 3) {
      xp += XP_RULES.RESILIENCE_BONUS;
    }
  }
  
  return Math.floor(xp);
};

export const calculateLevel = (totalXP: number): number => {
  let level = 1;
  let xpNeeded = LEVEL_SYSTEM.BASE_XP;
  let accumulatedXP = 0;
  
  while (totalXP >= accumulatedXP + xpNeeded && level < LEVEL_SYSTEM.MAX_LEVEL) {
    accumulatedXP += xpNeeded;
    level++;
    xpNeeded = Math.floor(LEVEL_SYSTEM.BASE_XP * Math.pow(LEVEL_SYSTEM.MULTIPLIER, level - 1));
  }
  
  return level;
};

export const getLevelTier = (level: number) => {
  return LEVEL_SYSTEM.TIERS.find(tier => level >= tier.min && level <= tier.max) || LEVEL_SYSTEM.TIERS[0];
};

export const getXPForCurrentLevel = (totalXP: number, level: number): number => {
  let accumulatedXP = 0;
  for (let i = 1; i < level; i++) {
    accumulatedXP += Math.floor(LEVEL_SYSTEM.BASE_XP * Math.pow(LEVEL_SYSTEM.MULTIPLIER, i - 1));
  }
  return totalXP - accumulatedXP;
};

export const getXPForNextLevel = (level: number): number => {
  if (level >= LEVEL_SYSTEM.MAX_LEVEL) return 0;
  return Math.floor(LEVEL_SYSTEM.BASE_XP * Math.pow(LEVEL_SYSTEM.MULTIPLIER, level - 1));
};

export const calculateDayQuality = (completed: number, total: number): DayQualityScore => {
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
  
  let quality: DayQuality = DayQuality.INCOMPLETE;
  let bonusXP = 0;
  let message = '';
  
  if (rate === 100) {
    quality = DayQuality.PERFECT;
    bonusXP = XP_RULES.PERFECT_DAY_BONUS;
    message = 'Exceptional consistency';
  } else if (rate >= 75) {
    quality = DayQuality.STRONG;
    bonusXP = XP_RULES.STRONG_DAY_BONUS;
    message = 'Strong execution';
  } else if (rate >= 50) {
    quality = DayQuality.GOOD;
    bonusXP = XP_RULES.GOOD_DAY_BONUS;
    message = 'Good progress';
  } else {
    quality = DayQuality.INCOMPLETE;
    bonusXP = 0;
    message = 'Room for improvement';
  }
  
  return {
    quality,
    completionRate: rate,
    habitCount: total,
    completedCount: completed,
    bonusXP,
    message,
  };
};

export const getRecoveryType = (missedDays: number): RecoveryType => {
  if (missedDays <= 2) return RecoveryType.QUICK_RETURN;
  if (missedDays <= 7) return RecoveryType.RESILIENT_RETURN;
  return RecoveryType.COMEBACK;
};

export const calculateRecoveryXP = (missedDays: number): number => {
  const recoveryType = getRecoveryType(missedDays);
  return RECOVERY_CONFIG[recoveryType].xp;
};

// Type guards
export const isDayQuality = (value: string): value is DayQuality => {
  return Object.values(DayQuality).includes(value as DayQuality);
};

export const isAchievementCategory = (value: string): value is AchievementCategory => {
  return Object.values(AchievementCategory).includes(value as AchievementCategory);
};
