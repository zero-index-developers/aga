'use client';

import { useState } from 'react';
import ArchitectureVisualization from '@/components/architecture-visualization';
import SearchPanel from '@/components/search-panel';
import DependencyPanel from '@/components/dependency-panel';
import Header from '@/components/header';

export default function Home() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDependencies, setShowDependencies] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-64 border-r border-border bg-sidebar flex flex-col">
          <SearchPanel onSearch={setSearchQuery} onNodeSelect={setSelectedNode} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <ArchitectureVisualization
            selectedNode={selectedNode}
            onNodeSelect={setSelectedNode}
            onShowDependencies={setShowDependencies}
          />
        </div>

        {/* Right Panel */}
        {selectedNode && showDependencies && (
          <div className="w-80 border-l border-border bg-card">
            <DependencyPanel nodeId={selectedNode} />
          </div>
        )}
      </div>
    </div>
  );
}
