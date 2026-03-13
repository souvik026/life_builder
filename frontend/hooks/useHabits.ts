"use client";

import { useCallback } from "react";
import { logHabit } from "@/lib/api";
import { useDashboard } from "./useDashboard";

export function useHabits() {
  const { refresh } = useDashboard();

  const toggleHabit = useCallback(
    async (habitId: string, completed: boolean) => {
      await logHabit(habitId, completed);
      await refresh();
    },
    [refresh]
  );

  return { toggleHabit };
}
