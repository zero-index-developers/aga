'use client';

import { AIOraclePanel } from './architecture/ai-oracle-panel';
import { ExplorerPanel } from './architecture/explorer-panel';

interface SearchPanelProps {
  onSearch: (query: string) => void;
  onNodeSelect: (nodeId: string) => void;
  selectedNodeId?: string | null;
  nodes: any[];
  isLoading: boolean;
}

export default function SearchPanel({ onSearch, onNodeSelect, selectedNodeId, nodes, isLoading }: SearchPanelProps) {
  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto">
      <div className="space-y-6">
        <AIOraclePanel 
          nodes={nodes} 
          isLoading={isLoading} 
          onSearch={onSearch}
        />
        
        <ExplorerPanel 
          nodes={nodes} 
          isLoading={isLoading} 
          onNodeSelect={onNodeSelect} 
          selectedNodeId={selectedNodeId} 
        />
      </div>
    </div>
  );
}
