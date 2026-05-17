"use client";

import Header from '@client/components/layout/header';
import { DynamicBreadcrumbs } from '@client/components/layout/dynamic-breadcrumbs';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Award, 
  Code2, 
  GitBranch, 
  Activity,
  Github,
  Twitter,
  Globe
} from 'lucide-react';
import { Button } from '@client/components/ui/button';
import { Card } from '@client/components/ui/card';
import { Badge } from '@client/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@client/components/ui/avatar';

export default function ProfilePage() {
  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://github.com/shadcn.png",
    role: "Lead Systems Architect",
    location: "San Francisco, CA",
    joined: "January 2024",
    stats: {
      repos: 12,
      components: 154,
      reviews: 45
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Header>
        <DynamicBreadcrumbs />
      </Header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto w-full space-y-8 pb-12">
          {/* Hero Header */}
          <Card className="p-8 bg-card/30 backdrop-blur-xl border-border/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-end relative z-10">
              <Avatar className="w-32 h-32 border-4 border-background shadow-2xl">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-4xl">JD</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 self-center md:self-auto">
                    {user.role}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {user.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Joined {user.joined}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Github className="w-4 h-4" />
                  GitHub
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Edit Profile
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <StatsCard 
              label="Repositories Connected" 
              value={user.stats.repos} 
              icon={<GitBranch className="w-5 h-5 text-blue-500" />} 
              description="Active codebases being analyzed"
            />
            <StatsCard 
              label="Components Indexed" 
              value={user.stats.components} 
              icon={<Code2 className="w-5 h-5 text-purple-500" />} 
              description="Functional units discovered"
            />
            <StatsCard 
              label="Refactor Reviews" 
              value={user.stats.reviews} 
              icon={<Activity className="w-5 h-5 text-emerald-500" />} 
              description="AI-generated architectural audits"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent Discoveries
              </h2>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4 bg-card/20 border-border/40 hover:bg-card/30 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-sm">Refactor Review: AuthMiddleware</h4>
                      <span className="text-[10px] text-muted-foreground uppercase">2 hours ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 italic">
                      "Identified potential dependency cycle in the middleware layer. Suggesting decoupling of session logic..."
                    </p>
                  </Card>
                ))}
              </div>
            </section>

            {/* Achievements */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Achievements
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <AchievementBadge title="Code Navigator" description="Scanned 10+ repos" />
                <AchievementBadge title="System Auditor" description="Triggered 50 reviews" />
                <AchievementBadge title="Clean Architect" description="Zero dependency cycles" />
                <AchievementBadge title="Bob's Favorite" description="Highly detailed prompts" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon, description }: any) {
  return (
    <Card className="p-6 bg-card/30 border-border/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-background/50 rounded-lg border border-border/50">
          {icon}
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Card>
  );
}

function AchievementBadge({ title, description }: any) {
  return (
    <Card className="p-3 bg-primary/5 border-primary/20 flex flex-col items-center text-center gap-1 group hover:bg-primary/10 transition-all">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
        <Award className="w-4 h-4 text-primary" />
      </div>
      <span className="text-[10px] font-bold text-foreground truncate w-full">{title}</span>
      <span className="text-[9px] text-muted-foreground">{description}</span>
    </Card>
  );
}
