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

    // Build parent lookup and identify collapsed groups
    const parentMap = new Map<string, string>();
    const collapsedGroups = new Set<string>();

    graph.nodes.forEach(n => {
      if (n.parentNode) parentMap.set(n.id, n.parentNode);
      if (n.type === 'group' && n.data?.isCollapsed) collapsedGroups.add(n.id);
    });

    const isSelectedGroup = node.type === 'group';

    // Map any child node to its visible parent group if that group is collapsed or if the group itself is selected
    const getVisualNodeId = (id: string) => {
      const parentId = parentMap.get(id);
      if (parentId) {
        if (parentId === nodeId && isSelectedGroup) return nodeId;
        if (collapsedGroups.has(parentId)) return parentId;
      }
      return id;
    };

    // Project original edges onto visual nodes
    const visualEdges = graph.edges.map(e => ({
      ...e,
      source: getVisualNodeId(e.source),
      target: getVisualNodeId(e.target),
    })).filter(e => e.source !== e.target);

    // Compute unique upstream and downstream connections
    const upstreamIds = Array.from(new Set(
      visualEdges
        .filter(e => e.target === nodeId)
        .map(e => e.source)
    ));
    
    const downstreamIds = Array.from(new Set(
      visualEdges
        .filter(e => e.source === nodeId)
        .map(e => e.target)
    ));

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
