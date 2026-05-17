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
  }), []);

  const {
    showFolders, setShowFolders,
    showPaths, setShowPaths,
    isExploded, setIsExploded
  } = useFlowView(setNodes, initialNodes);

  const [showExplodeConfirm, setShowExplodeConfirm] = React.useState(false);
  const [pendingExplodeValue, setPendingExplodeValue] = React.useState(false);

  const handleToggleExplode = (exploded: boolean) => {
    setPendingExplodeValue(exploded);
    setShowExplodeConfirm(true);
  };

  const confirmExplodeToggle = () => {
    setIsExploded(pendingExplodeValue);
    setShowExplodeConfirm(false);
  };

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
        isExploded={isExploded}
        setIsExploded={handleToggleExplode}
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
        onNodeDoubleClick={(_, node) => {
          if (node.type === 'custom') {
            const isNested = !!node.parentNode;
            let targetX = node.position.x;
            let targetY = node.position.y;

            if (isNested) {
              const currentNodes = getNodes();
              const parent = currentNodes.find((n) => n.id === node.parentNode);
              if (parent) {
                targetX += parent.position.x;
                targetY += parent.position.y;
              }
            }

            // Center on the node itself (adding half width/height for true centering)
            // and offset slightly to the left to account for the side panel
            setCenter(targetX + 100, targetY + 50, { zoom: 1.2, duration: 800 });
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

      <AlertDialog open={showExplodeConfirm} onOpenChange={setShowExplodeConfirm}>
        <AlertDialogContent className="bg-background/80 backdrop-blur-xl border border-border/50 max-w-sm rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-md font-bold tracking-tight">
              {pendingExplodeValue ? 'Explode View Layout' : 'Reset View Layout'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
              {pendingExplodeValue 
                ? 'Exploding the view will expand the system layout and reset any manual node positions you have adjusted. Do you want to proceed?' 
                : 'Returning to standard view will collapse the layout and reset all node positions. Do you want to proceed?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="h-9 text-xs rounded-xl hover:bg-accent border-border/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmExplodeToggle}
              className="h-9 text-xs rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
            >
              Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
