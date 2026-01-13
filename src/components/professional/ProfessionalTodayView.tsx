import React, { useState } from 'react';
import { format } from 'date-fns';
import { LayoutGrid, List, Plus } from 'lucide-react';
import { ProfessionalHabitRow } from './ProfessionalHabitRow';
import { useHabits } from '@/hooks/useHabits';
import { cn } from '@/lib/utils';
import './ProfessionalTodayView.css';

interface ProfessionalTodayViewProps {
  onAddHabit?: () => void;
  onHabitClick?: (id: string) => void;
}

export function ProfessionalTodayView({ onAddHabit, onHabitClick }: ProfessionalTodayViewProps) {
  const [viewMode, setViewMode] = useState<'default' | 'compact'>('default');
  const { habits, toggleHabitCompletion, getTodayProgress } = useHabits();
  
  const today = new Date();
  const progress = getTodayProgress();
  
  const completedCount = habits.filter(h => h.completedToday).length;
  const totalCount = habits.length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="pro-today">
      <header className="pro-today__header">
        <div className="pro-today__date-section">
          <h1 className="pro-today__title">Today</h1>
          <span className="pro-today__date">{format(today, 'EEEE, MMMM d')}</span>
        </div>
        
        <div className="pro-today__actions">
          <div className="pro-today__view-toggle">
            <button
              className={cn('pro-today__view-btn', viewMode === 'default' && 'pro-today__view-btn--active')}
              onClick={() => setViewMode('default')}
              aria-label="Default view"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              className={cn('pro-today__view-btn', viewMode === 'compact' && 'pro-today__view-btn--active')}
              onClick={() => setViewMode('compact')}
              aria-label="Compact view"
            >
              <List size={18} />
            </button>
          </div>
          
          <button className="pro-today__add-btn" onClick={onAddHabit}>
            <Plus size={18} />
            <span>Add Habit</span>
          </button>
        </div>
      </header>

      <div className="pro-today__summary">
        <div className="pro-today__summary-stat">
          <span className="pro-today__summary-value">{completedCount}/{totalCount}</span>
          <span className="pro-today__summary-label">Completed</span>
        </div>
        <div className="pro-today__summary-stat">
          <span className="pro-today__summary-value">{completionPercent}%</span>
          <span className="pro-today__summary-label">Progress</span>
        </div>
        <div className="pro-today__progress-bar">
          <div 
            className="pro-today__progress-fill"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="pro-today__empty">
          <p className="pro-today__empty-text">No habits configured yet.</p>
          <button className="pro-today__empty-btn" onClick={onAddHabit}>
            Create your first habit
          </button>
        </div>
      ) : (
        <div className={cn('pro-today__list', viewMode === 'compact' && 'pro-today__list--compact')}>
          {habits.map((habit) => (
            <ProfessionalHabitRow
              key={habit.id}
              id={habit.id}
              name={habit.name}
              description={habit.description}
              isCompleted={habit.completedToday}
              streak={habit.currentStreak}
              completionRate={habit.completionRate}
              color={habit.color}
              compact={viewMode === 'compact'}
              onToggle={toggleHabitCompletion}
              onClick={onHabitClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
