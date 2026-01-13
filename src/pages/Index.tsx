import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { HabitCard } from '@/components/HabitCard';
import { CreateHabitDialog } from '@/components/CreateHabitDialog';
import { HeatmapCalendar } from '@/components/HeatmapCalendar';
import { BadgesSection } from '@/components/BadgesSection';
import { SmartReminders } from '@/components/SmartReminders';
import { SocialFeatures } from '@/components/SocialFeatures';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { HabitFilters } from '@/components/HabitFilters';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useHabits } from '@/hooks/useHabits';
import { Habit } from '@/types/habit';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, CalendarDays, BarChart3 } from 'lucide-react';
import { GamificationStats } from '@/components/GamificationStats';
import { AchievementsSection } from '@/components/AchievementsSection';

export default function Index() {
  const { 
    habits, 
    stats, 
    loaded,
    addHabit, 
    deleteHabit, 
    toggleCompletion, 
    useStreakFreeze,
    addNote 
  } = useHabits();

  const [filteredHabits, setFilteredHabits] = useState<Habit[]>(habits);

  // Update filtered habits when habits change
  useEffect(() => {
    setFilteredHabits(habits);
  }, [habits]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header>
        <h1 className="text-lg sm:text-xl font-semibold">HabitBloom</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </Header>
      
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Gamification Stats - Shows XP, Level, Streak, Freezes */}
        <GamificationStats />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 mt-6">
          <div className="w-full sm:w-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Today's Habits</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              {filteredHabits.filter(h => h.completions.some(c => c.date === new Date().toISOString().split('T')[0])).length} of {habits.length} completed today
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <SmartReminders habits={habits} />
            <SocialFeatures stats={stats} />
            <CreateHabitDialog onCreateHabit={addHabit} />
          </div>
        </div>

        <Tabs defaultValue="habits" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="habits" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Habits</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="habits" className="mt-6 space-y-4">
            {/* Filters */}
            <HabitFilters 
              habits={habits} 
              onFilteredHabits={setFilteredHabits} 
            />

            {/* Habits Grid */}
            {filteredHabits.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onToggle={toggleCompletion}
                    onDelete={deleteHabit}
                    onNote={addNote}
                    onUseFreeze={useStreakFreeze}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No habits match your filters</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <Card className="p-4 sm:p-6 overflow-x-auto">
              <h3 className="font-semibold text-foreground mb-4">Activity Overview</h3>
              <HeatmapCalendar habits={habits} />
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-6 space-y-6">
            <AnalyticsDashboard habits={habits} stats={stats} />
            
            {/* New comprehensive achievements section */}
            <AchievementsSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
