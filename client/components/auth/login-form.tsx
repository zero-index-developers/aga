'use client';

import Link from "next/link";
import { useState } from "react";
import { Github, Gitlab } from "lucide-react";
import { Button } from "@client/components/ui/button";
import { Input } from "@client/components/ui/input";
import { Label } from "@client/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { LoginSchema } from "@/lib/schemas/auth";

interface LoginFormProps {
  enableOAuth?: boolean;
}

export function LoginForm({ enableOAuth = true }: LoginFormProps) {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate with schema
    const validation = LoginSchema.safeParse({
      email,
      password,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path.join('.');
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      
      // Show first error in toast
      const firstError = Object.values(fieldErrors)[0];
      toast({
        title: "Validation Error",
        description: firstError,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await login({ email, password });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setGithubLoading(true);
    try {
      authService.startGitHubOAuth();
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate GitHub login. Please try again.",
        variant: "destructive",
      });
      setGithubLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoCapitalize="none"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {enableOAuth ? (
          <Button
            variant="outline"
            type="button"
            onClick={handleGitHubLogin}
            disabled={githubLoading || loading}
          >
            <Github className="mr-2 h-4 w-4" />
            {githubLoading ? "Connecting..." : "GitHub"}
          </Button>
        ) : (
          <Button variant="outline" type="button" disabled>
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        )}
        <Button variant="outline" type="button" disabled>
          <Gitlab className="mr-2 h-4 w-4" />
          GitLab
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="underline underline-offset-4 hover:text-primary"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}

// Made with Bob
