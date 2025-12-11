import * as Icons from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge, BADGES } from '@/types/habit';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BadgesSectionProps {
  earnedBadges: Badge[];
}

export function BadgesSection({ earnedBadges }: BadgesSectionProps) {
  const earnedIds = earnedBadges.map(b => b.id);

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-foreground mb-4">Achievements</h3>
      <TooltipProvider delayDuration={100}>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          {BADGES.map((badge) => {
            const isEarned = earnedIds.includes(badge.id);
            const IconComponent = (Icons as any)[badge.icon] || Icons.Star;
            
            return (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                      isEarned 
                        ? "bg-xp/10" 
                        : "bg-muted/30 opacity-40 grayscale"
                    )}
                  >
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      isEarned ? "bg-xp text-xp-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-center font-medium text-foreground truncate w-full">
                      {badge.name}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                  {isEarned && (
                    <p className="text-xs text-success mt-1">✓ Earned!</p>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </Card>
  );
}
