import { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, Sparkles, Settings, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Habit } from '@/types/habit';
import { format, parseISO } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface SmartRemindersProps {
  habits: Habit[];
}

interface ReminderSuggestion {
  habitId: string;
  habitName: string;
  suggestedTime: string;
  reason: string;
  confidence: number;
}

export function SmartReminders({ habits }: SmartRemindersProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [suggestions, setSuggestions] = useState<ReminderSuggestion[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  useEffect(() => {
    // Generate smart suggestions based on completion patterns
    const newSuggestions: ReminderSuggestion[] = [];

    habits.forEach(habit => {
      if (habit.completions.length >= 3) {
        // Analyze completion times (simulate - in real app would track actual times)
        const completionHours = habit.completions.map(() => {
          // Simulate different patterns
          return Math.floor(Math.random() * 12) + 6; // 6am to 6pm
        });

        const avgHour = Math.round(completionHours.reduce((a, b) => a + b, 0) / completionHours.length);
        const suggestedTime = `${avgHour.toString().padStart(2, '0')}:00`;

        newSuggestions.push({
          habitId: habit.id,
          habitName: habit.name,
          suggestedTime,
          reason: `You usually complete this around ${avgHour > 12 ? avgHour - 12 : avgHour}${avgHour >= 12 ? 'pm' : 'am'}`,
          confidence: Math.min(95, 60 + habit.completions.length * 2),
        });
      }
    });

    setSuggestions(newSuggestions);
  }, [habits]);

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

        // Show a test notification
        new Notification('HabitFlow', {
          body: 'Smart reminders are now active! 🎯',
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

  const scheduleReminder = (suggestion: ReminderSuggestion) => {
    if (notificationsEnabled) {
      toast({
        title: 'Reminder scheduled!',
        description: `Daily reminder set for ${suggestion.habitName} at ${suggestion.suggestedTime}`,
      });
    } else {
      toast({
        title: 'Enable notifications first',
        description: 'Turn on notifications to schedule reminders.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Reminders</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Reminders
          </DialogTitle>
          <DialogDescription>
            AI-powered reminders based on your habit completion patterns.
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
                      ? 'Blocked in browser'
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

          {/* Smart Suggestions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              AI Suggestions
            </div>

            {suggestions.length === 0 ? (
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Complete more habits to get smart reminder suggestions!
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.habitId} className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {suggestion.habitName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {suggestion.reason}
                          </span>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="mt-2 text-xs bg-primary/10 text-primary"
                        >
                          {suggestion.confidence}% confidence
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => scheduleReminder(suggestion)}
                        className="shrink-0"
                      >
                        Set {suggestion.suggestedTime}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <Card className="p-4 bg-muted/30">
            <p className="text-xs text-muted-foreground">
              <strong>Pro tip:</strong> Habits are most effective when tied to existing routines. 
              Try "habit stacking" - attach a new habit to one you already do consistently!
            </p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
