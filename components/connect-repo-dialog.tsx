"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Github } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
  provider: z.enum(["github", "gitlab"]),
  token: z.string().optional(),
});

export function ConnectRepoDialog({ onSuccess }: { onSuccess?: (repo: string) => void }) {
  const [open, setOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      provider: "github",
      token: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsConnecting(true);
    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsConnecting(false);

    console.log("Connect Repo Data:", values);
    toast.success("Repository connected successfully!");
    setOpen(false);
    form.reset();
    if (onSuccess) {
      // Use the URL or provider name as a mock repo name
      const repoName = values.url.split('/').pop() || "repository";
      onSuccess(repoName);
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

            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Access Token</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Optional for public repositories"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Required for private repositories. Stored locally.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
