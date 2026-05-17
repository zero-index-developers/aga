import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@client/components/ui/card";
import { FolderGit2 } from "lucide-react";
import { Repository } from "@client/hooks/use-repos";

interface RepositoryCardProps {
  repo: Repository;
  isActive?: boolean;
  onClick: () => void;
  showMetrics?: boolean;
}

export function RepositoryCard({ repo, isActive, onClick, showMetrics = true }: RepositoryCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:border-primary/50 group bg-card/20 shadow-sm hover:shadow-md p-0 gap-0 h-full flex flex-col ${isActive ? 'border-primary bg-primary/5' : 'border-border/40'}`}
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 truncate">
            <div className={`p-2 rounded-md transition-colors ${isActive ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/10'}`}>
               <FolderGit2 className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
            </div>
            <CardTitle className="text-base truncate">{repo.name}</CardTitle>
          </div>
          {isActive && (
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
          )}
        </div>
        <CardDescription className="text-xs truncate text-muted-foreground/70 mt-1">
          {repo.url}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-between space-y-4">
        <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          Architecture analysis for {repo.name}. Visualizing dependencies and component relationships.
        </div>
        
        {showMetrics && (
          <div className="flex items-center gap-4 pt-3 border-t border-border/40 mt-auto">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Components</span>
              <span className="text-sm font-bold">{repo.analytics?.nodes || 0}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Dependencies</span>
              <span className="text-sm font-bold">{repo.analytics?.edges || 0}</span>
            </div>
            <div className="ml-auto flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Health</span>
              <span className={`text-sm font-bold ${(repo.analytics?.health || 0) > 80 ? 'text-primary' : 'text-orange-400'}`}>
                {repo.analytics?.health || 0}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
