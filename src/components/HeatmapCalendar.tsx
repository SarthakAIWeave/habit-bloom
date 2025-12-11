import { useMemo, useState } from 'react';
import { format, subDays, startOfWeek, addDays, isSameDay, subMonths, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { Habit } from '@/types/habit';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HeatmapCalendarProps {
  habits: Habit[];
}

type ViewMode = 'heatmap' | 'calendar';

export function HeatmapCalendar({ habits }: HeatmapCalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('heatmap');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [weeksToShow, setWeeksToShow] = useState(20);

  // Generate weeks for heatmap view
  const weeks = useMemo(() => {
    const today = new Date();
    const result: Date[][] = [];
    
    let startDate = startOfWeek(subDays(today, weeksToShow * 7), { weekStartsOn: 0 });
    
    for (let w = 0; w < weeksToShow; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(addDays(startDate, w * 7 + d));
      }
      result.push(week);
    }
    
    return result;
  }, [weeksToShow]);

  // Generate calendar month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Add padding for days before month starts
    const startPadding = getDay(monthStart);
    const paddedDays: (Date | null)[] = Array(startPadding).fill(null);
    
    return [...paddedDays, ...days];
  }, [selectedMonth]);

  const getCompletionData = (date: Date) => {
    if (date > new Date()) return { level: -1, completed: 0, total: habits.length, completions: [] };
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const completions: { habit: Habit; completion: typeof habits[0]['completions'][0] }[] = [];
    
    habits.forEach(habit => {
      const completion = habit.completions.find(c => c.date === dateStr);
      if (completion) {
        completions.push({ habit, completion });
      }
    });
    
    const completed = completions.length;
    const total = habits.length;
    
    if (total === 0) return { level: 0, completed, total, completions };
    const ratio = completed / total;
    
    let level = 0;
    if (ratio > 0 && ratio <= 0.25) level = 1;
    else if (ratio > 0.25 && ratio <= 0.5) level = 2;
    else if (ratio > 0.5 && ratio <= 0.75) level = 3;
    else if (ratio > 0.75) level = 4;
    
    return { level, completed, total, completions };
  };

  const levelColors: Record<number, string> = {
    [-1]: 'bg-transparent',
    0: 'bg-heatmap-0',
    1: 'bg-heatmap-1',
    2: 'bg-heatmap-2',
    3: 'bg-heatmap-3',
    4: 'bg-heatmap-4',
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get month labels for heatmap
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = '';
    
    weeks.forEach((week, weekIndex) => {
      const firstDayMonth = format(week[0], 'MMM');
      if (firstDayMonth !== lastMonth) {
        labels.push({ month: firstDayMonth, weekIndex });
        lastMonth = firstDayMonth;
      }
    });
    
    return labels;
  }, [weeks]);

  return (
    <div className="space-y-4">
      {/* View Toggle and Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'heatmap' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('heatmap')}
          >
            Heatmap
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Calendar
          </Button>
        </div>

        {viewMode === 'heatmap' ? (
          <Select value={weeksToShow.toString()} onValueChange={(v) => setWeeksToShow(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">3 months</SelectItem>
              <SelectItem value="20">5 months</SelectItem>
              <SelectItem value="26">6 months</SelectItem>
              <SelectItem value="52">1 year</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[120px] text-center">
              {format(selectedMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
              disabled={selectedMonth >= new Date()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {viewMode === 'heatmap' ? (
        /* Heatmap View */
        <div className="overflow-x-auto pb-2">
          <div className="min-w-max">
            {/* Month labels */}
            <div className="flex gap-1 mb-1 ml-10">
              {monthLabels.map(({ month, weekIndex }) => (
                <span 
                  key={`${month}-${weekIndex}`} 
                  className="text-xs text-muted-foreground"
                  style={{ marginLeft: weekIndex === 0 ? 0 : `${(weekIndex - (monthLabels.find(l => l.weekIndex < weekIndex)?.weekIndex || 0)) * 18}px` }}
                >
                  {month}
                </span>
              ))}
            </div>

            <div className="flex gap-1">
              <div className="flex flex-col gap-1 mr-2 text-xs text-muted-foreground">
                {dayLabels.map((day, i) => (
                  <div key={i} className="h-4 flex items-center justify-end pr-1" style={{ height: '14px' }}>
                    {i % 2 === 1 ? day : ''}
                  </div>
                ))}
              </div>
              
              <TooltipProvider delayDuration={100}>
                <div className="flex gap-1">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((date, dayIndex) => {
                        const data = getCompletionData(date);
                        const isToday = isSameDay(date, new Date());
                        const dateStr = format(date, 'MMM d, yyyy');
                        
                        return (
                          <Tooltip key={dayIndex}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "w-3.5 h-3.5 rounded-sm transition-all",
                                  levelColors[data.level],
                                  isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                                  data.level >= 0 && "hover:scale-125 cursor-pointer"
                                )}
                              />
                            </TooltipTrigger>
                            {data.level >= 0 && (
                              <TooltipContent className="max-w-xs">
                                <p className="font-medium">{dateStr}</p>
                                <p className="text-xs text-muted-foreground">
                                  {data.completed}/{data.total} habits completed
                                </p>
                                {data.completions.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {data.completions.slice(0, 3).map(({ habit }) => (
                                      <div key={habit.id} className="text-xs flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color }} />
                                        {habit.name}
                                      </div>
                                    ))}
                                    {data.completions.length > 3 && (
                                      <p className="text-xs text-muted-foreground">
                                        +{data.completions.length - 3} more
                                      </p>
                                    )}
                                  </div>
                                )}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </TooltipProvider>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className={cn("w-3.5 h-3.5 rounded-sm", levelColors[level])}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      ) : (
        /* Calendar View */
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {dayLabels.map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          <TooltipProvider delayDuration={100}>
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }
              
              const data = getCompletionData(date);
              const isToday = isSameDay(date, new Date());
              const isFuture = date > new Date();
              
              return (
                <Tooltip key={date.toISOString()}>
                  <TooltipTrigger asChild>
                    <Card 
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center p-1 transition-all cursor-pointer hover:shadow-md",
                        isToday && "ring-2 ring-primary",
                        isFuture && "opacity-30",
                        data.level > 0 && "bg-success/10"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium",
                        isToday && "text-primary"
                      )}>
                        {format(date, 'd')}
                      </span>
                      {!isFuture && habits.length > 0 && (
                        <span className={cn(
                          "text-xs",
                          data.completed === data.total ? "text-success font-medium" : "text-muted-foreground"
                        )}>
                          {data.completed}/{data.total}
                        </span>
                      )}
                    </Card>
                  </TooltipTrigger>
                  {!isFuture && (
                    <TooltipContent>
                      <p className="font-medium">{format(date, 'EEEE, MMM d')}</p>
                      <p className="text-xs text-muted-foreground">
                        {data.completed}/{data.total} habits completed
                      </p>
                      {data.completions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {data.completions.map(({ habit, completion }) => (
                            <div key={habit.id} className="text-xs flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-success" />
                              {habit.name}
                              {completion.mood && (
                                <span className="text-muted-foreground">({completion.mood})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      )}

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-foreground">
            {habits.reduce((acc, h) => acc + h.completions.length, 0)}
          </p>
          <p className="text-xs text-muted-foreground">Total Completions</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-foreground">
            {Math.max(...habits.map(h => h.bestStreak), 0)}
          </p>
          <p className="text-xs text-muted-foreground">Best Streak</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-foreground">
            {habits.length > 0 
              ? Math.round((habits.reduce((acc, h) => acc + h.completions.length, 0) / (habits.length * 30)) * 100)
              : 0}%
          </p>
          <p className="text-xs text-muted-foreground">30-Day Rate</p>
        </Card>
      </div>
    </div>
  );
}
