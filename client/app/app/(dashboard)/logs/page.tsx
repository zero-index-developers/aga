"use client";

import Header from '@client/components/layout/header';
import { DynamicBreadcrumbs } from '@client/components/layout/dynamic-breadcrumbs';
import {
  History as HistoryIcon,
  Database,
  Download,
  Trash2,
  MessageSquare,
  Trash
} from 'lucide-react';
import { Button } from '@client/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@client/components/ui/tabs";
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
import { useState } from 'react';
import { useLogsData } from './hooks/use-logs-data';
import { ScanLogsTab } from './components/scan-logs-tab';
import { AIHistoryTab } from './components/ai-history-tab';

export default function LogsPage() {
  const {
    logs,
    aiHistory,
    isLoading,
    selectedAIIds,
    setSelectedAIIds,
    toggleAISelection,
    deleteAIEntries,
    clearAllLogs
  } = useLogsData();

  const [activeTab, setActiveTab] = useState("scans");

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Header>
        <DynamicBreadcrumbs />
      </Header>

      <div className="flex-1 overflow-y-auto p-8 relative">
        {/* Bulk Action Bar */}
        {selectedAIIds.size > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-primary/90 backdrop-blur-md text-primary-foreground px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
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
                Audit Logs
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
            <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8 bg-muted/30 p-1.5 border border-border/50 rounded-xl h-12">
              <TabsTrigger value="scans" className="h-full gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all rounded-lg">
                <Database className="w-4 h-4" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="ai" className="h-full gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all rounded-lg">
                <MessageSquare className="w-4 h-4" />
                AI Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scans" className="animate-in fade-in slide-in-from-bottom-2">
              <ScanLogsTab logs={logs} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="ai" className="animate-in fade-in slide-in-from-bottom-2">
              <AIHistoryTab 
                aiHistory={aiHistory}
                isLoading={isLoading}
                selectedAIIds={selectedAIIds}
                toggleAISelection={toggleAISelection}
                deleteAIEntries={deleteAIEntries}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
