'use client';

import React, { useState } from 'react';
import {
  Zap,
  ShieldAlert,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Info
} from 'lucide-react';
import { Card } from '@client/components/ui/card';
import { useTheme } from "next-themes";
import { getRiskColor } from "@client/lib/utils";
import { Badge } from '@client/components/ui/badge';
import { Progress } from '@client/components/ui/progress';
import { Skeleton } from '@client/components/ui/skeleton';
import { useDependencyAnalysis } from '@client/hooks/use-dependency-analysis';

interface DependencyPanelProps {
  nodeId: string;
}

export default function DependencyPanel({ nodeId }: DependencyPanelProps) {
  const { analysis, loading } = useDependencyAnalysis(nodeId);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background/50 backdrop-blur-xl border-l border-border/50">
        <div className="p-6 border-b border-border/50 space-y-4">
          <div className="flex items-center justify-between pr-7">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex-1 p-6 space-y-8">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const { node, upstream, downstream, risk, radius } = analysis;
  const riskColor = getRiskColor(risk);

  const handleTriggerReview = () => {
    const prompt = `Conduct a refactor review for ${node.data.label}. It has a ${risk} risk level and a propagation radius of ${radius}%. Based on its ${upstream.length} consumers and ${downstream.length} dependencies, what are the primary architectural concerns?`;

    // Dispatch custom event to be picked up by SearchPanel (Bob)
    window.dispatchEvent(new CustomEvent('trigger-refactor-review', {
      detail: { prompt }
    }));
  };

  return (
    <div className="flex flex-col h-full bg-background/50 backdrop-blur-xl border-l border-border/50">
      {/* ... Panel Header ... */}
      <div className="p-6 border-b border-border/50 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex items-center justify-between mb-2 pr-7">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1.5 px-2.5 py-1">
            <Zap className="w-3.5 h-3.5 fill-current" />
            Live Blast Radius
          </Badge>
          <Badge variant="secondary" className={`${riskColor} border-none font-bold`}>
            {risk} RISK
          </Badge>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground truncate">{node.data.label}</h2>
        <div className="flex flex-col gap-1.5 mt-1.5">
          <p className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${riskColor} flex items-center gap-1 w-fit`}>
            <Info className="w-3 h-3" />
            Impact Analysis
          </p>
          <p className="text-[10px] text-muted-foreground font-mono bg-accent/30 px-2 py-0.5 rounded border border-border/50 w-fit truncate max-w-full">
            {node.data.path}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Risk Visualizer */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="w-4 h-4 text-primary" />
              Propagation Radius
            </div>
            <span className="text-sm font-bold text-primary">{radius}%</span>
          </div>
          <div className="relative h-3 w-full bg-primary/10 rounded-full overflow-hidden">
            <Progress value={radius} className="h-full transition-all duration-1000 ease-out" />
          </div>
        </section>

        {/* Upstream Dependencies */}
        <AnalysisCard
          title="Consumers"
          description="Components that depend on this node"
          items={upstream}
          icon={<ArrowUpRight className="w-4 h-4" />}
          color="text-emerald-500"
          bgColor="bg-emerald-500/10"
        />

        {/* Downstream Dependencies */}
        <AnalysisCard
          title="Dependencies"
          description="What this node depends on"
          items={downstream}
          icon={<ArrowDownRight className="w-4 h-4" />}
          color="text-blue-500"
          bgColor="bg-blue-600/10"
        />
      </div>

      {/* Action Footer */}
      <div className="p-6 bg-gradient-to-t from-background to-transparent border-t border-border/50">
        <button
          onClick={handleTriggerReview}
          className="w-full group relative flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-bold transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:-translate-y-0.5 overflow-hidden active:translate-y-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <ShieldAlert className="w-4 h-4" />
          Trigger Refactor Review
        </button>
      </div>
    </div>
  );
}

function AnalysisCard({ title, description, items, icon, color, bgColor }: any) {
  return (
    <Card className="bg-card/40 border-border/40 overflow-hidden group hover:border-primary/30 transition-colors">
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${bgColor} ${color}`}>
              {icon}
            </div>
            <h3 className="font-bold text-sm">{title}</h3>
          </div>
          <Badge variant="outline" className="text-[10px] opacity-60 px-1.5 h-4">
            {items.length} units
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground mb-4">{description}</p>

        <div className="space-y-1">
          {items.length > 0 ? (
            items.map((item: string, i: number) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 rounded-lg bg-accent/50 text-xs font-medium hover:bg-accent hover:text-primary transition-all cursor-default"
              >
                <ChevronRight className="w-3 h-3 opacity-30" />
                {item}
              </div>
            ))
          ) : (
            <div className="text-[10px] text-muted-foreground/50 italic py-2 text-center border border-dashed border-border/50 rounded-lg">
              No immediate connections detected
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
