'use client';

import { motion } from 'framer-motion';
import { Activity, Code2, Database, GitPullRequestArrow, LockKeyhole, Server } from 'lucide-react';
import { useEffect, useState } from 'react';

const nodes = [
  { id: 1, icon: Code2, label: 'Next.js UI', layer: 'frontend', x: 16, y: 25 },
  { id: 2, icon: GitPullRequestArrow, label: 'Proxy Routes', layer: 'api', x: 44, y: 40 },
  { id: 3, icon: Server, label: 'Laravel API', layer: 'backend', x: 72, y: 25 },
  { id: 4, icon: LockKeyhole, label: 'Sanctum Auth', layer: 'security', x: 28, y: 72 },
  { id: 5, icon: Database, label: 'PostgreSQL', layer: 'database', x: 68, y: 72 },
];

const connections = [
  [1, 2],
  [2, 3],
  [3, 4],
  [3, 5],
  [4, 5],
];

const layerClasses: Record<string, string> = {
  frontend: 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  api: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  backend: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  security: 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  database: 'border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300',
};

export function InteractiveDemo() {
  const [activeNode, setActiveNode] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode((current) => (current >= nodes.length ? 1 : current + 1));
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-lg border bg-card shadow-2xl shadow-foreground/5">
      <div className="flex h-12 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Activity className="h-4 w-4 text-primary" />
          Live architecture map
        </div>
        <div className="rounded-md border bg-background px-2 py-1 font-mono text-xs text-muted-foreground">
          aga/self-scan
        </div>
      </div>

      <div className="relative aspect-[1.35] min-h-[380px] bg-[linear-gradient(to_right,rgba(148,163,184,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.22)_1px,transparent_1px)] bg-[size:36px_36px] p-4">
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          {connections.map(([from, to]) => {
            const fromNode = nodes.find((node) => node.id === from);
            const toNode = nodes.find((node) => node.id === to);
            if (!fromNode || !toNode) return null;

            const isActive = activeNode === from || activeNode === to;

            return (
              <motion.line
                key={`${from}-${to}`}
                x1={`${fromNode.x}%`}
                y1={`${fromNode.y}%`}
                x2={`${toNode.x}%`}
                y2={`${toNode.y}%`}
                stroke="currentColor"
                strokeWidth={isActive ? 2.5 : 1.5}
                className={isActive ? 'text-primary' : 'text-border'}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6 }}
              />
            );
          })}
        </svg>

        {nodes.map((node) => {
          const Icon = node.icon;
          const isActive = activeNode === node.id;

          return (
            <motion.button
              key={node.id}
              type="button"
              onMouseEnter={() => setActiveNode(node.id)}
              className={`absolute flex h-[68px] w-[132px] -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-md border px-3 text-left shadow-sm backdrop-blur ${layerClasses[node.layer]} ${
                isActive ? 'ring-2 ring-primary/35' : ''
              }`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: isActive ? 1.04 : 1 }}
              transition={{ duration: 0.25 }}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>
                <span className="block text-sm font-semibold text-foreground">{node.label}</span>
                <span className="block font-mono text-[11px] uppercase text-muted-foreground">{node.layer}</span>
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="grid border-t text-sm sm:grid-cols-3">
        {[
          ['43', 'components'],
          ['68', 'dependencies'],
          ['91%', 'health score'],
        ].map(([value, label]) => (
          <div key={label} className="border-b p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
            <div className="font-mono text-xl font-semibold">{value}</div>
            <div className="text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
