'use client';

import { motion } from 'framer-motion';
import { Network, Database, Code, Cpu } from 'lucide-react';
import { useEffect, useState } from 'react';

export function InteractiveDemo() {
  const [activeNode, setActiveNode] = useState<number | null>(null);

  const nodes = [
    { id: 1, icon: Network, label: 'API', x: 50, y: 20, color: 'from-blue-500 to-cyan-500' },
    { id: 2, icon: Database, label: 'DB', x: 20, y: 60, color: 'from-purple-500 to-pink-500' },
    { id: 3, icon: Code, label: 'UI', x: 80, y: 60, color: 'from-green-500 to-emerald-500' },
    { id: 4, icon: Cpu, label: 'Core', x: 50, y: 80, color: 'from-orange-500 to-red-500' },
  ];

  const connections = [
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 4 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode((prev) => {
        if (prev === null) return 1;
        return prev >= nodes.length ? 1 : prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [nodes.length]);

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      {/* Container with glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-3xl" />
      
      <div className="relative h-full rounded-2xl border border-primary/20 bg-background/50 backdrop-blur-xl p-8 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:2rem_2rem]" />
        
        {/* Connections */}
        <svg className="absolute inset-0 w-full h-full">
          {connections.map((conn, idx) => {
            const fromNode = nodes.find((n) => n.id === conn.from);
            const toNode = nodes.find((n) => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            const isActive = activeNode === conn.from || activeNode === conn.to;

            return (
              <motion.line
                key={idx}
                x1={`${fromNode.x}%`}
                y1={`${fromNode.y}%`}
                x2={`${toNode.x}%`}
                y2={`${toNode.y}%`}
                stroke="currentColor"
                strokeWidth="2"
                className={isActive ? 'text-primary' : 'text-muted-foreground/30'}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: idx * 0.2 }}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node, idx) => {
          const Icon = node.icon;
          const isActive = activeNode === node.id;

          return (
            <motion.div
              key={node.id}
              className="absolute"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              onHoverStart={() => setActiveNode(node.id)}
              onHoverEnd={() => setActiveNode(null)}
            >
              <motion.div
                className={`relative p-4 rounded-xl border-2 bg-background cursor-pointer ${
                  isActive ? 'border-primary shadow-lg shadow-primary/50' : 'border-border'
                }`}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  boxShadow: isActive
                    ? '0 0 30px rgba(99, 102, 241, 0.5)'
                    : '0 0 0px rgba(0, 0, 0, 0)',
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Glow effect */}
                {isActive && (
                  <motion.div
                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${node.color} opacity-20 blur-xl`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                <Icon
                  className={`w-6 h-6 relative z-10 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />

                {/* Label */}
                <motion.div
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono whitespace-nowrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isActive ? 1 : 0.5 }}
                >
                  {node.label}
                </motion.div>

                {/* Pulse ring */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-primary"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>
            </motion.div>
          );
        })}

        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/50 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Status indicator */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-muted-foreground">
          <motion.div
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="font-mono">Live Demo</span>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
