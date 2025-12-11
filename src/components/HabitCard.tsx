import { useState } from 'react';
import { Check, Flame, MoreVertical, Trash2, PenLine, Snowflake } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Habit, XP_VALUES } from '@/types/habit';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { HabitNoteDialog } from './HabitNoteDialog';

interface HabitCardProps {
  habit: Habit;
  onToggle: (habitId: string, date: string, note?: string, mood?: string) => void;
  onDelete: (id: string) => void;
  onNote: (habitId: string, date: string, note: string, mood?: string) => void;
  onUseFreeze: (habitId: string) => void;
}

export function HabitCard({ habit, onToggle, onDelete, onNote, onUseFreeze }: HabitCardProps) {
  const [noteOpen, setNoteOpen] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');
  const isCompletedToday = habit.completions.some(c => c.date === today);
  const todayCompletion = habit.completions.find(c => c.date === today);
  
  // Get the icon component
  const IconComponent = (Icons as any)[habit.icon] || Icons.Circle;

  const difficultyColors = {
    easy: 'bg-success/10 text-success',
    medium: 'bg-warning/10 text-warning',
    hard: 'bg-destructive/10 text-destructive',
  };

  return (
    <>
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        isCompletedToday && "ring-2 ring-success/50"
      )}>
        <div 
          className="absolute inset-0 opacity-5 transition-opacity group-hover:opacity-10"
          style={{ backgroundColor: habit.color }}
        />
        
        <div className="relative p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => onToggle(habit.id, today)}
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                  isCompletedToday 
                    ? "bg-success text-success-foreground scale-110" 
                    : "bg-muted/50 text-muted-foreground hover:bg-primary/20 hover:text-primary"
                )}
                style={!isCompletedToday ? { backgroundColor: `${habit.color}20`, color: habit.color } : {}}
              >
                {isCompletedToday ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <IconComponent className="h-6 w-6" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "font-semibold text-foreground truncate transition-all",
                  isCompletedToday && "line-through opacity-60"
                )}>
                  {habit.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="secondary" className={difficultyColors[habit.difficulty]}>
                    +{XP_VALUES[habit.difficulty]} XP
                  </Badge>
                  {habit.streak > 0 && (
                    <div className="flex items-center gap-1 text-xs font-medium text-destructive">
                      <Flame className="h-3 w-3" />
                      {habit.streak} day streak
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setNoteOpen(true)}>
                  <PenLine className="h-4 w-4 mr-2" />
                  Add Note
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUseFreeze(habit.id)}>
                  <Snowflake className="h-4 w-4 mr-2" />
                  Use Streak Freeze
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(habit.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Habit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {todayCompletion?.note && (
            <p className="mt-3 text-sm text-muted-foreground italic border-l-2 border-primary pl-3">
              "{todayCompletion.note}"
            </p>
          )}
        </div>
      </Card>

      <HabitNoteDialog
        open={noteOpen}
        onOpenChange={setNoteOpen}
        habitName={habit.name}
        existingNote={todayCompletion?.note}
        existingMood={todayCompletion?.mood}
        onSave={(note, mood) => {
          if (isCompletedToday) {
            onNote(habit.id, today, note, mood);
          } else {
            onToggle(habit.id, today, note, mood);
          }
          setNoteOpen(false);
        }}
      />
    </>
  );
}
