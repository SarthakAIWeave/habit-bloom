import { useMemo } from 'react';
import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Habit } from '@/types/habit';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HeatmapCalendarProps {
  habits: Habit[];
}

export function HeatmapCalendar({ habits }: HeatmapCalendarProps) {
  const weeks = useMemo(() => {
    const today = new Date();
    const numWeeks = 15;
    const result: Date[][] = [];
    
    // Start from the beginning of the week, numWeeks ago
    let startDate = startOfWeek(subDays(today, numWeeks * 7), { weekStartsOn: 0 });
    
    for (let w = 0; w < numWeeks; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(addDays(startDate, w * 7 + d));
      }
      result.push(week);
    }
    
    return result;
  }, []);

  const getCompletionLevel = (date: Date): number => {
    if (date > new Date()) return -1; // Future date
    
    const dateStr = format(date, 'yyyy-MM-dd');
    let completed = 0;
    
    habits.forEach(habit => {
      if (habit.completions.some(c => c.date === dateStr)) {
        completed++;
      }
    });
    
    if (habits.length === 0) return 0;
    const ratio = completed / habits.length;
    
    if (ratio === 0) return 0;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
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

  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-max">
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
                    const level = getCompletionLevel(date);
                    const isToday = isSameDay(date, new Date());
                    const dateStr = format(date, 'MMM d, yyyy');
                    const completed = habits.filter(h => 
                      h.completions.some(c => c.date === format(date, 'yyyy-MM-dd'))
                    ).length;
                    
                    return (
                      <Tooltip key={dayIndex}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "w-3.5 h-3.5 rounded-sm transition-all",
                              levelColors[level],
                              isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                              level >= 0 && "hover:scale-125 cursor-pointer"
                            )}
                          />
                        </TooltipTrigger>
                        {level >= 0 && (
                          <TooltipContent>
                            <p className="font-medium">{dateStr}</p>
                            <p className="text-xs text-muted-foreground">
                              {completed}/{habits.length} habits completed
                            </p>
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
  );
}
