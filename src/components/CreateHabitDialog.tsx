import { useState } from 'react';
import * as Icons from 'lucide-react';
import { Plus, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Habit, HabitCategory, HabitDifficulty, HABIT_TEMPLATES } from '@/types/habit';
import { cn } from '@/lib/utils';

interface CreateHabitDialogProps {
  onCreateHabit: (habit: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completions' | 'createdAt' | 'streakFreezes'>) => void;
}

const CATEGORIES: { value: HabitCategory; label: string; icon: string }[] = [
  { value: 'fitness', label: 'Fitness', icon: 'Dumbbell' },
  { value: 'study', label: 'Study', icon: 'BookOpen' },
  { value: 'wealth', label: 'Wealth', icon: 'Wallet' },
  { value: 'mental', label: 'Mental', icon: 'Brain' },
  { value: 'productivity', label: 'Productivity', icon: 'Zap' },
  { value: 'custom', label: 'Custom', icon: 'Star' },
];

const DIFFICULTIES: { value: HabitDifficulty; label: string; description: string; color: string }[] = [
  { value: 'easy', label: 'Easy', description: '+10 XP', color: 'bg-success/10 border-success text-success' },
  { value: 'medium', label: 'Medium', description: '+25 XP', color: 'bg-warning/10 border-warning text-warning' },
  { value: 'hard', label: 'Hard', description: '+50 XP', color: 'bg-destructive/10 border-destructive text-destructive' },
];

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

const ICONS = ['Dumbbell', 'BookOpen', 'Brain', 'Heart', 'Star', 'Flame', 'Target', 'Trophy', 'Droplets', 'Moon', 'Sun', 'Coffee', 'Music', 'Camera', 'Palette', 'Code'];

export function CreateHabitDialog({ onCreateHabit }: CreateHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Star');
  const [category, setCategory] = useState<HabitCategory>('custom');
  const [difficulty, setDifficulty] = useState<HabitDifficulty>('medium');
  const [color, setColor] = useState(COLORS[0]);

  const handleCreate = () => {
    if (!name.trim()) return;
    
    onCreateHabit({
      name: name.trim(),
      icon,
      category,
      difficulty,
      color,
    });
    
    setName('');
    setIcon('Star');
    setCategory('custom');
    setDifficulty('medium');
    setColor(COLORS[0]);
    setOpen(false);
  };

  const handleTemplateSelect = (template: typeof HABIT_TEMPLATES[0]) => {
    onCreateHabit(template);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 shadow-lg">
          <Plus className="h-5 w-5" />
          New Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
          <DialogDescription>
            Start with a template or create your own custom habit.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="templates" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="custom" className="gap-2">
              <Plus className="h-4 w-4" />
              Custom
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-4 space-y-2">
            {HABIT_TEMPLATES.map((template, index) => {
              const IconComponent = (Icons as any)[template.icon] || Icons.Star;
              return (
                <Card
                  key={index}
                  className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${template.color}20`, color: template.color }}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{template.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{template.category} • {template.difficulty}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="custom" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Habit Name</Label>
              <Input
                id="name"
                placeholder="e.g., Morning Run"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const IconComponent = (Icons as any)[cat.icon] || Icons.Star;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all",
                        category === cat.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-accent"
                      )}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="text-xs">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff.value}
                    onClick={() => setDifficulty(diff.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all",
                      difficulty === diff.value ? diff.color : "border-border hover:bg-accent"
                    )}
                  >
                    <span className="font-medium text-sm">{diff.label}</span>
                    <span className="text-xs opacity-70">{diff.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-8 gap-2">
                {ICONS.map((iconName) => {
                  const IconComponent = (Icons as any)[iconName] || Icons.Star;
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
                      <IconComponent className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "h-8 w-8 rounded-full transition-all",
                      color === c && "ring-2 ring-offset-2 ring-offset-background ring-primary"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!name.trim()}>
                Create Habit
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
