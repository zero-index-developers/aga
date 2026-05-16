"use client";

import { useState } from 'react';
import Header from '@client/components/header';
import { DynamicBreadcrumbs } from '@client/components/dynamic-breadcrumbs';
import { Button } from '@client/components/ui/button';
import { Input } from '@client/components/ui/input';
import { Card } from '@client/components/ui/card';
import { Badge } from '@client/components/ui/badge';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const handleSave = () => {
    toast.success('Settings saved successfully');
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
              <h1 className="text-3xl font-bold tracking-tight">
                Settings
              </h1>
            </div>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="md:col-span-1">
              <nav className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab('profile')}
                  className={`justify-start ${activeTab === 'profile' ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab('security')}
                  className={`justify-start ${activeTab === 'security' ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Security
                </Button>
              </nav>
            </div>

            {/* Content Area */}
            <div className="md:col-span-3 space-y-12">
              {activeTab === 'profile' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <section className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold tracking-tight">Profile</h3>
                      <p className="text-sm text-muted-foreground">Your personal account details.</p>
                    </div>
                    <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/50">
                      <div className="space-y-6 max-w-md">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Account</label>
                          <Input defaultValue="johndoe" disabled className="bg-background/50 border-border/50 opacity-70" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Full name</label>
                          <Input defaultValue="John Doe" className="bg-background/50 border-border/50" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email</label>
                          <div className="flex items-center gap-3">
                            <Input defaultValue="john.doe@example.com" type="email" className="bg-background/50 border-border/50 flex-1" />
                            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 shrink-0 py-1.5">Verified</Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </section>

                  <section className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold tracking-tight">Sign-in methods</h3>
                      <p className="text-sm text-muted-foreground max-w-2xl">These are the accounts you use to sign in to Riftmap. To connect an org for scanning, go to Workspace &rarr; Connections.</p>
                    </div>
                    <Card className="p-0 overflow-hidden bg-card/30 backdrop-blur-sm border-border/50 max-w-2xl">
                      <div className="flex items-center justify-between p-4 border-b border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center bg-foreground text-background rounded-md">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                          </div>
                          <span className="font-medium">GitHub</span>
                        </div>
                        <Badge variant="secondary" className="bg-secondary/50 text-foreground">Connected</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center bg-[#FC6D26] text-white rounded-md">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.423-.73-.423-.867 0L16.418 9.45H7.582L4.919 1.263c-.137-.423-.73-.423-.867 0L1.388 9.452.045 13.587c-.173.535.022 1.127.468 1.45l11.485 8.358 11.488-8.358c.447-.323.642-.915.469-1.45z" /></svg>
                          </div>
                          <span className="font-medium">GitLab</span>
                        </div>
                        <Badge variant="outline" className="text-muted-foreground border-border/50">Not connected</Badge>
                      </div>
                    </Card>
                  </section>

                  <section className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold tracking-tight">Sessions</h3>
                    </div>
                    <Card className="p-4 bg-card/30 backdrop-blur-sm border-border/50 max-w-2xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Current session</p>
                          <p className="text-xs text-muted-foreground">Last login 5/16/2026</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">Active</Badge>
                          <Button variant="outline" size="sm">Log out</Button>
                        </div>
                      </div>
                    </Card>
                  </section>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <section className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold tracking-tight">Set a password</h3>
                      <p className="text-sm text-muted-foreground max-w-2xl">Your account uses OAuth login only. You can set a password to also sign in with your email and password.</p>
                    </div>
                    <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/50">
                      <div className="space-y-4 max-w-md">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">New password</label>
                          <Input type="password" placeholder="Min. 12 characters, not a common password" className="bg-background/50 border-border/50" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Confirm new password</label>
                          <Input type="password" placeholder="Confirm new password" className="bg-background/50 border-border/50" />
                        </div>
                        <Button className="w-fit mt-2">Save Password</Button>
                      </div>
                    </Card>
                  </section>

                  <section className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold tracking-tight">Two-factor authentication</h3>
                    </div>
                    <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/50">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-medium">Authenticator app</h4>
                          <p className="text-sm text-muted-foreground mt-1">Add an extra layer of security to your account.</p>
                        </div>
                        <Badge variant="secondary" className="bg-secondary/50">Coming soon</Badge>
                      </div>
                    </Card>
                  </section>

                  <section className="space-y-4 pt-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold tracking-tight text-red-500">Danger zone</h3>
                      <p className="text-sm text-muted-foreground max-w-2xl">Permanently deletes your account, personal workspace, all scan data, and API keys. You will be removed from any shared workspaces you are a member of. If you are the sole owner of a shared workspace, transfer ownership first. This cannot be undone.</p>
                    </div>
                    <Card className="p-6 border-red-500/20 bg-red-500/5 backdrop-blur-sm">
                      <div className="space-y-4 max-w-md">
                        <Input placeholder="Type john.doe@example.com to confirm" className="bg-background/50 border-red-500/30 focus-visible:ring-red-500" />
                        <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                          Delete account
                        </Button>
                      </div>
                    </Card>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
