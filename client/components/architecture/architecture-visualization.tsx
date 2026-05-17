'use client';

import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  useStore,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './custom-node';
import { useFlowView } from '@client/hooks/use-flow-view';
import { useFlowInteractions } from '@client/hooks/use-flow-interactions';
import { FlowToolbar } from './flow-toolbar';
import { useTheme } from 'next-themes';
import { Node, Edge, OnNodesChange, OnEdgesChange } from 'reactflow';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { slugify } from '@client/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@client/components/ui/alert-dialog';



interface ArchitectureVisualizationProps {
  selectedNode: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  onShowDependencies: (show: boolean) => void;
  repoName: string;
  initialNodes: Node[];
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  onNodesChange: OnNodesChange;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onEdgesChange: OnEdgesChange;
  isLoading: boolean;
}

function ArchitectureFlow({
  selectedNode,
  onNodeSelect,
  onShowDependencies,
  initialNodes,
  nodes,
  setNodes,
  onNodesChange,
  edges,
  setEdges,
  onEdgesChange,
  isLoading,
  repoName,
}: ArchitectureVisualizationProps) {
  const { resolvedTheme } = useTheme();

  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
    group: CustomNode,
  }), []);

  const {
    showFolders, setShowFolders,
    showPaths, setShowPaths
  } = useFlowView(setNodes, initialNodes);

  const { setCenter, fitView, zoomIn, zoomOut, getNodes, getEdges, fitBounds } = useReactFlow();

  // Get zoom state for toolbar buttons
  const zoom = useStore((s) => s.transform[2]);
  const minZoom = useStore((s) => s.minZoom);
  const maxZoom = useStore((s) => s.maxZoom);

  const canZoomIn = zoom < maxZoom;
  const canZoomOut = zoom > minZoom;

  // Theme-aware edge styling
  const styledEdges = useMemo(() => {
    const isDark = resolvedTheme === 'dark';

    // Build parent lookup and collapsed groups set
    const parentMap = new Map<string, string>();
    const collapsedGroups = new Set<string>();

    nodes.forEach(n => {
      if (n.parentNode) parentMap.set(n.id, n.parentNode);
      if (n.type === 'group' && n.data?.isCollapsed) collapsedGroups.add(n.id);
    });

    const getVisualNodeId = (nodeId: string) => {
      const parentId = parentMap.get(nodeId);
      if (parentId && collapsedGroups.has(parentId)) {
        return parentId;
      }
      return nodeId;
    };

    return edges.map((edge) => {
      const visualSource = getVisualNodeId(edge.source);
      const visualTarget = getVisualNodeId(edge.target);

      if (visualSource === visualTarget) {
        return { ...edge, hidden: true };
      }

      return {
        ...edge,
        source: visualSource,
        target: visualTarget,
        hidden: false,
        style: {
          ...edge.style,
          stroke: edge.animated
            ? (isDark ? '#3b82f6' : '#2563eb') // Primary Blue
            : (isDark ? '#334155' : '#94a3b8'), // Slate contrast
          strokeWidth: edge.animated ? 3 : 1.5,
          opacity: edge.animated ? 1 : (isDark ? 0.4 : 0.6),
        },
      };
    });
  }, [edges, resolvedTheme, nodes]);

  useFlowInteractions({
    selectedNode,
    setNodes,
    setEdges,
    onShowDependencies,
  });

  // Listen for external focus requests (e.g. from AI Oracle or Explorer)
  React.useEffect(() => {
    const handleFocusNode = (e: Event) => {
      const customEvent = e as CustomEvent;
      const nodeId = customEvent.detail?.nodeId;
      if (!nodeId) return;

      // Use getNodes() from ReactFlow store for accurate internal positions
      const internalNodes = getNodes();
      const node = internalNodes.find(n => n.id === nodeId);
      if (!node) return;

      // Compute absolute position (child positions are relative to parent)
      let absX = node.position.x;
      let absY = node.position.y;

      if (node.parentNode) {
        const parent = internalNodes.find(n => n.id === node.parentNode);
        if (parent) {
          absX += parent.position.x;
          absY += parent.position.y;
        }
      }

      // If it's a maximized group, fit the bounds of the group to zoom out appropriately
      if (node.type === 'group' && !node.data?.isCollapsed) {
        const width = (node.width as number) ?? (node.data?.origWidth as number) ?? 840;
        const height = (node.height as number) ?? (node.data?.origHeight as number) ?? 400;

        fitBounds(
          { x: absX, y: absY, width, height },
          { padding: 0.2, duration: 800 }
        );
      } else {
        // Center on the node with an offset for typical node dimensions (~200x60)
        setCenter(absX + 100, absY + 30, { zoom: 1.5, duration: 800 });
      }
    };

    const handleToggleCollapse = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { groupId, isCollapsed } = customEvent.detail;

      setNodes((nds) => nds.map((n) => {
        if (n.id === groupId) {
          const origWidth = n.data.origWidth ?? n.style?.width;
          const origHeight = n.data.origHeight ?? n.style?.height;
          return {
            ...n,
            data: {
              ...n.data,
              isCollapsed,
              origWidth,
              origHeight,
              origClassName: n.data.origClassName || n.className
            },
            className: isCollapsed ? '' : (showFolders ? (n.data.origClassName || n.className) : 'opacity-0 pointer-events-none'),
            style: isCollapsed
              ? { ...n.style, width: 'auto', height: 'auto', opacity: 1, backgroundColor: 'transparent', border: 'none' }
              : { ...n.style, width: origWidth, height: origHeight, backgroundColor: undefined, border: undefined, opacity: showFolders ? 1 : 0 },
            draggable: isCollapsed ? true : showFolders,
            selectable: isCollapsed ? true : showFolders,
          };
        }
        if (n.parentNode === groupId) {
          return { ...n, hidden: isCollapsed };
        }
        return n;
      }));
    };

    window.addEventListener('focus-node', handleFocusNode);
    window.addEventListener('toggle-folder-collapse', handleToggleCollapse);
    return () => {
      window.removeEventListener('focus-node', handleFocusNode);
      window.removeEventListener('toggle-folder-collapse', handleToggleCollapse);
    };
  }, [getNodes, setCenter, setNodes, showFolders, fitBounds]);

  const handleDownloadImage = () => {
    const flowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!flowElement) return;

    toast.loading('Generating high-quality image...', { id: 'image-download' });

    toPng(flowElement, {
      backgroundColor: resolvedTheme === 'dark' ? '#020817' : '#ffffff',
      pixelRatio: 2,
    })
      .then((dataUrl) => {
        const a = document.createElement('a');
        a.setAttribute('download', `${slugify(repoName)}-architecture.png`);
        a.setAttribute('href', dataUrl);
        a.click();
        toast.success('Image saved successfully!', { id: 'image-download' });
      })
      .catch((err) => {
        console.error('Failed to export image', err);
        toast.error('Failed to generate image.', { id: 'image-download' });
      });
  };

  const handleFormatLayout = () => {
    setNodes((nds) => {
      const roots = nds.filter((n) => !n.parentNode);
      const newPositions = new Map<string, { x: number; y: number }>();

      const getDim = (n: Node) => {
        if (n.data?.isCollapsed) return { w: 180, h: 60 };
        return {
          w: (n.width as number) ?? (n.data?.origWidth as number) ?? 250,
          h: (n.height as number) ?? (n.data?.origHeight as number) ?? 100,
        };
      };

      let currentX = 0;
      let currentY = 0;
      let rowHeight = 0;
      const MARGIN_X = 60;
      const MARGIN_Y = 60;
      const MAX_WIDTH = 1400; // Optimal width for 1080p viewing

      // Build dependency map to calculate topological scores
      const rootMap = new Map<string, string>();
      nds.forEach(n => {
        if (n.parentNode) {
          rootMap.set(n.id, n.parentNode);
        } else {
          rootMap.set(n.id, n.id);
        }
      });

      const outDegree = new Map<string, number>();
      const inDegree = new Map<string, number>();

      edges.forEach(e => {
        const rootSource = rootMap.get(e.source);
        const rootTarget = rootMap.get(e.target);
        if (rootSource && rootTarget && rootSource !== rootTarget) {
          outDegree.set(rootSource, (outDegree.get(rootSource) || 0) + 1);
          inDegree.set(rootTarget, (inDegree.get(rootTarget) || 0) + 1);
        }
      });

      const getScore = (id: string) => {
        const outD = outDegree.get(id) || 0;
        const inD = inDegree.get(id) || 0;
        // Higher score = more outgoing connections / fewer incoming = should be at the top
        return outD - inD;
      };

      // Sort nodes smartly based on edge topology
      roots.sort((a, b) => {
        const scoreA = getScore(a.id);
        const scoreB = getScore(b.id);
        
        if (scoreA !== scoreB) {
          return scoreB - scoreA; // Descending (highest score first)
        }

        // Fallback to groups first
        if (a.type === 'group' && b.type !== 'group') return -1;
        if (a.type !== 'group' && b.type === 'group') return 1;
        return a.id.localeCompare(b.id);
      });

      roots.forEach((n) => {
        const { w, h } = getDim(n);
        if (currentX + w > MAX_WIDTH && currentX > 0) {
          currentX = 0;
          currentY += rowHeight + MARGIN_Y;
          rowHeight = 0;
        }

        newPositions.set(n.id, { x: currentX, y: currentY });

        currentX += w + MARGIN_X;
        if (h > rowHeight) rowHeight = h;
      });

      return nds.map((n) => {
        if (!n.parentNode && newPositions.has(n.id)) {
          return {
            ...n,
            position: newPositions.get(n.id)!,
          };
        }
        return n;
      });
    });

    setTimeout(() => fitView({ padding: 0.1, duration: 800 }), 50);
    toast.success('Layout formatted!');
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950/20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group">
      <FlowToolbar
        showFolders={showFolders}
        setShowFolders={setShowFolders}
        showPaths={showPaths}
        setShowPaths={setShowPaths}
        onFitView={() => fitView({ duration: 800 })}
        onZoomIn={() => zoomIn({ duration: 400 })}
        onZoomOut={() => zoomOut({ duration: 400 })}
        canZoomIn={canZoomIn}
        canZoomOut={canZoomOut}
        onCaptureView={handleDownloadImage}
        onFormatLayout={handleFormatLayout}
      />

      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        minZoom={0.2}
        maxZoom={4}
        onNodeClick={(_, node) => {
          if (node.type === 'custom' || node.type === 'group') onNodeSelect(node.id);
        }}
        onNodeDoubleClick={(_, node) => {
          if (node.type === 'custom' || node.type === 'group') {
            window.dispatchEvent(new CustomEvent('focus-node', { detail: { nodeId: node.id } }));
          }
        }}
        onPaneClick={() => onNodeSelect(null)}
        fitView
        className="bg-transparent"
      >
        <Background
          color={resolvedTheme === 'dark' ? '#334155' : '#94a3b8'}
          gap={20}
          variant={BackgroundVariant.Dots}
        />
      </ReactFlow>
    </div>
  );
}

export default function ArchitectureVisualization(props: ArchitectureVisualizationProps) {
  return (
    <ReactFlowProvider>
      <ArchitectureFlow {...props} />
    </ReactFlowProvider>
  );
}
