'use client';

import { Skeleton } from '@client/components/ui/skeleton';
import { Folder, Minimize2, Maximize2, ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@client/components/ui/collapsible';
import { Badge } from '@client/components/ui/badge';

interface ExplorerPanelProps {
  nodes: any[];
  isLoading: boolean;
  onNodeSelect: (nodeId: string) => void;
  selectedNodeId?: string | null;
}

export function ExplorerPanel({ nodes, isLoading, onNodeSelect, selectedNodeId }: ExplorerPanelProps) {
  // Group nodes by their parent groups
  const groups = nodes.filter(n => n.type === 'group');
  const groupChildren = groups.map(group => {
    const children = nodes.filter(n => n.parentNode === group.id && n.type === 'custom');
    return { group, children };
  }).filter(g => g.children.length > 0);

  // Components without a recognized group parent
  const ungroupedNodes = nodes.filter(n =>
    n.type === 'custom' &&
    (!n.parentNode || !groups.find(g => g.id === n.parentNode))
  );

  const renderNodeButton = (node: any, indent: boolean = false) => (
    <button
      key={node.id}
      onClick={() => {
        onNodeSelect(node.id);
        window.dispatchEvent(new CustomEvent('focus-node', { detail: { nodeId: node.id } }));
      }}
      className={`w-full text-left py-1.5 rounded-md transition-all text-xs font-medium border border-transparent ${indent ? 'pl-8 pr-3' : 'px-3'
        } ${selectedNodeId === node.id
          ? 'bg-primary/10 text-primary border-primary/20 shadow-sm'
          : 'hover:bg-secondary/50 text-foreground/80 hover:text-foreground'
        }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-1.5 h-1.5 rounded-full ${node.data.type === 'component'
            ? 'bg-blue-500/80'
            : node.data.type === 'page'
              ? 'bg-purple-500/80'
              : node.data.type === 'api'
                ? 'bg-emerald-500/80'
                : 'bg-amber-500/80'
            }`}
        ></div>
        <span className="flex-1 truncate">{node.data.label}</span>
      </div>
    </button>
  );

  // Calculate bulk toggle state
  const collapsableGroups = groupChildren.filter(g => g.children.length > 2);
  const collapsedCount = collapsableGroups.filter(g => g.group.data?.isCollapsed).length;
  const isMajorityCollapsed = collapsedCount > collapsableGroups.length / 2;

  const handleBulkToggle = () => {
    const shouldCollapse = !isMajorityCollapsed;
    
    collapsableGroups.forEach(({ group }) => {
      if (!!group.data?.isCollapsed !== shouldCollapse) {
        window.dispatchEvent(new CustomEvent('toggle-folder-collapse', { 
          detail: { groupId: group.id, isCollapsed: shouldCollapse } 
        }));
      }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-1">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] opacity-60">
          Components
        </label>
        {collapsableGroups.length > 0 && (
          <button 
            onClick={handleBulkToggle}
            className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors opacity-80 hover:opacity-100"
            title={isMajorityCollapsed ? "Maximize all folders in graph" : "Minimize all folders in graph"}
          >
            {isMajorityCollapsed ? (
              <>
                <Maximize2 className="w-3 h-3" />
                <span>Expand All</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3 h-3" />
                <span>Collapse All</span>
              </>
            )}
          </button>
        )}
      </div>
      <div className="space-y-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-border">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))
        ) : (
          <>
            {/* Render Groups */}
            {groupChildren.map(({ group, children }) => {
              const hasMoreThanTwo = children.length > 2;

              if (hasMoreThanTwo) {
                const isSelected = children.some(c => c.id === selectedNodeId);
                return (
                  <Collapsible 
                    key={group.id} 
                    className="group/collapsible" 
                    defaultOpen={isSelected}
                  >
                    <div className={`w-full flex items-center group/row rounded-md transition-all border border-transparent ${
                        selectedNodeId === group.id
                          ? 'bg-primary/10 text-primary border-primary/20 shadow-sm'
                          : 'hover:bg-secondary/50'
                      }`}>
                      
                      {/* Chevron to expand/collapse sidebar list */}
                      <CollapsibleTrigger asChild>
                        <button className="py-1.5 pl-2 pr-1 hover:bg-secondary/80 rounded-l-md text-foreground/70 hover:text-foreground transition-colors h-full flex items-center">
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </button>
                      </CollapsibleTrigger>
                      
                      {/* Folder label (focuses node) */}
                      <button
                        onClick={() => {
                          onNodeSelect(group.id);
                          window.dispatchEvent(new CustomEvent('focus-node', { detail: { nodeId: group.id } }));
                        }}
                        className={`flex-1 flex items-center gap-2 py-1.5 px-1 text-xs font-semibold text-left transition-colors ${
                          selectedNodeId === group.id
                            ? 'text-primary'
                            : 'text-foreground/70 hover:text-foreground'
                        }`}
                      >
                        <Folder className="w-3.5 h-3.5 text-muted-foreground/60" />
                        <span className="flex-1 truncate">{group.data.label}</span>
                        <Badge variant="secondary" className="px-1 py-0 h-3.5 text-[9px] min-w-[1.1rem] flex justify-center bg-muted/40 text-muted-foreground font-normal border-transparent">
                          {children.length}
                        </Badge>
                      </button>

                      {/* Graph Minimize Button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.dispatchEvent(new CustomEvent('toggle-folder-collapse', { 
                            detail: { groupId: group.id, isCollapsed: !group.data?.isCollapsed } 
                          }));
                        }}
                        title={group.data?.isCollapsed ? "Restore in graph" : "Minimize in graph"}
                        className="py-1.5 px-2 hover:bg-secondary/80 rounded-r-md text-foreground/70 hover:text-foreground transition-colors h-full flex items-center border-l border-border/10"
                      >
                        {group.data?.isCollapsed ? (
                           <Maximize2 className="w-3 h-3 text-primary/80" />
                        ) : (
                           <Minimize2 className="w-3 h-3 text-muted-foreground/60" />
                        )}
                      </button>

                    </div>
                    <CollapsibleContent className="space-y-0.5 mt-0.5">
                      {children.map(child => renderNodeButton(child, true))}
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              // Less than or equal to 2, render them inline
              return (
                <div key={group.id} className="space-y-0.5">
                  {children.map(child => renderNodeButton(child, false))}
                </div>
              );
            })}

            {/* Render Ungrouped */}
            {ungroupedNodes.map(node => renderNodeButton(node, false))}

            {groupChildren.length === 0 && ungroupedNodes.length === 0 && (
              <div className="text-[11px] text-muted-foreground italic text-center py-6 opacity-50">
                No components detected.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
