import { useState } from 'react';
import { Smile, Meh, Frown, SmilePlus, Angry } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mood } from '@/types/habit';
import { cn } from '@/lib/utils';

interface HabitNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habitName: string;
  existingNote?: string;
  existingMood?: Mood;
  onSave: (note: string, mood?: string) => void;
}

const MOODS: { value: Mood; icon: typeof Smile; label: string; color: string }[] = [
  { value: 'great', icon: SmilePlus, label: 'Great', color: 'text-success hover:bg-success/20' },
  { value: 'good', icon: Smile, label: 'Good', color: 'text-primary hover:bg-primary/20' },
  { value: 'okay', icon: Meh, label: 'Okay', color: 'text-warning hover:bg-warning/20' },
  { value: 'bad', icon: Frown, label: 'Bad', color: 'text-muted-foreground hover:bg-muted' },
  { value: 'terrible', icon: Angry, label: 'Terrible', color: 'text-destructive hover:bg-destructive/20' },
];

export function HabitNoteDialog({
  open,
  onOpenChange,
  habitName,
  existingNote,
  existingMood,
  onSave,
}: HabitNoteDialogProps) {
  const [note, setNote] = useState(existingNote || '');
  const [mood, setMood] = useState<Mood | undefined>(existingMood);

  const handleSave = () => {
    onSave(note, mood);
    setNote('');
    setMood(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How did it go?</DialogTitle>
          <DialogDescription>
            Add a note about "{habitName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">How are you feeling?</label>
            <div className="flex items-center justify-between gap-2">
              {MOODS.map(({ value, icon: Icon, label, color }) => (
                <button
                  key={value}
                  onClick={() => setMood(value)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                    color,
                    mood === value && "ring-2 ring-primary bg-primary/10"
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Quick note (optional)</label>
            <Textarea
              placeholder="How did this habit feel today?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
