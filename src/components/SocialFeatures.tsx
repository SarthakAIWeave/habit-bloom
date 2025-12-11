import { useState } from 'react';
import { Users, Trophy, UserPlus, Share2, Shield, Globe, Lock, Crown, Medal, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { UserStats } from '@/types/habit';

interface SocialFeaturesProps {
  stats: UserStats;
}

// Mock data for demo
const MOCK_FRIENDS = [
  { id: '1', name: 'Alex Chen', xp: 2450, level: 5, streak: 14, avatar: 'AC' },
  { id: '2', name: 'Sarah Park', xp: 3200, level: 6, streak: 21, avatar: 'SP' },
  { id: '3', name: 'Mike Johnson', xp: 1800, level: 4, streak: 7, avatar: 'MJ' },
];

const MOCK_GROUPS = [
  { id: '1', name: 'Morning Runners', members: 12, challenge: '30-Day Run Challenge', progress: 65 },
  { id: '2', name: 'Study Squad', members: 8, challenge: 'Read 30 mins daily', progress: 80 },
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Anonymous Achiever', xp: 5420, streak: 45, isYou: false },
  { rank: 2, name: 'Habit Hero', xp: 4890, streak: 38, isYou: false },
  { rank: 3, name: 'Consistency King', xp: 4200, streak: 32, isYou: false },
  { rank: 4, name: 'You', xp: 0, streak: 0, isYou: true },
  { rank: 5, name: 'Rising Star', xp: 3100, streak: 25, isYou: false },
];

export function SocialFeatures({ stats }: SocialFeaturesProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [anonymousMode, setAnonymousMode] = useState(true);
  const [shareProgress, setShareProgress] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [activeTab, setActiveTab] = useState('friends');

  // Update leaderboard with user's actual stats
  const leaderboard = MOCK_LEADERBOARD.map(entry => 
    entry.isYou 
      ? { ...entry, xp: stats.xp, streak: stats.longestStreak }
      : entry
  ).sort((a, b) => b.xp - a.xp).map((entry, index) => ({ ...entry, rank: index + 1 }));

  const userRank = leaderboard.find(e => e.isYou)?.rank || 0;

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    
    toast({
      title: 'Invitation sent!',
      description: `An invite has been sent to ${inviteEmail}`,
    });
    setInviteEmail('');
  };

  const handleShareProgress = () => {
    // Create share text
    const shareText = `I've completed ${stats.totalHabitsCompleted} habits and earned ${stats.xp} XP on HabitFlow! 🎯`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My HabitFlow Progress',
        text: shareText,
        url: window.location.href,
      }).catch(() => {
        // User cancelled or share failed
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: 'Copied to clipboard!',
        description: 'Share your progress with friends.',
      });
    }
  };

  const handleJoinGroup = (groupName: string) => {
    toast({
      title: 'Group joined!',
      description: `You've joined ${groupName}. Good luck with the challenge!`,
    });
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-warning" />;
      case 2:
        return <Medal className="h-4 w-4 text-muted-foreground" />;
      case 3:
        return <Award className="h-4 w-4 text-chart-1" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Social</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Social & Accountability
          </DialogTitle>
          <DialogDescription>
            Connect with friends and stay accountable together.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends" className="gap-1">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Friends</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Groups</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-1">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Ranks</span>
            </TabsTrigger>
          </TabsList>

          {/* Friends Tab */}
          <TabsContent value="friends" className="mt-4 space-y-4">
            {/* Invite Section */}
            <Card className="p-4">
              <h4 className="font-medium text-foreground mb-3">Invite Friends</h4>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="friend@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleInvite}>
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* Friends List */}
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Your Friends</h4>
              {MOCK_FRIENDS.map((friend) => (
                <Card key={friend.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {friend.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{friend.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Level {friend.level}</span>
                        <span>•</span>
                        <span>{friend.xp} XP</span>
                        <span>•</span>
                        <span>🔥 {friend.streak} days</span>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      #{MOCK_FRIENDS.indexOf(friend) + 1}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>

            {/* Share Progress */}
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={handleShareProgress}
            >
              <Share2 className="h-4 w-4" />
              Share Your Progress
            </Button>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="mt-4 space-y-4">
            <div className="space-y-3">
              {MOCK_GROUPS.map((group) => (
                <Card key={group.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-foreground">{group.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {group.members} members • {group.challenge}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => handleJoinGroup(group.name)}>
                      Join
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Group Progress</span>
                      <span className="font-medium">{group.progress}%</span>
                    </div>
                    <Progress value={group.progress} className="h-2" />
                  </div>
                </Card>
              ))}
            </div>

            {/* Create Group */}
            <Button variant="outline" className="w-full gap-2">
              <Users className="h-4 w-4" />
              Create Private Group
            </Button>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="mt-4 space-y-4">
            {/* Privacy Settings */}
            <Card className="p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Anonymous Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Hide your name on leaderboards
                    </p>
                  </div>
                </div>
                <Switch
                  checked={anonymousMode}
                  onCheckedChange={setAnonymousMode}
                />
              </div>
            </Card>

            {/* Your Rank */}
            <Card className="p-4 bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-lg">
                  #{userRank}
                </div>
                <div>
                  <p className="font-semibold text-foreground">Your Ranking</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.xp} XP • {stats.longestStreak} day best streak
                  </p>
                </div>
              </div>
            </Card>

            {/* Leaderboard List */}
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((entry) => (
                <Card 
                  key={entry.rank} 
                  className={`p-3 ${entry.isYou ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(entry.rank) || (
                        <span className="text-sm font-medium text-muted-foreground">
                          #{entry.rank}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium truncate ${entry.isYou ? 'text-primary' : 'text-foreground'}`}>
                          {anonymousMode && !entry.isYou 
                            ? `Player ${entry.rank}` 
                            : entry.name}
                        </p>
                        {entry.isYou && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {entry.xp} XP • 🔥 {entry.streak} days
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
