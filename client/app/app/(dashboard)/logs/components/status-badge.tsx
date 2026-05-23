import { Badge } from '@client/components/ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@client/lib/utils';
import { ScanLog } from '@client/types';

export function StatusBadge({ status }: { status: ScanLog['status'] }) {
  const styles = {
    Success: "bg-emerald-500/5 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10",
    Warning: "bg-amber-500/5 text-amber-500 border-amber-500/20 hover:bg-amber-500/10",
    Error: "bg-red-500/5 text-red-500 border-red-500/20 hover:bg-red-500/10"
  };

  const icons = {
    Success: <CheckCircle2 className="w-3.5 h-3.5 mr-2" />,
    Warning: <AlertCircle className="w-3.5 h-3.5 mr-2" />,
    Error: <AlertCircle className="w-3.5 h-3.5 mr-2" />
  };

  return (
    <Badge variant="outline" className={cn(styles[status], "font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-sm transition-colors border shadow-sm")}>
      {icons[status]}
      {status}
    </Badge>
  );
}
