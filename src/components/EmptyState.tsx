import { Sparkles } from 'lucide-react';
import { CreateHabitDialog } from './CreateHabitDialog';
import { Habit } from '@/types/habit';

interface EmptyStateProps {
  onCreateHabit: (habit: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completions' | 'createdAt' | 'streakFreezes'>) => void;
}

export function EmptyState({ onCreateHabit }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Start Your Journey</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Create your first habit and begin building a better version of yourself. 
        Small steps lead to big changes.
      </p>
      <CreateHabitDialog onCreateHabit={onCreateHabit} />
    </div>
  );
}
