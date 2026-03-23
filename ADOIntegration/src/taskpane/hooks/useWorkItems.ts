import { useState, useCallback } from "react";
import type { WorkItem } from "../types/workItem";

interface UseWorkItemsReturn {
  workItems: WorkItem[];
  addWorkItem: (item: WorkItem) => boolean;
  removeWorkItem: (id: number) => void;
  clearWorkItems: () => void;
}

export function useWorkItems(): UseWorkItemsReturn {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);

  const addWorkItem = useCallback((item: WorkItem): boolean => {
    let added = false;
    setWorkItems((prev) => {
      if (prev.some((wi) => wi.id === item.id)) {
        return prev;
      }
      added = true;
      return [...prev, item];
    });
    return added;
  }, []);

  const removeWorkItem = useCallback((id: number) => {
    setWorkItems((prev) => prev.filter((wi) => wi.id !== id));
  }, []);

  const clearWorkItems = useCallback(() => {
    setWorkItems([]);
  }, []);

  return { workItems, addWorkItem, removeWorkItem, clearWorkItems };
}
