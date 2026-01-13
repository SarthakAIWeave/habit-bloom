import React from 'react';
import { NavLink } from 'react-router-dom';
import { CheckSquare, CalendarDays, BarChart3, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import './ProfessionalMobileNav.css';

interface ProfessionalMobileNavProps {
  onAddHabit?: () => void;
}

export function ProfessionalMobileNav({ onAddHabit }: ProfessionalMobileNavProps) {
  const navItems = [
    { to: '/', icon: CheckSquare, label: 'Today' },
    { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="pro-mobile-nav">
      {navItems.slice(0, 2).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn('pro-mobile-nav__item', isActive && 'pro-mobile-nav__item--active')
          }
        >
          <item.icon size={22} />
          <span>{item.label}</span>
        </NavLink>
      ))}

      <button className="pro-mobile-nav__add-btn" onClick={onAddHabit}>
        <Plus size={24} />
      </button>

      {navItems.slice(2).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn('pro-mobile-nav__item', isActive && 'pro-mobile-nav__item--active')
          }
        >
          <item.icon size={22} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
