'use client';

import { motion } from 'framer-motion';
import { Card } from '@client/components/ui/card';
import { Activity, Brain, GitBranch, Network, ShieldAlert, Workflow } from 'lucide-react';

const features = [
  {
    icon: GitBranch,
    title: 'Connect and Scan',
    description: 'Register a GitHub or local repository and let the Laravel worker clone, classify, and persist its architecture graph.',
  },
  {
    icon: Network,
    title: 'Inspect the Map',
    description: 'Use the React Flow canvas to search components, follow dependencies, and compare layers without leaving the dashboard.',
  },
  {
    icon: Activity,
    title: 'Measure Impact',
    description: 'Select a node to see upstream and downstream relationships before changing a controller, service, route, or table.',
  },
  {
    icon: Brain,
    title: 'Ask the Oracle',
    description: 'Ask architecture questions backed by repository context, AI history, cached answers, and deterministic fallbacks.',
  },
  {
    icon: ShieldAlert,
    title: 'Review Risk',
    description: 'Surface hotspots, health scores, and review-impact notes that help teams spot brittle or security-sensitive areas.',
  },
  {
    icon: Workflow,
    title: 'Operate Repeatedly',
    description: 'Track scans, logs, settings, and repository state from a console that is tuned for repeated engineering workflows.',
  },
];

export function FeaturesSection() {
  return (
    <section className="border-b bg-muted/30 py-20 md:py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="mb-10 max-w-3xl"
        >
          <p className="mb-3 text-sm font-medium uppercase text-primary">Product Surface</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Built around the workflows architecture reviews actually need.
          </h2>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
              >
                <Card className="h-full gap-4 rounded-lg p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="leading-7 text-muted-foreground">{feature.description}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
