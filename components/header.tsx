import { Network } from 'lucide-react';
import { ConnectRepoDialog } from './connect-repo-dialog';

export default function Header({ onConnect }: { onConnect?: (repo: string) => void }) {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center px-8 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary rounded-lg">
          <Network className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-foreground">AGA</h1>
          <p className="text-xs text-muted-foreground">Architecture Governance Agent</p>
        </div>
      </div>
      <div className="flex-1"></div>
      <ConnectRepoDialog onSuccess={onConnect} />
    </header>
  );
}
