'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './custom-node';

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [
  // API Routes
  { id: 'api-users', data: { label: 'GET /api/users', type: 'route', color: 'bg-blue-500' }, position: { x: 0, y: 0 }, type: 'custom' },
  { id: 'api-payments', data: { label: 'POST /api/payments', type: 'route', color: 'bg-blue-500' }, position: { x: 300, y: 0 }, type: 'custom' },

  // Controllers
  { id: 'user-controller', data: { label: 'UserController', type: 'controller', color: 'bg-purple-500' }, position: { x: 0, y: 120 }, type: 'custom' },
  { id: 'payment-controller', data: { label: 'PaymentController', type: 'controller', color: 'bg-purple-500' }, position: { x: 300, y: 120 }, type: 'custom' },

  // Middleware
  { id: 'auth-middleware', data: { label: 'AuthMiddleware', type: 'middleware', color: 'bg-amber-500' }, position: { x: 150, y: -100 }, type: 'custom' },

  // Services
  { id: 'user-service', data: { label: 'UserService', type: 'service', color: 'bg-green-500' }, position: { x: 0, y: 250 }, type: 'custom' },
  { id: 'payment-service', data: { label: 'PaymentService', type: 'service', color: 'bg-green-500' }, position: { x: 300, y: 250 }, type: 'custom' },
  { id: 'auth-service', data: { label: 'AuthService', type: 'service', color: 'bg-green-500' }, position: { x: 150, y: 250 }, type: 'custom' },

  // Database
  { id: 'db-users', data: { label: 'Users Table', type: 'database', color: 'bg-orange-500' }, position: { x: 0, y: 400 }, type: 'custom' },
  { id: 'db-transactions', data: { label: 'Transactions Table', type: 'database', color: 'bg-orange-500' }, position: { x: 300, y: 400 }, type: 'custom' },
  { id: 'db-auth-logs', data: { label: 'Auth Logs Table', type: 'database', color: 'bg-orange-500' }, position: { x: 150, y: 400 }, type: 'custom' },
];

const initialEdges: Edge[] = [
  // API to Controllers
  { id: 'api-users-to-auth', source: 'api-users', target: 'auth-middleware', animated: false },
  { id: 'api-users-to-controller', source: 'api-users', target: 'user-controller', animated: false },
  { id: 'api-payments-to-auth', source: 'api-payments', target: 'auth-middleware', animated: false },
  { id: 'api-payments-to-controller', source: 'api-payments', target: 'payment-controller', animated: false },

  // Controllers to Services
  { id: 'user-controller-to-service', source: 'user-controller', target: 'user-service', animated: false },
  { id: 'user-controller-to-auth', source: 'user-controller', target: 'auth-service', animated: false },
  { id: 'payment-controller-to-service', source: 'payment-controller', target: 'payment-service', animated: false },
  { id: 'payment-controller-to-auth', source: 'payment-controller', target: 'auth-service', animated: false },

  // Middleware to Services
  { id: 'auth-middleware-to-service', source: 'auth-middleware', target: 'auth-service', animated: false },

  // Services to Database
  { id: 'user-service-to-db', source: 'user-service', target: 'db-users', animated: false },
  { id: 'payment-service-to-users', source: 'payment-service', target: 'db-users', animated: false },
  { id: 'payment-service-to-transactions', source: 'payment-service', target: 'db-transactions', animated: false },
  { id: 'auth-service-to-logs', source: 'auth-service', target: 'db-auth-logs', animated: false },
];

interface ArchitectureVisualizationProps {
  selectedNode: string | null;
  onNodeSelect: (nodeId: string) => void;
  onShowDependencies: (show: boolean) => void;
}

export default function ArchitectureVisualization({
  selectedNode,
  onNodeSelect,
  onShowDependencies,
}: ArchitectureVisualizationProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      onNodeSelect(node.id);
      onShowDependencies(true);

      // Highlight related nodes
      const relatedNodeIds = new Set<string>([node.id]);

      // Find upstream dependencies
      const findUpstream = (nodeId: string) => {
        edges.forEach((edge) => {
          if (edge.target === nodeId && !relatedNodeIds.has(edge.source)) {
            relatedNodeIds.add(edge.source);
            findUpstream(edge.source);
          }
        });
      };

      // Find downstream dependencies
      const findDownstream = (nodeId: string) => {
        edges.forEach((edge) => {
          if (edge.source === nodeId && !relatedNodeIds.has(edge.target)) {
            relatedNodeIds.add(edge.target);
            findDownstream(edge.target);
          }
        });
      };

      findUpstream(node.id);
      findDownstream(node.id);

      // Update node styles
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: {
            ...n.data,
            isSelected: n.id === node.id,
            isRelated: relatedNodeIds.has(n.id),
          },
        }))
      );

      // Update edge styles
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          animated: (relatedNodeIds.has(e.source) || relatedNodeIds.has(e.target)) && e.source !== node.id && e.target !== node.id,
          data: {
            ...e.data,
            highlight: relatedNodeIds.has(e.source) && relatedNodeIds.has(e.target),
          },
        }))
      );
    },
    [edges, setNodes, setEdges, onNodeSelect, onShowDependencies]
  );

  const handleResetSelection = () => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isSelected: false,
          isRelated: false,
        },
      }))
    );
    setEdges((eds) => eds.map((e) => ({ ...e, animated: false })));
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
      >
        <Background color="#ffffff" gap={16} size={1} style={{ opacity: 0.03 }} />
        <Controls />
      </ReactFlow>

      {selectedNode && (
        <button
          onClick={handleResetSelection}
          className="absolute top-4 right-4 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors z-10"
        >
          Reset Selection
        </button>
      )}

      {!selectedNode && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Architecture Overview</h2>
            <p className="text-muted-foreground">Click on any node to see the blast radius and dependencies</p>
          </div>
        </div>
      )}
    </div>
  );
}
