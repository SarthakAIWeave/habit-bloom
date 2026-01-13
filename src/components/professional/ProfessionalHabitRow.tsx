import React from 'react';
import { Check, Circle, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfessionalHabitRowProps {
  id: string;
  name: string;
  description?: string;
  isCompleted: boolean;
  isMissed?: boolean;
  streak: number;
  completionRate: number;
  color?: string;
  compact?: boolean;
  onToggle: (id: string) => void;
  onClick?: (id: string) => void;
}

export function ProfessionalHabitRow({
  id,
  name,
  description,
  isCompleted,
  isMissed = false,
  streak,
  completionRate,
  color = 'var(--pro-accent-primary)',
  compact = false,
  onToggle,
  onClick,
}: ProfessionalHabitRowProps) {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(id);
  };

  const getStatusIcon = () => {
    if (isCompleted) {
      return (
        <div
          className="pro-checkbox pro-checkbox--completed"
          style={{ '--checkbox-color': color } as React.CSSProperties}
        >
          <Check className="pro-checkbox__icon" />
        </div>
      );
    }
    if (isMissed) {
      return (
        <div className="pro-checkbox pro-checkbox--missed">
          <Minus className="pro-checkbox__icon" />
        </div>
      );
    }
    return (
      <div
        className="pro-checkbox pro-checkbox--pending"
        style={{ '--checkbox-color': color } as React.CSSProperties}
      >
        <Circle className="pro-checkbox__icon" />
      </div>
    );
  };

  return (
    <div
      className={cn(
        'pro-habit-row',
        isCompleted && 'pro-habit-row--completed',
        isMissed && 'pro-habit-row--missed',
        compact && 'pro-habit-row--compact'
      )}
      onClick={() => onClick?.(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(id)}
    >
      <button
        className="pro-habit-row__checkbox-btn"
        onClick={handleCheckboxClick}
        aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {getStatusIcon()}
      </button>

      <div className="pro-habit-row__content">
        <span className={cn('pro-habit-row__name', isCompleted && 'pro-habit-row__name--completed')}>
          {name}
        </span>
        {!compact && description && (
          <span className="pro-habit-row__description">{description}</span>
        )}
      </div>

      <div className="pro-habit-row__stats">
        {streak > 0 && (
          <span className="pro-habit-row__stat" title={`${streak} day streak`}>
            {streak}d
          </span>
        )}
        <span
          className="pro-habit-row__stat pro-habit-row__stat--rate"
          title={`${completionRate}% completion rate`}
        >
          {completionRate}%
        </span>
      </div>
    </div>
  );
}
