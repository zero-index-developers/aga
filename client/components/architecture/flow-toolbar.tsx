'use client';

import { Folder, FolderMinus, FileText, EyeOff, Maximize2, Zap, Plus, Minus } from 'lucide-react';
import { Button } from '@client/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@client/components/ui/tooltip";

interface FlowToolbarProps {
  showFolders: boolean;
  setShowFolders: (show: boolean) => void;
  showPaths: boolean;
  setShowPaths: (show: boolean) => void;
  isExploded: boolean;
  setIsExploded: (exploded: boolean) => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function FlowToolbar({
  showFolders,
  setShowFolders,
  showPaths,
  setShowPaths,
  isExploded,
  setIsExploded,
  onFitView,
  onZoomIn,
  onZoomOut,
}: FlowToolbarProps) {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <TooltipProvider delayDuration={0}>
        <div className="flex flex-row items-center gap-2 p-2 bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`w-9 h-9 rounded-lg transition-all ${showFolders ? 'bg-primary/10 text-primary' : 'text-foreground/60 hover:bg-accent hover:text-foreground'}`}
                onClick={() => setShowFolders(!showFolders)}
              >
                {showFolders ? <Folder className="w-4 h-4" /> : <FolderMinus className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-popover/95 backdrop-blur-sm border-border/50 text-popover-foreground font-medium">
              <p>{showFolders ? 'Hide Folder Groups' : 'Show Folder Groups'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`w-9 h-9 rounded-lg transition-all ${showPaths ? 'bg-primary/10 text-primary' : 'text-foreground/60 hover:bg-accent hover:text-foreground'}`}
                onClick={() => setShowPaths(!showPaths)}
              >
                {showPaths ? <FileText className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-popover/95 backdrop-blur-sm border-border/50 text-popover-foreground font-medium">
              <p>{showPaths ? 'Hide File Details' : 'Show File Details'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`w-9 h-9 rounded-lg transition-all ${isExploded ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-foreground/60 hover:bg-accent hover:text-foreground'}`}
                onClick={() => setIsExploded(!isExploded)}
              >
                <Zap className={`w-4 h-4 ${isExploded ? 'fill-current' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-popover/95 backdrop-blur-sm border-border/50 text-popover-foreground font-medium">
              <p>{isExploded ? 'Compress View' : 'Explode View'}</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border/50 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-9 h-9 rounded-lg transition-all text-foreground/60 hover:bg-accent hover:text-foreground"
                onClick={onFitView}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-popover/95 backdrop-blur-sm border-border/50 text-popover-foreground font-medium">
              <p>Fit View</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border/50 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-9 h-9 rounded-lg transition-all text-foreground/60 hover:bg-accent hover:text-foreground"
                onClick={onZoomIn}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-popover/95 backdrop-blur-sm border-border/50 text-popover-foreground font-medium">
              <p>Zoom In</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-9 h-9 rounded-lg transition-all text-foreground/60 hover:bg-accent hover:text-foreground"
                onClick={onZoomOut}
              >
                <Minus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-popover/95 backdrop-blur-sm border-border/50 text-popover-foreground font-medium">
              <p>Zoom Out</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
