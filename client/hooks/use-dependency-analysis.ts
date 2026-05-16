import { useState, useEffect, useMemo } from 'react';
import { Node, Edge } from 'reactflow';

export function useDependencyAnalysis(nodeId: string) {
  const [graph, setGraph] = useState<{ nodes: Node[], edges: Edge[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGraph() {
      setLoading(true);
      try {
        // Cache-busting to ensure fresh analysis
        const res = await fetch(`/api/repo/graph?_t=${Date.now()}`);
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

    const upstream = upstreamIds
      .map(id => graph.nodes.find(n => n.id === id))
      .filter(n => !!n)
      .map(n => n!.data.label);
    
    const downstream = downstreamIds
      .map(id => graph.nodes.find(n => n.id === id))
      .filter(n => !!n)
      .map(n => n!.data.label);

    const impactCount = upstreamIds.length + downstreamIds.length;
    const risk: 'High' | 'Medium' | 'Low' = impactCount > 5 ? 'High' : impactCount > 2 ? 'Medium' : 'Low';
    const radius = Math.min(100, impactCount * 12 + 10);

    return {
      node,
      upstream,
      downstream,
      impactCount,
      risk,
      radius
    };
  }, [graph, nodeId]);

  return { analysis, loading };
}
