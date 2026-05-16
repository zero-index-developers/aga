import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@client/components/ui/card";
import { Button } from "@client/components/ui/button";
import { FolderGit2, Clock, Github } from "lucide-react";
import { ConnectRepoDialog } from "@client/components/connect-repo-dialog";

interface WelcomeBannerProps {
  connectedRepo: string | null;
  onOpenRecent: () => void;
  onOpenSample: () => void;
  onConnectSuccess: (name: string) => void;
}

export function WelcomeBanner({ connectedRepo, onOpenRecent, onOpenSample, onConnectSuccess }: WelcomeBannerProps) {
  return (
    <div className="mx-auto w-full space-y-6">
      <div className="text-left space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome to AGA!</h1>
        <p className="text-muted-foreground text-lg">
          Connect repositories to visualize their architecture and analyze dependencies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="flex flex-col border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
          <CardHeader className="pb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <FolderGit2 className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Connect Your Repository</CardTitle>
            <CardDescription className="text-sm">
              Import from GitHub or GitLab to analyze your own codebase.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <ConnectRepoDialog onSuccess={onConnectSuccess} />
          </CardContent>
        </Card>

        <Card className="flex flex-col border-border/50 bg-card/30 hover:bg-card/50 transition-colors border-dashed">
          <CardHeader className="pb-4">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2">
              {connectedRepo ? <Clock className="w-5 h-5 text-primary" /> : <Github className="w-5 h-5 text-foreground" />}
            </div>
            <CardTitle className="text-lg">
              {connectedRepo ? 'Recent Repository' : 'Explore Sample'}
            </CardTitle>
            <CardDescription className="text-sm">
              {connectedRepo
                ? `Jump back into your last analyzed project: ${connectedRepo}`
                : 'Open facebook/react to see how the architecture graph works.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={connectedRepo ? onOpenRecent : onOpenSample}
            >
              {connectedRepo ? `Open ${connectedRepo}` : 'Open Sample Repo'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
