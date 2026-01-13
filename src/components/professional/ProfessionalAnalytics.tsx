import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, Target, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import './ProfessionalAnalytics.css';

interface AnalyticsData {
  completionRate: number;
  completionTrend: 'up' | 'down' | 'stable';
  trendValue: number;
  totalCompleted: number;
  totalMissed: number;
  currentStreak: number;
  longestStreak: number;
  consistencyScore: number;
  weeklyData: { day: string; rate: number }[];
  monthlyData: { week: string; rate: number }[];
}

interface ProfessionalAnalyticsProps {
  data: AnalyticsData;
}

export function ProfessionalAnalytics({ data }: ProfessionalAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const getTrendIcon = () => {
    switch (data.completionTrend) {
      case 'up': return <TrendingUp size={16} className="pro-analytics__trend-icon--up" />;
      case 'down': return <TrendingDown size={16} className="pro-analytics__trend-icon--down" />;
      default: return <Minus size={16} className="pro-analytics__trend-icon--stable" />;
    }
  };

  const getConsistencyLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs attention';
  };

  return (
    <div className="pro-analytics">
      <header className="pro-analytics__header">
        <div>
          <h1 className="pro-analytics__title">Analytics</h1>
          <p className="pro-analytics__subtitle">Track your habit consistency over time</p>
        </div>
        
        <div className="pro-analytics__time-toggle">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              className={cn(
                'pro-analytics__time-btn',
                timeRange === range && 'pro-analytics__time-btn--active'
              )}
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </header>

      <div className="pro-analytics__grid">
        {/* Primary Stat Card */}
        <div className="pro-analytics__card pro-analytics__card--primary">
          <div className="pro-analytics__card-header">
            <Target size={20} />
            <span>Completion Rate</span>
          </div>
          <div className="pro-analytics__primary-stat">
            <span className="pro-analytics__primary-value">{data.completionRate}%</span>
            <span className={cn(
              'pro-analytics__trend',
              data.completionTrend === 'up' && 'pro-analytics__trend--up',
              data.completionTrend === 'down' && 'pro-analytics__trend--down'
            )}>
              {getTrendIcon()}
              {data.trendValue}% vs previous
            </span>
          </div>
          <div className="pro-analytics__bar-container">
            <div 
              className="pro-analytics__bar"
              style={{ width: `${data.completionRate}%` }}
            />
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="pro-analytics__card">
          <div className="pro-analytics__card-header">
            <Calendar size={20} />
            <span>Streak</span>
          </div>
          <div className="pro-analytics__stat-row">
            <div className="pro-analytics__stat">
              <span className="pro-analytics__stat-value">{data.currentStreak}</span>
              <span className="pro-analytics__stat-label">Current</span>
            </div>
            <div className="pro-analytics__stat">
              <span className="pro-analytics__stat-value">{data.longestStreak}</span>
              <span className="pro-analytics__stat-label">Best</span>
            </div>
          </div>
        </div>

        <div className="pro-analytics__card">
          <div className="pro-analytics__card-header">
            <AlertCircle size={20} />
            <span>Consistency</span>
          </div>
          <div className="pro-analytics__consistency">
            <span className="pro-analytics__consistency-score">{data.consistencyScore}%</span>
            <span className="pro-analytics__consistency-label">
              {getConsistencyLabel(data.consistencyScore)}
            </span>
          </div>
        </div>

        {/* Totals */}
        <div className="pro-analytics__card pro-analytics__card--wide">
          <div className="pro-analytics__totals">
            <div className="pro-analytics__total">
              <span className="pro-analytics__total-value pro-analytics__total-value--success">
                {data.totalCompleted}
              </span>
              <span className="pro-analytics__total-label">Days completed</span>
            </div>
            <div className="pro-analytics__total-divider" />
            <div className="pro-analytics__total">
              <span className="pro-analytics__total-value pro-analytics__total-value--error">
                {data.totalMissed}
              </span>
              <span className="pro-analytics__total-label">Days missed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="pro-analytics__chart-section">
        <h2 className="pro-analytics__section-title">Weekly Overview</h2>
        <div className="pro-analytics__chart">
          {data.weeklyData.map((item, index) => (
            <div key={index} className="pro-analytics__chart-bar-wrapper">
              <div className="pro-analytics__chart-bar-container">
                <div
                  className="pro-analytics__chart-bar"
                  style={{ height: `${item.rate}%` }}
                />
              </div>
              <span className="pro-analytics__chart-label">{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State Guidance */}
      {data.totalCompleted === 0 && (
        <div className="pro-analytics__empty-guidance">
          <p>Complete your first habits to start building your analytics.</p>
          <p className="pro-analytics__empty-hint">
            Analytics will show meaningful data after a few days of tracking.
          </p>
        </div>
      )}
    </div>
  );
}
