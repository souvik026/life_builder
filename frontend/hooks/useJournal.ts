"use client";

import useSWR from "swr";
import { getJournalList, getJournalById, getJournalByDate, getTimedTasks } from "@/lib/api";
import type { JournalListItem, JournalEntry, TimedTask } from "@/lib/types";
import { useState, useCallback } from "react";

export function useJournal() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: entries, mutate: refreshEntries } = useSWR<JournalListItem[]>(
    "journal-list",
    getJournalList,
  );

  // Fetch entry by ID (works for both journals and notes)
  const { data: selectedEntry } = useSWR<JournalEntry | null>(
    selectedId ? `journal-entry-${selectedId}` : null,
    () => (selectedId ? getJournalById(selectedId) : null),
  );

  const { data: timedTasks } = useSWR<TimedTask[]>(
    "timed-tasks",
    getTimedTasks,
  );

  const selectEntry = useCallback((id: string, date: string) => {
    setSelectedId(id);
    setSelectedDate(date);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    setSelectedDate(null);
  }, []);

  return {
    entries: entries || [],
    selectedDate,
    selectedEntry: selectedEntry || null,
    timedTasks: timedTasks || [],
    selectEntry,
    clearSelection,
    refreshEntries,
  };
}
