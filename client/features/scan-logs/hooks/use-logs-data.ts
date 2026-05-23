import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ScanLog, AIHistory } from '@client/types';

export function useLogsData() {
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [aiHistory, setAiHistory] = useState<AIHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAIIds, setSelectedAIIds] = useState<Set<string>>(new Set());

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
    toast.success("All logs cleared");
  };

  return {
    logs,
    aiHistory,
    isLoading,
    selectedAIIds,
    setSelectedAIIds,
    toggleAISelection,
    deleteAIEntries,
    clearAllLogs
  };
}
