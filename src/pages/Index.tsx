import { Header } from '@/components/Header';
import { HabitCard } from '@/components/HabitCard';
import { CreateHabitDialog } from '@/components/CreateHabitDialog';
import { HeatmapCalendar } from '@/components/HeatmapCalendar';
import { StatsOverview } from '@/components/StatsOverview';
import { BadgesSection } from '@/components/BadgesSection';
import { EmptyState } from '@/components/EmptyState';
import { SmartReminders } from '@/components/SmartReminders';
import { SocialFeatures } from '@/components/SocialFeatures';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { useHabits } from '@/hooks/useHabits';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, CalendarDays, BarChart3 } from 'lucide-react';

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

  if (!loaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header stats={stats} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {habits.length === 0 ? (
          <EmptyState onCreateHabit={addHabit} />
        ) : (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Today's Habits</h2>
                <p className="text-muted-foreground">Keep up the momentum!</p>
              </div>
              <div className="flex items-center gap-2">
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

              <TabsContent value="habits" className="mt-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {habits.map((habit) => (
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
              </TabsContent>

              <TabsContent value="calendar" className="mt-6">
                <Card className="p-4 sm:p-6">
                  <h3 className="font-semibold text-foreground mb-4">Activity Overview</h3>
                  <HeatmapCalendar habits={habits} />
                </Card>
              </TabsContent>

              <TabsContent value="stats" className="mt-6 space-y-6">
                <AnalyticsDashboard habits={habits} stats={stats} />
                <BadgesSection earnedBadges={stats.badges} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
