import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  CalendarDays, 
  BarChart3, 
  Settings, 
  Sun, 
  Moon,
  Gamepad2,
  LayoutDashboard,
  Plus,
  CheckSquare
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import './ProfessionalSidebar.css';

interface ProfessionalSidebarProps {
  onAddHabit?: () => void;
}

export function ProfessionalSidebar({ onAddHabit }: ProfessionalSidebarProps) {
  const { theme, toggleTheme, toggleUIMode } = useTheme();

  const navItems = [
    { to: '/', icon: CheckSquare, label: 'Today' },
    { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="pro-sidebar">
      <div className="pro-sidebar__brand">
        <LayoutDashboard size={24} />
        <span className="pro-sidebar__brand-text">Habit Bloom</span>
      </div>

      <button className="pro-sidebar__add-btn" onClick={onAddHabit}>
        <Plus size={18} />
        <span>New Habit</span>
      </button>

      <nav className="pro-sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn('pro-sidebar__nav-item', isActive && 'pro-sidebar__nav-item--active')
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pro-sidebar__footer">
        <button
          className="pro-sidebar__footer-btn"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
        
        <button
          className="pro-sidebar__footer-btn pro-sidebar__footer-btn--mode"
          onClick={toggleUIMode}
          aria-label="Switch to game mode"
        >
          <Gamepad2 size={18} />
          <span>Game Mode</span>
        </button>
      </div>
    </aside>
  );
}
