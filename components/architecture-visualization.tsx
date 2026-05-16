'use client';

import React, { useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './custom-node';
import { useFlowView } from '@/hooks/use-flow-view';
import { FlowToolbar } from './architecture/flow-toolbar';
import { useTheme } from 'next-themes';
import { Node, Edge, OnNodesChange, OnEdgesChange } from 'reactflow';

const nodeTypes = {
  custom: CustomNode,
};

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

  const {
    showFolders, setShowFolders,
    showPaths, setShowPaths,
    isExploded, setIsExploded
  } = useFlowView(setNodes, nodes);

  const { setCenter, fitView, zoomIn, zoomOut, getNodes, getEdges } = useReactFlow();

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

  // Highlight Logic
  useEffect(() => {
    if (!selectedNode) {
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, isSelected: false, isRelated: false, isAnySelected: false },
        }))
      );
      setEdges((eds) => eds.map((e) => ({ ...e, animated: false })));
      return;
    }

    setNodes((nds) => {
      const currentEdges = getEdges();
      const relatedNodeIds = new Set<string>([selectedNode]);

      // Calculate related nodes using current edges
      const findUpstream = (nodeId: string) => {
        currentEdges.forEach((edge) => {
          if (edge.target === nodeId && !relatedNodeIds.has(edge.source)) {
            relatedNodeIds.add(edge.source);
            findUpstream(edge.source);
          }
        });
      };

      const findDownstream = (nodeId: string) => {
        currentEdges.forEach((edge) => {
          if (edge.source === nodeId && !relatedNodeIds.has(edge.target)) {
            relatedNodeIds.add(edge.target);
            findDownstream(edge.target);
          }
        });
      };

      findUpstream(selectedNode);
      findDownstream(selectedNode);

      return nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isSelected: n.id === selectedNode,
          isRelated: relatedNodeIds.has(n.id),
          isAnySelected: true,
        },
      }));
    });

    setEdges((eds) => {
      return eds.map((e) => ({
        ...e,
        animated: e.source === selectedNode || e.target === selectedNode,
      }));
    });
  }, [selectedNode, setNodes, setEdges, getEdges]);

  // Auto-focus logic (Split to avoid loops)
  useEffect(() => {
    if (selectedNode) {
      const currentNodes = getNodes();
      const node = currentNodes.find((n) => n.id === selectedNode);
      if (node) {
        const isNested = !!node.parentNode;
        let targetX = node.position.x;
        let targetY = node.position.y;

        if (isNested) {
          const parent = currentNodes.find((n) => n.id === node.parentNode);
          if (parent) {
            targetX += parent.position.x;
            targetY += parent.position.y;
          }
        }

        // Center on the node itself (adding half width/height for true centering)
        // and offset slightly to the left to account for the side panel
        setCenter(targetX + 100, targetY + 50, { zoom: 1.2, duration: 800 });
        onShowDependencies(true);
      }
    }
  }, [selectedNode, setCenter, onShowDependencies, getNodes]);

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
