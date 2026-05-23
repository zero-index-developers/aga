'use client';

import { motion } from 'framer-motion';
import { Button } from '@client/components/ui/button';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

const appHref = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/app`
  : '/app';

export function CTASection() {
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="container mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="flex flex-col justify-between gap-8 rounded-lg border bg-card p-6 shadow-sm md:flex-row md:items-center md:p-8"
        >
          <div className="max-w-2xl space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Open the console and scan the repository you are working on.
            </h2>
            <p className="text-muted-foreground">
              The fastest path is the dashboard: connect a repo, wait for the worker, then inspect the graph and logs.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-11 gap-2">
              <Link href={appHref}>
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 gap-2">
              <Link href="https://github.com/zero-index-developers/aga">
                Repository
                <BookOpen className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
