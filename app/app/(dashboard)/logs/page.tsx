"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import { DynamicBreadcrumbs } from '@/components/dynamic-breadcrumbs';
import { 
  History, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Database, 
  ArrowRight,
  Download,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface ScanLog {
  id: string;
  repoName: string;
  status: 'Success' | 'Warning' | 'Error';
  timestamp: string;
  duration: string;
  nodesFound: number;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/repo/logs');
        const data = await res.json();
        setLogs(data);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Header>
        <DynamicBreadcrumbs />
      </Header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto w-full space-y-8 pb-12">
          <div className="flex items-center justify-between border-b border-border/50 pb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <History className="w-8 h-8 text-primary" />
                Scan Logs
              </h1>
              <p className="text-muted-foreground mt-1">Audit history of architectural discovery operations.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2 border-border/50">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-red-500 hover:text-red-600 border-red-500/20 hover:bg-red-500/5">
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            </div>
          </div>

          <Card className="border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Repository</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Nodes Found</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
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
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                      No scan history found.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/30 transition-colors group">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString([], { 
                          month: 'short', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </TableCell>
                      <TableCell className="font-medium">{log.repoName}</TableCell>
                      <TableCell>
                        <StatusBadge status={log.status} />
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        <div className="flex items-center justify-end gap-1.5">
                          <Database className="w-3 h-3 opacity-50" />
                          {log.nodesFound}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        <div className="flex items-center justify-end gap-1.5">
                          <Clock className="w-3 h-3 opacity-50" />
                          {log.duration}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-4 h-4 text-primary" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ScanLog['status'] }) {
  const styles = {
    Success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    Warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Error: "bg-red-500/10 text-red-500 border-red-500/20"
  };

  const icons = {
    Success: <CheckCircle2 className="w-3 h-3 mr-1.5" />,
    Warning: <AlertCircle className="w-3 h-3 mr-1.5" />,
    Error: <AlertCircle className="w-3 h-3 mr-1.5" />
  };

  return (
    <Badge variant="outline" className={`${styles[status]} font-medium`}>
      {icons[status]}
      {status}
    </Badge>
  );
}
