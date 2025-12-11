import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, Target, Flame, Award, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Habit, UserStats } from '@/types/habit';
import { format, subDays, startOfWeek, eachDayOfInterval, isWithinInterval, parseISO } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';

interface AnalyticsDashboardProps {
  habits: Habit[];
  stats: UserStats;
}

export function AnalyticsDashboard({ habits, stats }: AnalyticsDashboardProps) {
  // Calculate weekly data for the last 8 weeks
  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(new Date(), i * 7));
      const weekEnd = subDays(weekStart, -6);
      const weekDates = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(d => 
        format(d, 'yyyy-MM-dd')
      );
      
      const totalPossible = habits.length * 7;
      const totalCompleted = habits.reduce((acc, habit) => {
        return acc + habit.completions.filter(c => weekDates.includes(c.date)).length;
      }, 0);
      
      const rate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
      
      data.push({
        week: `Week ${8 - i}`,
        shortWeek: `W${8 - i}`,
        completionRate: rate,
        habitsCompleted: totalCompleted,
      });
    }
    return data;
  }, [habits]);

  // Daily data for last 14 days
  const dailyData = useMemo(() => {
    const data = [];
    for (let i = 13; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayName = format(subDays(new Date(), i), 'EEE');
      
      const completed = habits.filter(habit => 
        habit.completions.some(c => c.date === date)
      ).length;
      
      data.push({
        day: dayName,
        date,
        completed,
        total: habits.length,
        rate: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0,
      });
    }
    return data;
  }, [habits]);

  // Calculate habit-specific analytics
  const habitAnalytics = useMemo(() => {
    return habits.map(habit => {
      const last30Days = Array.from({ length: 30 }, (_, i) => 
        format(subDays(new Date(), i), 'yyyy-MM-dd')
      );
      
      const completedInLast30 = habit.completions.filter(c => 
        last30Days.includes(c.date)
      ).length;
      
      const consistencyScore = Math.round((completedInLast30 / 30) * 100);
      
      // Calculate trend (comparing last 15 days to previous 15 days)
      const last15 = last30Days.slice(0, 15);
      const prev15 = last30Days.slice(15, 30);
      
      const recentCount = habit.completions.filter(c => last15.includes(c.date)).length;
      const prevCount = habit.completions.filter(c => prev15.includes(c.date)).length;
      
      const trend = recentCount - prevCount;
      
      return {
        id: habit.id,
        name: habit.name,
        streak: habit.streak,
        bestStreak: habit.bestStreak,
        consistencyScore,
        trend,
        completedInLast30,
        color: habit.color,
      };
    }).sort((a, b) => b.consistencyScore - a.consistencyScore);
  }, [habits]);

  // Generate improvement suggestions
  const suggestions = useMemo(() => {
    const tips: string[] = [];
    
    const avgRate = weeklyData.length > 0 
      ? weeklyData.reduce((a, b) => a + b.completionRate, 0) / weeklyData.length 
      : 0;
    
    if (avgRate < 50) {
      tips.push("Try focusing on just 2-3 key habits to build momentum.");
    }
    
    const decliningHabits = habitAnalytics.filter(h => h.trend < -3);
    if (decliningHabits.length > 0) {
      tips.push(`"${decliningHabits[0].name}" needs attention - consider making it easier or adjusting the time.`);
    }
    
    const strongHabits = habitAnalytics.filter(h => h.consistencyScore > 80);
    if (strongHabits.length > 0) {
      tips.push(`"${strongHabits[0].name}" is solid! Consider stacking a new habit with it.`);
    }
    
    if (habits.length > 5 && avgRate < 70) {
      tips.push("You might have too many habits. Try focusing on fewer for better results.");
    }
    
    if (tips.length === 0) {
      tips.push("You're doing great! Keep up the consistency to reach your goals.");
    }
    
    return tips;
  }, [habitAnalytics, weeklyData, habits.length]);

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const currentWeekRate = weeklyData[weeklyData.length - 1]?.completionRate || 0;
    const lastWeekRate = weeklyData[weeklyData.length - 2]?.completionRate || 0;
    const weeklyTrend = currentWeekRate - lastWeekRate;
    
    const totalCompletions = habits.reduce((acc, h) => acc + h.completions.length, 0);
    const avgStreak = habits.length > 0 
      ? Math.round(habits.reduce((acc, h) => acc + h.streak, 0) / habits.length)
      : 0;
    
    return {
      currentWeekRate,
      weeklyTrend,
      totalCompletions,
      avgStreak,
      totalHabits: habits.length,
    };
  }, [weeklyData, habits]);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{overallStats.currentWeekRate}%</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs">
            {overallStats.weeklyTrend >= 0 ? (
              <TrendingUp className="h-3 w-3 text-success" />
            ) : (
              <TrendingDown className="h-3 w-3 text-destructive" />
            )}
            <span className={overallStats.weeklyTrend >= 0 ? "text-success" : "text-destructive"}>
              {overallStats.weeklyTrend >= 0 ? '+' : ''}{overallStats.weeklyTrend}%
            </span>
            <span className="text-muted-foreground">vs last week</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Calendar className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{overallStats.totalCompletions}</p>
              <p className="text-xs text-muted-foreground">Total Completions</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <Flame className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{overallStats.avgStreak}</p>
              <p className="text-xs text-muted-foreground">Avg Streak</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-xp/10">
              <Award className="h-5 w-5 text-xp" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.badges.length}</p>
              <p className="text-xs text-muted-foreground">Badges Earned</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-4">Completion Rate Over Time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="shortWeek" 
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 100]}
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area 
                type="monotone" 
                dataKey="completionRate" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorRate)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Daily Breakdown */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-4">Last 14 Days</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="day" 
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                domain={[0, 100]}
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar 
                dataKey="rate" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Habit Leaderboard */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-4">Habit Performance</h3>
        <div className="space-y-3">
          {habitAnalytics.map((habit, index) => (
            <div key={habit.id} className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground w-6">
                #{index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground truncate">{habit.name}</span>
                  <div className="flex items-center gap-2">
                    {habit.trend !== 0 && (
                      <Badge 
                        variant="secondary" 
                        className={habit.trend > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}
                      >
                        {habit.trend > 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {habit.trend > 0 ? '+' : ''}{habit.trend}
                      </Badge>
                    )}
                    <span className="text-sm font-medium">{habit.consistencyScore}%</span>
                  </div>
                </div>
                <Progress 
                  value={habit.consistencyScore} 
                  className="h-2"
                />
              </div>
            </div>
          ))}
          
          {habitAnalytics.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              Add habits to see your performance analytics!
            </p>
          )}
        </div>
      </Card>

      {/* Improvement Suggestions */}
      <Card className="p-4 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Weekly Insights</h3>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
