'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  NodeMouseHandler,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './custom-node';
import { Folder, FolderMinus, FileText, EyeOff, Maximize2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const nodeTypes = {
  custom: CustomNode,
};



interface ArchitectureVisualizationProps {
  selectedNode: string | null;
  onNodeSelect: (nodeId: string) => void;
  onShowDependencies: (show: boolean) => void;
}

function ArchitectureFlow({
  selectedNode,
  onNodeSelect,
  onShowDependencies,
}: ArchitectureVisualizationProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const initialNodesRef = useRef<Node[]>([]);
  const prevExplodedRef = useRef(false);
  const [showFolders, setShowFolders] = useState(true);
  const [showPaths, setShowPaths] = useState(true);
  const [isExploded, setIsExploded] = useState(false);
  const { setCenter, fitView } = useReactFlow();

  // Fetch Graph Data
  useEffect(() => {
    async function fetchGraph() {
      try {
        const res = await fetch('/api/repo/graph');
        const data = await res.json();
        setNodes(data.nodes || []);
        initialNodesRef.current = data.nodes || [];
        setEdges(data.edges || []);
      } catch (error) {
        console.error('Failed to fetch graph:', error);
      }
    }
    fetchGraph();
  }, [setNodes, setEdges]);

  // Handle Visibility and Explode Toggles
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        // Handle folder nodes
        if (n.id.startsWith('group-')) {
          const originalGroup = initialNodesRef.current.find(inNode => inNode.id === n.id);
          const baseWidth = (n.style?.width as number) || 800;
          return {
            ...n,
            style: { 
              ...n.style, 
              opacity: showFolders ? 1 : 0,
              width: isExploded ? baseWidth * 2.2 : baseWidth,
              height: isExploded ? 180 : 120,
            },
            position: {
              x: originalGroup?.position.x ?? n.position.x,
              y: isExploded 
                ? (originalGroup?.position.y || 0) * 1.5 
                : (originalGroup?.position.y ?? n.position.y)
            },
            className: showFolders ? n.className : 'opacity-0 pointer-events-none',
            selectable: showFolders,
            draggable: showFolders,
          };
        }
        // Handle component nodes
        const originalPos = initialNodesRef.current.find(inNode => inNode.id === n.id)?.position || n.position;
        return {
          ...n,
          position: {
            x: isExploded ? (originalPos.x - 20) * 2.2 + 20 : originalPos.x,
            y: originalPos.y,
          },
          data: {
            ...n.data,
            showPath: showPaths,
          }
        };
      })
    );

    // Auto-fit view ONLY when Explode state changes
    if (prevExplodedRef.current !== isExploded) {
      setTimeout(() => fitView({ duration: 800 }), 100);
      prevExplodedRef.current = isExploded;
    }
  }, [showFolders, showPaths, isExploded, setNodes, fitView]);

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

    // Highlight logic
    const relatedNodeIds = new Set<string>([selectedNode]);

    const findUpstream = (nodeId: string) => {
      edges.forEach((edge) => {
        if (edge.target === nodeId && !relatedNodeIds.has(edge.source)) {
          relatedNodeIds.add(edge.source);
          findUpstream(edge.source);
        }
      });
    };

    const findDownstream = (nodeId: string) => {
      edges.forEach((edge) => {
        if (edge.source === nodeId && !relatedNodeIds.has(edge.target)) {
          relatedNodeIds.add(edge.target);
          findDownstream(edge.target);
        }
      });
    };

    findUpstream(selectedNode);
    findDownstream(selectedNode);

    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isSelected: n.id === selectedNode,
          isRelated: relatedNodeIds.has(n.id),
          isAnySelected: true,
        },
      }))
    );

    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        animated: (relatedNodeIds.has(e.source) || relatedNodeIds.has(e.target)) && e.source !== selectedNode && e.target !== selectedNode,
        data: {
          ...e.data,
          highlight: relatedNodeIds.has(e.source) && relatedNodeIds.has(e.target),
        },
      }))
    );

    // Focus on the node
    const node = nodes.find((n) => n.id === selectedNode);
    if (node) {
      let absX = node.position.x;
      let absY = node.position.y;

      if (node.parentNode) {
        const parent = nodes.find(n => n.id === node.parentNode);
        if (parent) {
          absX += parent.position.x;
          absY += parent.position.y;
        }
      }

      // Offset the center to the right (+180) to push the node to the left
      // This ensures it's not covered by the right-hand dependency panel
      setCenter(absX + 90, absY + 100, { zoom: 1.5, duration: 800 });
    }
  }, [selectedNode, setNodes, setEdges, setCenter]);

  const onNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      onNodeSelect(node.id);
      onShowDependencies(true);
    },
    [onNodeSelect, onShowDependencies]
  );

  const handleResetSelection = () => {
    onNodeSelect('');
    onShowDependencies(false);
  };

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
      >
        <Background color="#888" variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>

      {/* Floating Toolbar */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-50">
        <TooltipProvider>
          <div className="flex flex-col gap-2 p-1.5 bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-xl">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-9 h-9 rounded-lg transition-all ${showFolders ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-accent'}`}
                  onClick={() => setShowFolders(!showFolders)}
                >
                  {showFolders ? <Folder className="w-4 h-4" /> : <FolderMinus className="w-4 h-4 opacity-50" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{showFolders ? 'Hide Folders' : 'Show Folders'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-9 h-9 rounded-lg transition-all ${showPaths ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-accent'}`}
                  onClick={() => setShowPaths(!showPaths)}
                >
                  {showPaths ? <FileText className="w-4 h-4" /> : <EyeOff className="w-4 h-4 opacity-50" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{showPaths ? 'Hide File Paths' : 'Show File Paths'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`w-9 h-9 rounded-lg transition-all ${isExploded ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'hover:bg-accent'}`}
                  onClick={() => setIsExploded(!isExploded)}
                >
                  <Zap className={`w-4 h-4 ${isExploded ? 'fill-current' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{isExploded ? 'Compress View' : 'Explode View'}</p>
              </TooltipContent>
            </Tooltip>

            <div className="h-px bg-border/50 mx-1 my-0.5" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9 rounded-lg hover:bg-accent"
                  onClick={() => fitView({ duration: 800 })}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Fit View</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {selectedNode && (
        <button
          onClick={handleResetSelection}
          className="absolute top-4 left-4 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors z-10"
        >
          Reset Selection
        </button>
      )}
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
