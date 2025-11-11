import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { Metrics } from '@/types/metrics';

interface MetricsHistoryContextType {
  history: Metrics[];
  addMetrics: (metrics: Metrics[]) => void;
  clearHistory: () => void;
}

const MetricsHistoryContext = createContext<MetricsHistoryContextType | undefined>(undefined);

const MAX_HISTORY_ITEMS = 500; // Maximum number of historical items to keep

interface MetricsHistoryProviderProps {
  children: ReactNode;
}

export function MetricsHistoryProvider({ children }: MetricsHistoryProviderProps) {
  const [history, setHistory] = useState<Metrics[]>([]);

  // Add new metrics to history
  const addMetrics = useCallback((newMetrics: Metrics[]) => {
    if (!newMetrics || newMetrics.length === 0) return;

    setHistory((prevHistory) => {
      // Create a Set of existing metric keys for fast lookup
      const existingKeys = new Set(prevHistory.map((m) => `${m.timestamp}-${m.id}`));

      // Filter out metrics that already exist in history
      const uniqueNewMetrics = newMetrics.filter(
        (m) => !existingKeys.has(`${m.timestamp}-${m.id}`)
      );

      // If no new metrics, return previous history unchanged
      if (uniqueNewMetrics.length === 0) return prevHistory;

      // Add all new metrics to history
      const updatedHistory = [...prevHistory, ...uniqueNewMetrics];

      // Sort by timestamp (oldest first)
      updatedHistory.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Keep only the most recent MAX_HISTORY_ITEMS
      return updatedHistory.slice(-MAX_HISTORY_ITEMS);
    });
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <MetricsHistoryContext.Provider value={{ history, addMetrics, clearHistory }}>
      {children}
    </MetricsHistoryContext.Provider>
  );
}

// Custom hook to use the metrics history context
export function useMetricsHistoryContext() {
  const context = useContext(MetricsHistoryContext);
  if (context === undefined) {
    throw new Error('useMetricsHistoryContext must be used within a MetricsHistoryProvider');
  }
  return context;
}
