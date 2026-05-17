"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@client/components/ui/card';
import { Badge } from '@client/components/ui/badge';
import { Button } from '@client/components/ui/button';
import { Input } from '@client/components/ui/input';
import { toast } from 'sonner';
import { useSettings } from '@client/hooks/use-settings';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@client/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@client/components/ui/form';

const connectProviderFormSchema = z.object({
  providerToken: z.string().min(1, { message: "Token is required." }),
});

export function SignInMethods() {
  const { settings, updateSettings, isLoading } = useSettings();
  const githubConnected = settings?.providers?.github ?? true; // Default to true for demo
  const gitLabConnected = settings?.providers?.gitlab ?? false;
  
  const [connectProviderOpen, setConnectProviderOpen] = useState<string | null>(null);
  const [isConnectingProvider, setIsConnectingProvider] = useState(false);

  const connectForm = useForm<z.infer<typeof connectProviderFormSchema>>({
    resolver: zodResolver(connectProviderFormSchema),
    defaultValues: {
      providerToken: "",
    },
  });

  const onConnectSubmit = async (values: z.infer<typeof connectProviderFormSchema>) => {
    setIsConnectingProvider(true);
    const providerKey = connectProviderOpen?.toLowerCase() as 'github' | 'gitlab';
    
    await updateSettings({
      providers: {
        ...(settings?.providers || { github: true, gitlab: false }),
        [providerKey]: true,
      }
    });

    setIsConnectingProvider(false);
    setConnectProviderOpen(null);
    connectForm.reset();
    toast.success(`${connectProviderOpen} account connected successfully!`);
  };

  const handleDisconnect = async (provider: 'github' | 'gitlab') => {
    await updateSettings({
      providers: {
        ...(settings?.providers || { github: true, gitlab: false }),
        [provider]: false,
      }
    });
    toast.success(`${provider === 'github' ? 'GitHub' : 'GitLab'} account disconnected`);
  };

  return (
    <>
      <Card className="p-0 overflow-hidden bg-card/30 backdrop-blur-sm border-border/50 gap-0">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-foreground text-background rounded-md">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
            </div>
            <span className="font-medium">GitHub</span>
          </div>
          <div className="flex items-center gap-3">
            {githubConnected ? (
              <>
                <Badge variant="secondary" className="bg-secondary/50 text-foreground">Connected</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10 text-xs h-8"
                  onClick={() => handleDisconnect('github')}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <>
                <Badge variant="outline" className="text-muted-foreground border-border/50">Not connected</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setConnectProviderOpen("GitHub")}
                >
                  Connect
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-[#FC6D26] text-white rounded-md">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.423-.73-.423-.867 0L16.418 9.45H7.582L4.919 1.263c-.137-.423-.73-.423-.867 0L1.388 9.452.045 13.587c-.173.535.022 1.127.468 1.45l11.485 8.358 11.488-8.358c.447-.323.642-.915.469-1.45z" /></svg>
            </div>
            <span className="font-medium">GitLab</span>
          </div>
          <div className="flex items-center gap-3">
            {gitLabConnected ? (
              <>
                <Badge variant="secondary" className="bg-secondary/50 text-foreground">Connected</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10 text-xs h-8"
                  onClick={() => handleDisconnect('gitlab')}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <>
                <Badge variant="outline" className="text-muted-foreground border-border/50">Not connected</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setConnectProviderOpen("GitLab")}
                >
                  Connect
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      <Dialog open={connectProviderOpen !== null} onOpenChange={(open) => !open && setConnectProviderOpen(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect {connectProviderOpen}</DialogTitle>
            <DialogDescription>
              Authorize your {connectProviderOpen} account to scan organizations and repositories.
            </DialogDescription>
          </DialogHeader>
          <Form {...connectForm}>
            <form onSubmit={connectForm.handleSubmit(onConnectSubmit)} className="space-y-4 py-2">
              <FormField
                control={connectForm.control}
                name="providerToken"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Personal Access Token</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="glpat-..."
                        className="bg-background/50 border-border/50"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Required to access your private organizations and projects.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4 gap-2 flex justify-end">
                <Button type="button" variant="outline" onClick={() => setConnectProviderOpen(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isConnectingProvider || !connectForm.formState.isDirty}
                >
                  {isConnectingProvider ? "Connecting..." : "Connect account"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
