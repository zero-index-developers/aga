'use client';

import React, { useEffect, useMemo } from 'react';
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



interface ArchitectureVisualizationProps {
  selectedNode: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  onShowDependencies: (show: boolean) => void;
  repoName: string;
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
  nodes,
  setNodes,
  onNodesChange,
  edges,
  setEdges,
  onEdgesChange,
  isLoading,
}: ArchitectureVisualizationProps) {
  const { resolvedTheme } = useTheme();

  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
  }), []);

  const {
    showFolders, setShowFolders,
    showPaths, setShowPaths,
    isExploded, setIsExploded
  } = useFlowView(setNodes, nodes);

  const { setCenter, fitView, zoomIn, zoomOut, getNodes, getEdges } = useReactFlow();
  
  // Get zoom state for toolbar buttons
  const zoom = useStore((s) => s.transform[2]);
  const minZoom = useStore((s) => s.minZoom);
  const maxZoom = useStore((s) => s.maxZoom);

  const canZoomIn = zoom < maxZoom;
  const canZoomOut = zoom > minZoom;

  // Theme-aware edge styling
  const styledEdges = useMemo(() => {
    const isDark = resolvedTheme === 'dark';
    return edges.map((edge) => ({
      ...edge,
      style: {
        ...edge.style,
        stroke: edge.animated
          ? (isDark ? '#3b82f6' : '#2563eb') // Primary Blue
          : (isDark ? '#334155' : '#94a3b8'), // Slate contrast
        strokeWidth: edge.animated ? 3 : 1.5,
        opacity: edge.animated ? 1 : (isDark ? 0.4 : 0.6),
      },
    }));
  }, [edges, resolvedTheme]);

  useFlowInteractions({
    selectedNode,
    setNodes,
    setEdges,
    onShowDependencies,
  });

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
        isExploded={isExploded}
        setIsExploded={setIsExploded}
        onFitView={() => fitView({ duration: 800 })}
        onZoomIn={() => zoomIn({ duration: 400 })}
        onZoomOut={() => zoomOut({ duration: 400 })}
        canZoomIn={canZoomIn}
        canZoomOut={canZoomOut}
      />

      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => {
          if (node.type === 'custom') onNodeSelect(node.id);
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
