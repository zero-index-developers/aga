import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@client/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@client/components/ui/select';
import { Button } from '@client/components/ui/button';
import { Card } from '@client/components/ui/card';
import { Skeleton } from '@client/components/ui/skeleton';
import { Database, Search, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScanLog } from '@client/types';
import { formatDate } from '@client/lib/utils';
import { StatusBadge } from './status-badge';

interface ScanLogsTabProps {
  logs: ScanLog[];
  isLoading: boolean;
}

export function ScanLogsTab({ logs, isLoading }: ScanLogsTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalLogs = logs.length;
  const totalPages = Math.ceil(totalLogs / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalLogs);
  const currentLogs = logs.slice(startIndex, endIndex);

  return (
    <>
      <Card className="border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden p-0 shadow-xl shadow-black/5 rounded-2xl">
        <Table>
          <TableHeader className="bg-muted/30 border-b border-border/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Timestamp</TableHead>
              <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Repository</TableHead>
              <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Status</TableHead>
              <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 text-right">Nodes Found</TableHead>
              <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 text-right">Duration</TableHead>
              <TableHead className="px-6 py-4 w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                    <Database className="w-12 h-12 opacity-20" />
                    <p className="italic">No scan history found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-primary/[0.02] transition-all duration-300 group border-b border-border/40">
                  <TableCell className="px-6 py-5 font-mono text-[11px] text-muted-foreground/80">
                    {formatDate(log.timestamp)}
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <span className="font-semibold text-sm tracking-tight">{log.repoName}</span>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <StatusBadge status={log.status} />
                  </TableCell>
                  <TableCell className="px-6 py-5 text-right font-mono text-sm">
                    <div className="flex items-center justify-end gap-2 text-foreground/80">
                      <Search className="w-3.5 h-3.5 text-primary/50" />
                      <span className="font-bold">{log.nodesFound}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-right font-mono text-sm">
                    <div className="flex items-center justify-end gap-2 text-foreground/80">
                      <Clock className="w-3.5 h-3.5 text-primary/50" />
                      <span>{log.duration}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-right">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-all bg-primary/5 hover:bg-primary/10 text-primary">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {!isLoading && logs.length > 0 && (
        <div className="flex items-center justify-between px-2 text-sm text-muted-foreground mt-6">
          <div className="flex items-center gap-2">
            <span className="opacity-70">Rows per page</span>
            <Select
              value={rowsPerPage.toString()}
              onValueChange={(val) => {
                setRowsPerPage(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[70px] bg-background/50 border-border/50 focus:ring-0 focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-6">
            <div className="opacity-70">
              {startIndex + 1}-{endIndex} of {totalLogs}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-background/50 border-border/50 hover:bg-muted transition-colors"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-background/50 border-border/50 hover:bg-muted transition-colors"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
