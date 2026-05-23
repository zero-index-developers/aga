'use client';

import { motion } from 'framer-motion';
import { Button } from '@client/components/ui/button';
import Link from 'next/link';
import { Activity, ArrowRight, GitBranch, Network, Search, ShieldCheck } from 'lucide-react';
import { InteractiveDemo } from '@client/components/landing/interactive-demo';

const appHref = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/app`
  : '/app';

const registerHref = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/register`
  : '/register';

export function HeroSection() {
  const capabilities = [
    { icon: Network, text: 'Repository architecture maps' },
    { icon: Search, text: 'Contextual AI questions' },
    { icon: Activity, text: 'Blast-radius analysis' },
    { icon: GitBranch, text: 'GitHub and local scans' },
  ];

  return (
    <section className="relative min-h-[92vh] overflow-hidden border-b bg-background">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,var(--background)_92%)]" />

      <div className="container relative mx-auto grid min-h-[92vh] max-w-7xl items-center gap-10 px-4 py-20 lg:grid-cols-[0.92fr_1.08fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-3xl space-y-8"
        >
          <div className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Architecture Governance Agent
          </div>

          <div className="space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
              AGA maps codebases into decisions your team can act on.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Connect a repository, inspect its dependency graph, and ask the AI Oracle what changes are likely
              to affect before you ship them.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 gap-2 px-6 text-base">
              <Link href={appHref}>
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 gap-2 px-6 text-base">
              <Link href={registerHref}>
                Create Account
                <GitBranch className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {capabilities.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.text}
                  className="flex min-h-12 items-center gap-3 rounded-md border bg-card/80 px-3 text-sm text-muted-foreground shadow-sm"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="relative"
        >
          <InteractiveDemo />
        </motion.div>
      </div>
    </section>
  );
}
