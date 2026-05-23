import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@client/components/ui/accordion";
import { Checkbox } from "@client/components/ui/checkbox";
import { Button } from '@client/components/ui/button';
import { Card } from '@client/components/ui/card';
import { Skeleton } from '@client/components/ui/skeleton';
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
import { Bot, User, Trash } from 'lucide-react';
import { AIHistory } from '@client/types';
import { formatTime } from '@client/lib/utils';

interface AIHistoryTabProps {
  aiHistory: AIHistory[];
  isLoading: boolean;
  selectedAIIds: Set<string>;
  toggleAISelection: (id: string) => void;
  deleteAIEntries: (ids: string[]) => void;
}

export function AIHistoryTab({
  aiHistory,
  isLoading,
  selectedAIIds,
  toggleAISelection,
  deleteAIEntries
}: AIHistoryTabProps) {
  // Group AI history by repo
  const groupedAIHistory = aiHistory.reduce((acc, item) => {
    if (!acc[item.repoName]) acc[item.repoName] = [];
    acc[item.repoName].push(item);
    return acc;
  }, {} as Record<string, AIHistory[]>);

  return (
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
                    {items.length} {items.length === 1 ? 'session' : 'sessions'}
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
                                {formatTime(item.timestamp)}
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
                                {formatTime(item.timestamp)}
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
  );
}
