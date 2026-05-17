'use client';

import Link from "next/link";
import { useState } from "react";
import { Button } from "@client/components/ui/button";
import { Input } from "@client/components/ui/input";
import { Label } from "@client/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { RegisterSchema } from "@/lib/schemas/auth";

interface RegisterFormProps {
  enableOAuth?: boolean;
}

export function RegisterForm({ enableOAuth = true }: RegisterFormProps) {
  const { register } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate with schema
    const validation = RegisterSchema.safeParse({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
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
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              type="text"
              autoCapitalize="words"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoCapitalize="none"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters
            </p>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoCapitalize="none"
              autoComplete="new-password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              disabled={loading}
              minLength={8}
            />
            {errors.password_confirmation && (
              <p className="text-xs text-destructive">{errors.password_confirmation}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </div>
      </form>


      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="underline underline-offset-4 hover:text-primary"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

// Made with Bob
