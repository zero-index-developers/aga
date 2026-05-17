"use client";

import { useState } from 'react';

import { Button } from '@client/components/ui/button';
import { Card } from '@client/components/ui/card';
import { ProfileForm } from './components/profile-form';
import { SignInMethods } from './components/signin-methods';
import { SecurityForm } from './components/security-form';
import { DangerZone } from './components/danger-zone';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground overflow-hidden">

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto w-full space-y-8 pb-12">
          <div className="flex items-center justify-between border-b border-border/50 pb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Settings
              </h1>
            </div>
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
                  <section className="space-y-4 max-w-lg">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold tracking-tight">Profile</h3>
                      <p className="text-sm text-muted-foreground">Your personal account details.</p>
                    </div>
                    <ProfileForm />
                  </section>

                  <section className="space-y-4 max-w-lg">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold tracking-tight">Sign-in methods</h3>
                      <p className="text-sm text-muted-foreground ">These are the accounts you use to sign in to AGA. Connect your GitHub account to enable OAuth login.</p>
                    </div>
                    <SignInMethods />
                  </section>

                  <section className="space-y-4 max-w-lg">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold tracking-tight">Sessions</h3>
                    </div>
                    <Card className="p-4 bg-card/30 backdrop-blur-sm border-border/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Current session</p>
                          <p className="text-xs text-muted-foreground">Last login 5/16/2026</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="sm">Log out</Button>
                        </div>
                      </div>
                    </Card>
                  </section>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <section className="space-y-4 max-w-lg">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold tracking-tight">Set a password</h3>
                      <p className="text-sm text-muted-foreground max-w-2xl">Your account uses OAuth login only. You can set a password to also sign in with your email and password.</p>
                    </div>
                    <SecurityForm />
                  </section>

                  <section className="space-y-4 pt-4 max-w-lg">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold tracking-tight text-red-500">Danger zone</h3>
                      <p className="text-sm text-muted-foreground max-w-2xl">Permanently deletes your account, personal workspace, all scan data, and API keys. You will be removed from any shared workspaces you are a member of. If you are the sole owner of a shared workspace, transfer ownership first. This cannot be undone.</p>
                    </div>
                    <DangerZone />
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
