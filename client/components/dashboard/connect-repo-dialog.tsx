"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Github, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@client/hooks/use-settings";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@client/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@client/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@client/components/ui/select";
import { Input } from "@client/components/ui/input";
import { Button } from "@client/components/ui/button";

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
  provider: z.enum(["github", "gitlab"]),
  token: z.string().optional(),
});

export function ConnectRepoDialog({ onSuccess }: { onSuccess?: (repo: string) => void }) {
  const [open, setOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const { settings } = useSettings();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      provider: "github",
      token: "",
    },
  });

  const selectedProvider = form.watch("provider");
  const isProviderConnected = selectedProvider === "github" 
    ? (settings?.providers?.github ?? true) 
    : (settings?.providers?.gitlab ?? false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsConnecting(true);
    try {
      const res = await fetch('/api/repo/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: values.url,
          provider: values.provider,
          token: values.token || undefined
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Repository connected successfully!");
        setOpen(false);
        form.reset();
        if (onSuccess) {
          onSuccess(data.db.connectedRepo);
        }
      } else {
        toast.error(data.message || data.error || "Failed to connect repository.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Github className="w-4 h-4" />
          Connect Repository
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Repository</DialogTitle>
          <DialogDescription>
            Import a GitHub or GitLab repository to analyze its architecture.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="github">GitHub</SelectItem>
                      <SelectItem value="gitlab">GitLab</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repository URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/user/repo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isProviderConnected ? (
              <div className="bg-secondary/50 p-3 rounded-lg border border-border/50">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Using your connected {selectedProvider === 'github' ? 'GitHub' : 'GitLab'} account.
                </div>
              </div>
            ) : (
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Access Token</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showToken ? "text" : "password"}
                          placeholder="Optional for public repositories"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowToken(!showToken)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                        >
                          {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Required for private repositories. Stored locally.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isConnecting}>
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
