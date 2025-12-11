import { TrendingUp, Target, Calendar, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Habit, UserStats } from '@/types/habit';
import { format, subDays } from 'date-fns';

interface StatsOverviewProps {
  habits: Habit[];
  stats: UserStats;
}

export function StatsOverview({ habits, stats }: StatsOverviewProps) {
  // Calculate completion rate for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => 
    format(subDays(new Date(), i), 'yyyy-MM-dd')
  );
  
  const totalPossible = habits.length * 7;
  const totalCompleted = habits.reduce((acc, habit) => {
    return acc + habit.completions.filter(c => last7Days.includes(c.date)).length;
  }, 0);
  
  const completionRate = totalPossible > 0 
    ? Math.round((totalCompleted / totalPossible) * 100) 
    : 0;

  // Best habit (highest streak)
  const bestHabit = habits.reduce((best, habit) => 
    habit.streak > (best?.streak || 0) ? habit : best, 
    habits[0]
  );

  const statCards = [
    {
      label: 'Weekly Completion',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Active Habits',
      value: habits.length.toString(),
      icon: Target,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Best Streak',
      value: `${stats.longestStreak} days`,
      icon: Calendar,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
    {
      label: 'Badges Earned',
      value: stats.badges.length.toString(),
      icon: Award,
      color: 'text-xp',
      bg: 'bg-xp/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statCards.map((stat) => (
        <Card key={stat.label} className="p-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
