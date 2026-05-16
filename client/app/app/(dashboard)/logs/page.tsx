"use client";

import { useState, useEffect } from 'react';
import Header from '@client/components/header';
import { DynamicBreadcrumbs } from '@client/components/dynamic-breadcrumbs';
import {
  History as HistoryIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  ArrowRight,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Bot,
  User,
  Search,
  Trash
} from 'lucide-react';
import { Button } from '@client/components/ui/button';
import { Card } from '@client/components/ui/card';
import { Badge } from '@client/components/ui/badge';
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
import { Skeleton } from '@client/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@client/components/ui/tabs";
import { cn } from "@client/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@client/components/ui/accordion";
import { Checkbox } from "@client/components/ui/checkbox";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@client/components/ui/alert-dialog";

interface ScanLog {
  id: string;
  repoName: string;
  status: 'Success' | 'Warning' | 'Error';
  timestamp: string;
  duration: string;
  nodesFound: number;
}

interface AIHistory {
  id: string;
  repoName: string;
  timestamp: string;
  prompt: string;
  response: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [aiHistory, setAiHistory] = useState<AIHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("scans");

  // Selection state
  const [selectedAIIds, setSelectedAIIds] = useState<Set<string>>(new Set());

  // Pagination state for logs
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [logsRes, aiRes] = await Promise.all([
        fetch('/api/repo/logs'),
        fetch('/api/repo/ai-history')
      ]);
      const logsData = await logsRes.json();
      const aiData = await aiRes.json();
      setLogs(logsData);
      setAiHistory(aiData);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Group AI history by repo
  const groupedAIHistory = aiHistory.reduce((acc, item) => {
    if (!acc[item.repoName]) acc[item.repoName] = [];
    acc[item.repoName].push(item);
    return acc;
  }, {} as Record<string, AIHistory[]>);

  // Pagination logic for logs
  const totalLogs = logs.length;
  const totalPages = Math.ceil(totalLogs / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalLogs);
  const currentLogs = logs.slice(startIndex, endIndex);

  const toggleAISelection = (id: string) => {
    const newSelected = new Set(selectedAIIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAIIds(newSelected);
  };

  const deleteAIEntries = async (ids: string[]) => {
    try {
      const res = await fetch('/api/repo/ai-history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      
      if (res.ok) {
        setAiHistory(prev => prev.filter(item => !ids.includes(item.id)));
        setSelectedAIIds(new Set());
        toast.success(`Successfully deleted ${ids.length} entry/entries`);
      }
    } catch (error) {
      toast.error('Failed to delete entries');
    }
  };

  const clearAllLogs = () => {
    // Mock clear for now
    setLogs([]);
    toast.success("All scan logs cleared");
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Header>
        <DynamicBreadcrumbs />
      </Header>

      <div className="flex-1 overflow-y-auto p-8 relative">
        {/* Bulk Action Bar */}
        {selectedAIIds.size > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <span className="text-sm font-bold">{selectedAIIds.size} selected</span>
            <div className="w-[1px] h-4 bg-primary-foreground/20" />
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground hover:bg-primary-foreground/10 h-8 gap-2"
                onClick={() => setSelectedAIIds(new Set())}
              >
                Cancel
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-8 gap-2 bg-red-600 hover:bg-red-700"
                  >
                    <Trash className="w-3.5 h-3.5" />
                    Delete Selected
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {selectedAIIds.size} analysis sessions. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => deleteAIEntries(Array.from(selectedAIIds))}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto w-full space-y-8 pb-24">
          <div className="flex items-center justify-between border-b border-border/50 pb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/50">
                <HistoryIcon className="w-8 h-8 text-primary" />
                History & Logs
              </h1>
              <p className="text-muted-foreground mt-1">Audit history of architectural operations and AI analysis.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2 border-border/50 bg-background/50 backdrop-blur-sm">
                <Download className="w-4 h-4" />
                Export
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 text-red-500 hover:text-red-600 border-red-500/20 hover:bg-red-500/5 bg-background/50 backdrop-blur-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all logs?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all scan history records. This action is destructive and cannot be reversed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={clearAllLogs}
                    >
                      Clear Logs
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8 bg-muted/30 p-1 border border-border/50 rounded-xl">
              <TabsTrigger value="scans" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all rounded-lg">
                <Database className="w-4 h-4" />
                Scan History
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all rounded-lg">
                <MessageSquare className="w-4 h-4" />
                AI Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scans" className="animate-in fade-in slide-in-from-bottom-2">
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
                            {new Date(log.timestamp).toLocaleString([], {
                              month: 'short',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
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

              {/* Pagination Controls */}
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
            </TabsContent>

            <TabsContent value="ai" className="animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                  ))
                ) : Object.keys(groupedAIHistory).length === 0 ? (
                  <Card className="border-dashed border-border p-12 text-center bg-transparent">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                      <Bot className="w-12 h-12 opacity-20" />
                      <p className="italic font-medium">No AI analysis history found.</p>
                      <p className="text-xs max-w-xs mx-auto">Ask Bob about your architecture in any repository view to see the results here.</p>
                    </div>
                  </Card>
                ) : (
                  <Accordion type="multiple" defaultValue={Object.keys(groupedAIHistory)} className="space-y-4 border-none">
                    {Object.entries(groupedAIHistory).map(([repoName, items]) => (
                      <AccordionItem key={repoName} value={repoName} className="border border-border/50 bg-card/20 backdrop-blur-sm rounded-2xl overflow-hidden px-4">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center gap-3">
                            <h2 className="text-sm font-bold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1 rounded-lg">
                              {repoName}
                            </h2>
                            <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                              {items.length} sessions
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-6">
                          <div className="space-y-8 pl-4 border-l-2 border-primary/10">
                            {items.map((item) => (
                              <div key={item.id} className="relative group/session">
                                {/* Selection Checkbox */}
                                <div className="absolute -left-[30px] top-2">
                                  <Checkbox 
                                    checked={selectedAIIds.has(item.id)}
                                    onCheckedChange={() => toggleAISelection(item.id)}
                                    className="border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                  />
                                </div>

                                {/* Individual Delete Action */}
                                <div className="absolute top-0 right-0 opacity-0 group-hover/session:opacity-100 transition-opacity">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                      >
                                        <Trash className="w-3.5 h-3.5" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this session?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will permanently remove this AI analysis session from your history.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                          className="bg-red-600 hover:bg-red-700"
                                          onClick={() => deleteAIEntries([item.id])}
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>

                                <div className="space-y-4 max-w-4xl">
                                  {/* User Prompt */}
                                  <div className="flex items-start gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border/50 group-hover:border-primary/50 transition-colors">
                                      <User className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1 flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">User</span>
                                        <span className="text-[10px] text-muted-foreground/50 font-mono">
                                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <div className="bg-background/50 border border-border/50 rounded-2xl rounded-tl-none p-4 text-sm leading-relaxed shadow-sm">
                                        {item.prompt}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Bob's Response */}
                                  <div className="flex items-start gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:border-primary/50 transition-colors">
                                      <Bot className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="space-y-1 flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-tight text-primary">Bob (AI Oracle)</span>
                                        <span className="text-[10px] text-muted-foreground/50 font-mono">
                                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <div className="bg-primary/5 border border-primary/20 rounded-2xl rounded-tl-none p-4 text-sm leading-relaxed italic text-foreground/90 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-3xl -mr-8 -mt-8" />
                                        "{item.response}"
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ScanLog['status'] }) {
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
