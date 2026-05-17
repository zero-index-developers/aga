import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@client/components/ui/card";
import { FolderGit2 } from "lucide-react";
import { Repository } from "@client/lib/types";
import { RepositoryDeleteDialog } from "./repository-delete-dialog";
import { cn } from "@client/lib/utils";

interface RepositoryCardProps {
  repo: Repository;
  isActive?: boolean;
  onClick: () => void;
  onDelete?: (repoName: string) => void;
  showMetrics?: boolean;
}

export function RepositoryCard({ repo, isActive, onClick, onDelete, showMetrics = true }: RepositoryCardProps) {
  // Compute derived values once
  const components = repo.analytics?.nodes || 0;
  const dependencies = repo.analytics?.edges || 0;
  const health = repo.analytics?.health || 0;
  const isHealthy = health > 80;

  return (
    <Card
      className={cn(
        "transition-all hover:border-primary/50 group bg-card/20 shadow-sm hover:shadow-md p-0 gap-0 h-full flex flex-col",
        isActive ? "border-primary bg-primary/5" : "border-border/40"
      )}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between gap-3">
          <div
            className="flex items-center gap-3 truncate cursor-pointer flex-1"
            onClick={onClick}
          >
            <div className={cn(
              "p-2 rounded-md transition-colors",
              isActive ? "bg-primary/20" : "bg-muted group-hover:bg-primary/10"
            )}>
              <FolderGit2 className={cn(
                "w-5 h-5 shrink-0",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              )} />
            </div>
            <CardTitle className="text-base truncate">{repo.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isActive && (
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
            {onDelete && (
              <RepositoryDeleteDialog repoName={repo.name} onDelete={onDelete} />
            )}
          </div>
        </div>
        <CardDescription className="text-xs truncate text-muted-foreground/70 mt-1">
          {repo.url}
        </CardDescription>
      </CardHeader>
      
      <CardContent
        className="p-4 pt-0 flex-1 flex flex-col justify-between space-y-4 cursor-pointer"
        onClick={onClick}
      >
        <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          Architecture analysis for {repo.name}. Visualizing dependencies and component relationships.
        </div>
        
        {showMetrics && (
          <div className="flex items-center gap-4 pt-3 border-t border-border/40 mt-auto">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Components</span>
              <span className="text-sm font-bold">{components}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Dependencies</span>
              <span className="text-sm font-bold">{dependencies}</span>
            </div>
            <div className="ml-auto flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Health</span>
              <span className={cn(
                "text-sm font-bold",
                isHealthy ? "text-primary" : "text-orange-400"
              )}>
                {health}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Made with Bob
