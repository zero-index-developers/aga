'use client';

import { AlertCircle, TrendingDown, TrendingUp, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { ReviewImpactDialog } from './review-impact-dialog';

interface Node {
  id: string;
  data: {
    label: string;
    type: string;
    path: string;
    color: string;
  };
}

interface Edge {
  id: string;
  source: string;
  target: string;
}

interface DependencyPanelProps {
  nodeId: string;
}

export default function DependencyPanel({ nodeId }: DependencyPanelProps) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [graph, setGraph] = useState<{ nodes: Node[], edges: Edge[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGraph() {
      setLoading(true);
      try {
        const res = await fetch('/api/repo/graph');
        const data = await res.json();
        setGraph(data);
      } catch (error) {
        console.error('Failed to fetch graph for dependency analysis:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchGraph();
  }, [nodeId]);

  const analysis = useMemo(() => {
    if (!graph || !nodeId) return null;

    const node = graph.nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const upstreamIds = graph.edges
      .filter(e => e.target === nodeId)
      .map(e => e.source);
    
    const downstreamIds = graph.edges
      .filter(e => e.source === nodeId)
      .map(e => e.target);

    const upstream = upstreamIds.map(id => graph.nodes.find(n => n.id === id)?.data.label || id);
    const downstream = downstreamIds.map(id => graph.nodes.find(n => n.id === id)?.data.label || id);

    const impactCount = upstreamIds.length + downstreamIds.length;
    const risk: 'High' | 'Medium' | 'Low' = impactCount > 5 ? 'High' : impactCount > 2 ? 'Medium' : 'Low';
    const radius = Math.min(100, impactCount * 12 + 10);

    return {
      label: node.data.label,
      type: node.data.type,
      path: node.data.path,
      upstream,
      downstream,
      impactCount,
      risk,
      radius,
      description: `Architecture analysis for ${node.data.label}. This ${node.data.type} is located at ${node.data.path} and serves as a ${impactCount > 3 ? 'critical' : 'standard'} component in the system flow.`
    };
  }, [graph, nodeId]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        <p className="text-xs">Analyzing dependencies...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
        <AlertCircle className="w-8 h-8 mb-4 opacity-20" />
        <p className="text-sm">Select a component to view architectural impact</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-6 pr-12 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Blast Radius Analysis</h3>
              <p className="text-xs text-muted-foreground mt-1">{analysis.label}</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-[10px] text-center font-bold uppercase tracking-wider ${
            analysis.risk === 'High' ? 'bg-red-500/10 text-red-500' :
            analysis.risk === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
            'bg-emerald-500/10 text-emerald-500'
          }`}>
            {analysis.risk}
          </div>
        </div>
      </div>

      {/* Blast Radius Visual */}
      <div className="p-6 border-b border-border space-y-4">
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Blast Radius</span>
            <span className="text-sm font-bold text-foreground">{analysis.radius}%</span>
          </div>
          <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden border border-border/50">
            <div
              className={`h-full transition-all duration-1000 ease-out ${
                analysis.risk === 'High' ? 'bg-red-500' :
                analysis.risk === 'Medium' ? 'bg-amber-500' :
                'bg-emerald-500'
              }`}
              style={{ width: `${analysis.radius}%` }}
            />
          </div>
        </div>

        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-foreground">
              Directly impacts {analysis.impactCount} components
            </span>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">{analysis.description}</p>
        </div>
      </div>

      {/* Dependencies */}
      <div className="flex-1 overflow-y-auto">
        {/* Upstream */}
        {analysis.upstream.length > 0 && (
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Upstream Dependencies</h4>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {analysis.upstream.map((dep) => (
                <div
                  key={dep}
                  className="px-3 py-2 bg-secondary/30 rounded-lg border border-secondary/50 text-[11px] text-foreground/80 truncate"
                  title={dep}
                >
                  {dep}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Downstream */}
        {analysis.downstream.length > 0 && (
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-orange-400" />
              <h4 className="text-sm font-semibold text-foreground">Downstream Dependencies</h4>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {analysis.downstream.map((dep) => (
                <div
                  key={dep}
                  className="px-3 py-2 bg-secondary/30 rounded-lg border border-secondary/50 text-[11px] text-foreground/80 truncate"
                  title={dep}
                >
                  {dep}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="p-6 border-t border-border bg-secondary/20">
        <button 
          onClick={() => setIsReviewOpen(true)}
          className="w-full px-3 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Review Impact
        </button>
      </div>

      <ReviewImpactDialog 
        open={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        nodeId={nodeId}
        risk={analysis.risk}
        impactCount={analysis.impactCount}
      />
    </div>
  );
}
