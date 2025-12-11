import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, SortAsc, SortDesc, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Habit, HabitCategory } from '@/types/habit';

export type SortOption = 'name' | 'created' | 'lastDone' | 'streak' | 'difficulty';
export type SortDirection = 'asc' | 'desc';

interface HabitFiltersProps {
  habits: Habit[];
  onFilteredHabits: (habits: Habit[]) => void;
}

const CATEGORY_LABELS: Record<HabitCategory, string> = {
  fitness: 'Fitness',
  study: 'Study',
  wealth: 'Wealth',
  mental: 'Mental Health',
  productivity: 'Productivity',
  custom: 'Custom',
};

export function HabitFilters({ habits, onFilteredHabits }: HabitFiltersProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<HabitCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [completedFilter, setCompletedFilter] = useState<'all' | 'completed' | 'incomplete'>('all');

  // Apply filters whenever any filter changes
  useEffect(() => {
    let filtered = [...habits];

    // Search filter
    if (search) {
      filtered = filtered.filter(h => 
        h.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(h => h.category === categoryFilter);
    }

    // Completed today filter
    const today = new Date().toISOString().split('T')[0];
    if (completedFilter === 'completed') {
      filtered = filtered.filter(h => h.completions.some(c => c.date === today));
    } else if (completedFilter === 'incomplete') {
      filtered = filtered.filter(h => !h.completions.some(c => c.date === today));
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'lastDone':
          const aLast = a.completions.length > 0 
            ? Math.max(...a.completions.map(c => new Date(c.date).getTime()))
            : 0;
          const bLast = b.completions.length > 0 
            ? Math.max(...b.completions.map(c => new Date(c.date).getTime()))
            : 0;
          comparison = aLast - bLast;
          break;
        case 'streak':
          comparison = a.streak - b.streak;
          break;
        case 'difficulty':
          const diffOrder = { easy: 1, medium: 2, hard: 3 };
          comparison = diffOrder[a.difficulty] - diffOrder[b.difficulty];
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    onFilteredHabits(filtered);
  }, [habits, search, categoryFilter, completedFilter, sortBy, sortDirection, onFilteredHabits]);

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setSortBy('created');
    setSortDirection('desc');
    setCompletedFilter('all');
  };

  const hasActiveFilters = search || categoryFilter !== 'all' || completedFilter !== 'all' || sortBy !== 'created';

  // Get unique categories from habits
  const categories = [...new Set(habits.map(h => h.category))];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search habits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Filter className="h-4 w-4" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as HabitCategory | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status Today</label>
                <Select value={completedFilter} onValueChange={(v) => setCompletedFilter(v as 'all' | 'completed' | 'incomplete')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All habits</SelectItem>
                    <SelectItem value="completed">Completed today</SelectItem>
                    <SelectItem value="incomplete">Not completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sort by</label>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created">Date Created</SelectItem>
                      <SelectItem value="lastDone">Last Completed</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="streak">Streak</SelectItem>
                      <SelectItem value="difficulty">Difficulty</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortDirection === 'asc' ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear all filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {categoryFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {CATEGORY_LABELS[categoryFilter]}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setCategoryFilter('all')}
              />
            </Badge>
          )}
          {completedFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {completedFilter === 'completed' ? 'Done today' : 'Pending'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setCompletedFilter('all')}
              />
            </Badge>
          )}
          {sortBy !== 'created' && (
            <Badge variant="secondary" className="gap-1">
              Sort: {sortBy}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
