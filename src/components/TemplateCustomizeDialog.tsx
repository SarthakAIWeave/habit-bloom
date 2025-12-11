import { useState } from 'react';
import * as Icons from 'lucide-react';
import { Clock, Bell, Calendar, Target, Repeat } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Habit, HabitCategory, HabitDifficulty } from '@/types/habit';
import { cn } from '@/lib/utils';

interface TemplateCustomizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completions' | 'createdAt' | 'streakFreezes'> | null;
  onSave: (habit: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completions' | 'createdAt' | 'streakFreezes'> & {
    reminderTime?: string;
    reminderDays?: string[];
    targetDays?: number;
    description?: string;
    dailyGoal?: number;
    unit?: string;
  }) => void;
}

const DIFFICULTIES: { value: HabitDifficulty; label: string; xp: number }[] = [
  { value: 'easy', label: 'Easy', xp: 10 },
  { value: 'medium', label: 'Medium', xp: 25 },
  { value: 'hard', label: 'Hard', xp: 50 },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--xp))',
  'hsl(var(--chart-4))',
  'hsl(var(--destructive))',
];

const ICONS = ['Dumbbell', 'BookOpen', 'Brain', 'Heart', 'Star', 'Flame', 'Target', 'Trophy', 'Droplets', 'Moon', 'Sun', 'Coffee', 'Music', 'Camera', 'Palette', 'Code', 'Wallet', 'PiggyBank', 'GraduationCap', 'PenLine', 'Smartphone', 'Leaf'];

export function TemplateCustomizeDialog({ 
  open, 
  onOpenChange, 
  template, 
  onSave 
}: TemplateCustomizeDialogProps) {
  const [name, setName] = useState(template?.name || '');
  const [icon, setIcon] = useState(template?.icon || 'Star');
  const [difficulty, setDifficulty] = useState<HabitDifficulty>(template?.difficulty || 'medium');
  const [color, setColor] = useState(template?.color || COLORS[0]);
  const [description, setDescription] = useState('');
  
  // Reminder settings
  const [enableReminder, setEnableReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(DAYS);
  
  // Goal settings
  const [targetDays, setTargetDays] = useState(30);
  const [dailyGoal, setDailyGoal] = useState(1);
  const [unit, setUnit] = useState('times');

  // Reset form when template changes
  useState(() => {
    if (template) {
      setName(template.name);
      setIcon(template.icon);
      setDifficulty(template.difficulty);
      setColor(template.color);
    }
  });

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      icon,
      category: template?.category || 'custom',
      difficulty,
      color,
      description,
      reminderTime: enableReminder ? reminderTime : undefined,
      reminderDays: enableReminder ? selectedDays : undefined,
      targetDays,
      dailyGoal,
      unit,
    });

    onOpenChange(false);
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const IconComponent = (Icons as any)[icon] || Icons.Star;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${color}20`, color }}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            Customize Your Habit
          </DialogTitle>
          <DialogDescription>
            Fine-tune every aspect of your habit for maximum success.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="habit-name">Habit Name</Label>
              <Input
                id="habit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter habit name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why is this habit important to you?"
                rows={2}
              />
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label>Difficulty Level</Label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff.value}
                  onClick={() => setDifficulty(diff.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
                    difficulty === diff.value 
                      ? diff.value === 'easy' 
                        ? "border-success bg-success/10"
                        : diff.value === 'medium'
                        ? "border-warning bg-warning/10"
                        : "border-destructive bg-destructive/10"
                      : "border-border hover:bg-accent"
                  )}
                >
                  <span className="font-medium">{diff.label}</span>
                  <span className="text-xs text-muted-foreground">+{diff.xp} XP</span>
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-8 gap-2 max-h-24 overflow-y-auto p-1">
              {ICONS.map((iconName) => {
                const Ic = (Icons as any)[iconName] || Icons.Star;
                return (
                  <button
                    key={iconName}
                    onClick={() => setIcon(iconName)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg border transition-all",
                      icon === iconName
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    <Ic className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color Theme</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    color === c && "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Target Days */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <Label>Goal Duration</Label>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                value={[targetDays]}
                onValueChange={([val]) => setTargetDays(val)}
                max={90}
                min={7}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium w-20">{targetDays} days</span>
            </div>
          </div>

          {/* Daily Goal */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-muted-foreground" />
              <Label>Daily Goal</Label>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={100}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="times">times</SelectItem>
                  <SelectItem value="minutes">minutes</SelectItem>
                  <SelectItem value="hours">hours</SelectItem>
                  <SelectItem value="pages">pages</SelectItem>
                  <SelectItem value="glasses">glasses</SelectItem>
                  <SelectItem value="steps">steps</SelectItem>
                  <SelectItem value="reps">reps</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">per day</span>
            </div>
          </div>

          {/* Reminder Settings */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/30 border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <Label>Daily Reminder</Label>
              </div>
              <Switch
                checked={enableReminder}
                onCheckedChange={setEnableReminder}
              />
            </div>

            {enableReminder && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-32"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Repeat on</span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {DAYS.map((day) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={cn(
                          "px-2 py-1 text-xs rounded-md font-medium transition-all",
                          selectedDays.includes(day)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Create Habit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
