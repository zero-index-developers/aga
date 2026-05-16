'use client';

import { Skeleton } from '@client/components/ui/skeleton';

interface ExplorerPanelProps {
  nodes: any[];
  isLoading: boolean;
  onNodeSelect: (nodeId: string) => void;
  selectedNodeId?: string | null;
}

export function ExplorerPanel({ nodes, isLoading, onNodeSelect, selectedNodeId }: ExplorerPanelProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
        Components
      </label>
      <div className="space-y-1.5">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))
        ) : (
          <>
            {nodes.filter(n => n.type === 'custom').map((node) => (
              <button
                key={node.id}
                onClick={() => onNodeSelect(node.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-all text-sm font-medium border border-transparent ${
                  selectedNodeId === node.id
                    ? 'bg-primary/10 text-primary border-primary/20 shadow-sm'
                    : 'hover:bg-secondary/50 text-foreground/80 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      node.data.type === 'component'
                        ? 'bg-blue-500'
                        : node.data.type === 'page'
                          ? 'bg-purple-500'
                          : node.data.type === 'api'
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                    }`}
                  ></div>
                  <span className="flex-1 truncate">{node.data.label}</span>
                </div>
              </button>
            ))}
            {nodes.filter(n => n.type === 'custom').length === 0 && (
              <div className="text-[11px] text-muted-foreground italic text-center py-4">
                No components detected in this view.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
