"use client";

import Header from '@client/components/header';
import { DynamicBreadcrumbs } from '@client/components/dynamic-breadcrumbs';
import { 
  Settings as SettingsIcon, 
  User, 
  Mail, 
  Shield, 
  Github,
  Key
} from 'lucide-react';
import { Button } from '@client/components/ui/button';
import { Input } from '@client/components/ui/input';
import { Card } from '@client/components/ui/card';
import { Badge } from '@client/components/ui/badge';
import { toast } from 'sonner';

export default function SettingsPage() {
  const handleSave = () => {
    toast.success('Account settings saved successfully');
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Header>
        <DynamicBreadcrumbs />
      </Header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto w-full space-y-8 pb-12">
          <div className="flex items-center justify-between border-b border-border/50 pb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <SettingsIcon className="w-8 h-8 text-primary" />
                Account Settings
              </h1>
              <p className="text-muted-foreground mt-1">Manage your personal profile and security preferences.</p>
            </div>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
          </div>

          {/* Content Area */}
          <div className="space-y-8">
              {/* Profile Details */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <User className="w-5 h-5 text-primary" />
                  Profile Details
                </div>
                <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/50 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <Input defaultValue="John Doe" className="bg-background/50 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Display Name</label>
                      <Input defaultValue="johndoe" className="bg-background/50 border-border/50" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Email Address
                    </label>
                    <div className="flex gap-4 items-center">
                      <Input defaultValue="john@example.com" type="email" className="bg-background/50 border-border/50 max-w-md" />
                      <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 shrink-0">Verified</Badge>
                    </div>
                  </div>
                </Card>
              </section>

              {/* Security Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Shield className="w-5 h-5 text-primary" />
                  Security
                </div>
                <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/50 space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Change Password</h4>
                    <div className="grid grid-cols-1 gap-4 max-w-md">
                      <div className="space-y-2">
                        <Input type="password" placeholder="Current Password" className="bg-background/50 border-border/50" />
                      </div>
                      <div className="space-y-2">
                        <Input type="password" placeholder="New Password" className="bg-background/50 border-border/50" />
                      </div>
                      <div className="space-y-2">
                        <Input type="password" placeholder="Confirm New Password" className="bg-background/50 border-border/50" />
                      </div>
                      <Button variant="outline" className="w-fit gap-2">
                        <Key className="w-4 h-4" />
                        Update Password
                      </Button>
                    </div>
                  </div>
                </Card>
              </section>

              {/* Connected Accounts */}
              <section className="space-y-4 pt-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Github className="w-5 h-5 text-primary" />
                  Connected Accounts
                </div>
                <Card className="p-6 border-border/50 bg-card/30 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <Github className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold">GitHub</h4>
                        <p className="text-xs text-muted-foreground">Connected as @johndoe</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-border/50">
                      Disconnect
                    </Button>
                  </div>
                </Card>
              </section>
            </div>
          </div>
        </div>
    </div>
  );
}
