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
import { Folder, FolderMinus, FileText, EyeOff, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [
  // Folder Groups (Parents)
  { id: 'group-api', data: { label: '/api' }, position: { x: 50, y: 50 }, className: 'bg-blue-500/5 border-blue-500/20 rounded-xl z-[-1] pointer-events-none', style: { width: 700, height: 100 } },
  { id: 'group-middleware', data: { label: '/middleware' }, position: { x: 300, y: -80 }, className: 'bg-amber-500/5 border-amber-500/20 rounded-xl z-[-1] pointer-events-none', style: { width: 190, height: 100 } },
  { id: 'group-controllers', data: { label: '/controllers' }, position: { x: 50, y: 180 }, className: 'bg-purple-500/5 border-purple-500/20 rounded-xl z-[-1] pointer-events-none', style: { width: 700, height: 100 } },
  { id: 'group-services', data: { label: '/services' }, position: { x: 50, y: 310 }, className: 'bg-green-500/5 border-green-500/20 rounded-xl z-[-1] pointer-events-none', style: { width: 700, height: 100 } },
  { id: 'group-db', data: { label: '/db' }, position: { x: 50, y: 440 }, className: 'bg-orange-500/5 border-orange-500/20 rounded-xl z-[-1] pointer-events-none', style: { width: 700, height: 100 } },
  { id: 'group-workers', data: { label: '/workers' }, position: { x: 50, y: 570 }, className: 'bg-rose-500/5 border-rose-500/20 rounded-xl z-[-1] pointer-events-none', style: { width: 700, height: 100 } },

  // API Routes
  { id: 'api-users', parentNode: 'group-api', data: { label: 'GET /api/users', type: 'route', path: 'api/users/route.ts', color: 'bg-blue-600' }, position: { x: 20, y: 40 }, type: 'custom', extent: 'parent' },
  { id: 'api-payments', parentNode: 'group-api', data: { label: 'POST /api/payments', type: 'route', path: 'api/payments/route.ts', color: 'bg-blue-600' }, position: { x: 250, y: 40 }, type: 'custom', extent: 'parent' },
  { id: 'api-inventory', parentNode: 'group-api', data: { label: 'GET /api/inventory', type: 'route', path: 'api/inventory/route.ts', color: 'bg-blue-600' }, position: { x: 480, y: 40 }, type: 'custom', extent: 'parent' },

  // Middleware
  { id: 'auth-middleware', parentNode: 'group-middleware', data: { label: 'AuthMiddleware', type: 'middleware', path: 'middleware.ts', color: 'bg-amber-600' }, position: { x: 20, y: 40 }, type: 'custom', extent: 'parent' },

  // Controllers
  { id: 'user-controller', parentNode: 'group-controllers', data: { label: 'UserController', type: 'controller', path: 'controllers/user.ts', color: 'bg-purple-600' }, position: { x: 20, y: 40 }, type: 'custom', extent: 'parent' },
  { id: 'payment-controller', parentNode: 'group-controllers', data: { label: 'PaymentController', type: 'controller', path: 'controllers/payment.ts', color: 'bg-purple-600' }, position: { x: 250, y: 40 }, type: 'custom', extent: 'parent' },
  { id: 'inventory-controller', parentNode: 'group-controllers', data: { label: 'InventoryController', type: 'controller', path: 'controllers/inv.ts', color: 'bg-purple-600' }, position: { x: 480, y: 40 }, type: 'custom', extent: 'parent' },

  // Services
  { id: 'user-service', parentNode: 'group-services', data: { label: 'UserService', type: 'service', path: 'services/user.service.ts', color: 'bg-green-600' }, position: { x: 20, y: 40 }, type: 'custom', extent: 'parent' },
  { id: 'auth-service', parentNode: 'group-services', data: { label: 'AuthService', type: 'service', path: 'services/auth.service.ts', color: 'bg-green-600' }, position: { x: 250, y: 40 }, type: 'custom', extent: 'parent' },
  { id: 'payment-service', parentNode: 'group-services', data: { label: 'PaymentService', type: 'service', path: 'services/payment.service.ts', color: 'bg-green-600' }, position: { x: 480, y: 40 }, type: 'custom', extent: 'parent' },

  // Database
  { id: 'db-users', parentNode: 'group-db', data: { label: 'Users Table', type: 'database', path: 'db/schema.ts', color: 'bg-orange-600' }, position: { x: 20, y: 40 }, type: 'custom', extent: 'parent' },
  { id: 'db-products', parentNode: 'group-db', data: { label: 'Products Table', type: 'database', path: 'db/schema.ts', color: 'bg-orange-600' }, position: { x: 250, y: 40 }, type: 'custom', extent: 'parent' },
  { id: 'db-transactions', parentNode: 'group-db', data: { label: 'Transactions Table', type: 'database', path: 'db/schema.ts', color: 'bg-orange-600' }, position: { x: 480, y: 40 }, type: 'custom', extent: 'parent' },

  // Workers
  { id: 'analytics-worker', parentNode: 'group-workers', data: { label: 'AnalyticsWorker', type: 'worker', path: 'workers/analytics.ts', color: 'bg-rose-600' }, position: { x: 250, y: 40 }, type: 'custom', extent: 'parent' },
];

const initialEdges: Edge[] = [
  // API to Middleware
  { id: 'api-users-to-auth', source: 'api-users', target: 'auth-middleware', animated: false },
  { id: 'api-payments-to-auth', source: 'api-payments', target: 'auth-middleware', animated: false },

  // Middleware to Controllers
  { id: 'auth-to-user-ctrl', source: 'auth-middleware', target: 'user-controller', animated: false },
  { id: 'auth-to-payment-ctrl', source: 'auth-middleware', target: 'payment-controller', animated: false },

  // Controllers to Services
  { id: 'user-ctrl-to-service', source: 'user-controller', target: 'user-service', animated: false },
  { id: 'payment-ctrl-to-service', source: 'payment-controller', target: 'payment-service', animated: false },
  { id: 'inv-ctrl-to-service', source: 'inventory-controller', target: 'payment-service', animated: false },

  // Services to Services (Dependencies)
  { id: 'payment-service-to-auth', source: 'payment-service', target: 'auth-service', animated: false },

  // Services to Database
  { id: 'user-service-to-db', source: 'user-service', target: 'db-users', animated: false },
  { id: 'auth-service-to-db', source: 'auth-service', target: 'db-users', animated: false },
  { id: 'payment-service-to-db-tx', source: 'payment-service', target: 'db-transactions', animated: false },
  { id: 'payment-service-to-db-users', source: 'payment-service', target: 'db-users', animated: false },

  // Database to Workers
  { id: 'db-tx-to-analytics', source: 'db-transactions', target: 'analytics-worker', animated: true },
];

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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showFolders, setShowFolders] = useState(true);
  const [showPaths, setShowPaths] = useState(true);
  const { setCenter, fitView } = useReactFlow();

  // Handle Visibility Toggles
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        // Handle folder nodes
        if (n.id.startsWith('group-')) {
          return {
            ...n,
            style: { ...n.style, opacity: showFolders ? 1 : 0 },
            className: showFolders ? n.className : 'opacity-0 pointer-events-none',
            selectable: showFolders,
            draggable: showFolders,
          };
        }
        // Handle component nodes (paths)
        return {
          ...n,
          data: {
            ...n.data,
            showPath: showPaths,
          }
        };
      })
    );
  }, [showFolders, showPaths, setNodes]);

  useEffect(() => {
    if (!selectedNode) {
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, isSelected: false, isRelated: false },
        }))
      );
      setEdges((eds) => eds.map((e) => ({ ...e, animated: false })));
      return;
    }

    // Highlight logic
    const relatedNodeIds = new Set<string>([selectedNode]);

    const findUpstream = (nodeId: string) => {
      initialEdges.forEach((edge) => {
        if (edge.target === nodeId && !relatedNodeIds.has(edge.source)) {
          relatedNodeIds.add(edge.source);
          findUpstream(edge.source);
        }
      });
    };

    const findDownstream = (nodeId: string) => {
      initialEdges.forEach((edge) => {
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
