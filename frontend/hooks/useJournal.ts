"use client";

import useSWR from "swr";
import { getJournalList, getJournalByDate, getTimedTasks } from "@/lib/api";
import type { JournalListItem, JournalEntry, TimedTask } from "@/lib/types";
import { useState, useCallback } from "react";

export function useJournal() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: entries, mutate: refreshEntries } = useSWR<JournalListItem[]>(
    "journal-list",
    getJournalList,
  );

  const { data: selectedEntry } = useSWR<JournalEntry | null>(
    selectedDate ? `journal-${selectedDate}` : null,
    () => (selectedDate ? getJournalByDate(selectedDate) : null),
  );

  const { data: timedTasks } = useSWR<TimedTask[]>(
    "timed-tasks",
    getTimedTasks,
  );

  const selectDate = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedDate(null);
  }, []);

  return {
    entries: entries || [],
    selectedDate,
    selectedEntry: selectedEntry || null,
    timedTasks: timedTasks || [],
    selectDate,
    clearSelection,
    refreshEntries,
  };
}
