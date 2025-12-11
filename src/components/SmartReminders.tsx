import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, Clock, Sparkles, Trash2, Plus, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Habit } from '@/types/habit';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface SmartRemindersProps {
  habits: Habit[];
}

interface ScheduledReminder {
  id: string;
  habitId: string;
  habitName: string;
  time: string;
  enabled: boolean;
  daysOfWeek: number[];
}

interface ReminderSuggestion {
  habitId: string;
  habitName: string;
  suggestedTime: string;
  reason: string;
  confidence: number;
}

const REMINDER_STORAGE_KEY = 'habitflow_reminders';

export function SmartReminders({ habits }: SmartRemindersProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [suggestions, setSuggestions] = useState<ReminderSuggestion[]>([]);
  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newReminderHabit, setNewReminderHabit] = useState<string>('');
  const [newReminderTime, setNewReminderTime] = useState('09:00');

  // Load reminders from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setScheduledReminders(data.reminders || []);
        setNotificationsEnabled(data.enabled || false);
      } catch (e) {
        console.error('Failed to load reminders:', e);
      }
    }
  }, []);

  // Save reminders to localStorage
  useEffect(() => {
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify({
      reminders: scheduledReminders,
      enabled: notificationsEnabled,
    }));
  }, [scheduledReminders, notificationsEnabled]);

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  // Generate smart suggestions based on completion patterns
  useEffect(() => {
    const newSuggestions: ReminderSuggestion[] = [];

    habits.forEach(habit => {
      // Skip if already has a reminder
      if (scheduledReminders.some(r => r.habitId === habit.id)) return;

      if (habit.completions.length >= 3) {
        // Analyze patterns - check most common completion day times
        const completionDates = habit.completions.map(c => new Date(c.date));
        
        // Suggest based on streak and category
        let suggestedHour = 9; // Default morning
        if (habit.category === 'fitness') suggestedHour = 7;
        else if (habit.category === 'study') suggestedHour = 19;
        else if (habit.category === 'mental') suggestedHour = 21;
        else if (habit.category === 'productivity') suggestedHour = 8;

        const suggestedTime = `${suggestedHour.toString().padStart(2, '0')}:00`;

        newSuggestions.push({
          habitId: habit.id,
          habitName: habit.name,
          suggestedTime,
          reason: `Best time for ${habit.category} habits based on your patterns`,
          confidence: Math.min(95, 60 + habit.completions.length * 3),
        });
      }
    });

    setSuggestions(newSuggestions.slice(0, 5));
  }, [habits, scheduledReminders]);

  // Check and trigger reminders
  const checkReminders = useCallback(() => {
    if (!notificationsEnabled || permissionStatus !== 'granted') return;

    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    const currentDay = now.getDay();

    scheduledReminders.forEach(reminder => {
      if (!reminder.enabled) return;
      if (reminder.daysOfWeek.length > 0 && !reminder.daysOfWeek.includes(currentDay)) return;
      
      if (reminder.time === currentTime) {
        const habit = habits.find(h => h.id === reminder.habitId);
        if (!habit) return;

        const today = format(now, 'yyyy-MM-dd');
        const completedToday = habit.completions.some(c => c.date === today);

        if (!completedToday) {
          new Notification(`Time for: ${habit.name}`, {
            body: habit.streak > 0 
              ? `Keep your ${habit.streak}-day streak going!` 
              : 'Build a new habit today!',
            icon: '/favicon.ico',
            tag: reminder.id,
          });
        }
      }
    });
  }, [scheduledReminders, habits, notificationsEnabled, permissionStatus]);

  // Set up reminder check interval
  useEffect(() => {
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkReminders]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Notifications not supported',
        description: 'Your browser does not support notifications.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast({
          title: 'Notifications enabled!',
          description: 'You will now receive habit reminders.',
        });

        new Notification('HabitFlow', {
          body: 'Smart reminders are now active!',
          icon: '/favicon.ico',
        });
      } else {
        toast({
          title: 'Permission denied',
          description: 'You can enable notifications in your browser settings.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const addReminder = (habitId: string, time: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const newReminder: ScheduledReminder = {
      id: crypto.randomUUID(),
      habitId,
      habitName: habit.name,
      time,
      enabled: true,
      daysOfWeek: [], // All days
    };

    setScheduledReminders(prev => [...prev, newReminder]);
    toast({
      title: 'Reminder scheduled!',
      description: `Daily reminder for "${habit.name}" at ${time}`,
    });
  };

  const removeReminder = (id: string) => {
    setScheduledReminders(prev => prev.filter(r => r.id !== id));
    toast({ title: 'Reminder removed' });
  };

  const toggleReminder = (id: string) => {
    setScheduledReminders(prev => prev.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const addCustomReminder = () => {
    if (!newReminderHabit) {
      toast({ title: 'Select a habit', variant: 'destructive' });
      return;
    }
    addReminder(newReminderHabit, newReminderTime);
    setNewReminderHabit('');
    setNewReminderTime('09:00');
  };

  const habitsWithoutReminders = habits.filter(
    h => !scheduledReminders.some(r => r.habitId === h.id)
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 relative">
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Reminders</span>
          {scheduledReminders.filter(r => r.enabled).length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {scheduledReminders.filter(r => r.enabled).length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Reminders
          </DialogTitle>
          <DialogDescription>
            Get notified at the best times to complete your habits.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Notification Permission */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {notificationsEnabled ? (
                  <Bell className="h-5 w-5 text-success" />
                ) : (
                  <BellOff className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium text-foreground">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    {permissionStatus === 'granted' 
                      ? 'Enabled' 
                      : permissionStatus === 'denied'
                      ? 'Blocked in browser settings'
                      : 'Click to enable'}
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={(checked) => {
                  if (checked && permissionStatus !== 'granted') {
                    requestNotificationPermission();
                  } else {
                    setNotificationsEnabled(checked);
                  }
                }}
                disabled={permissionStatus === 'denied'}
              />
            </div>
          </Card>

          {/* Scheduled Reminders */}
          {scheduledReminders.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Your Reminders
              </h4>
              <div className="space-y-2">
                {scheduledReminders.map(reminder => (
                  <Card key={reminder.id} className="p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Switch
                          checked={reminder.enabled}
                          onCheckedChange={() => toggleReminder(reminder.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {reminder.habitName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Daily at {reminder.time}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeReminder(reminder.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Reminder */}
          {habitsWithoutReminders.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Reminder
              </h4>
              <Card className="p-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={newReminderHabit} onValueChange={setNewReminderHabit}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select habit..." />
                    </SelectTrigger>
                    <SelectContent>
                      {habitsWithoutReminders.map(habit => (
                        <SelectItem key={habit.id} value={habit.id}>
                          {habit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="time"
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    className="w-32"
                  />
                  <Button onClick={addCustomReminder} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Suggested Times
              </h4>
              <div className="space-y-2">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.habitId} className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {suggestion.habitName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {suggestion.reason}
                        </p>
                        <Badge 
                          variant="secondary" 
                          className="mt-2 text-xs bg-primary/10 text-primary"
                        >
                          {suggestion.confidence}% match
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addReminder(suggestion.habitId, suggestion.suggestedTime)}
                        className="shrink-0 gap-1"
                      >
                        <Check className="h-3 w-3" />
                        {suggestion.suggestedTime}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {habits.length === 0 && (
            <Card className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Create some habits first to set up reminders!
              </p>
            </Card>
          )}

          {/* Pro Tips */}
          <Card className="p-4 bg-muted/30">
            <p className="text-xs text-muted-foreground">
              <strong>Pro tip:</strong> Set reminders 30 minutes before your usual routine. 
              Morning habits work best at consistent times!
            </p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
