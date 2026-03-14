"use client";

import useSWR from "swr";
import { getGoals, createGoal, logGoalProgress } from "@/lib/api";
import type { GoalSummary, GoalCreate } from "@/lib/types";

export function useGoals(status?: string) {
  const { data, error, isLoading, mutate } = useSWR<GoalSummary[]>(
    ["goals", status],
    () => getGoals(status),
    { refreshInterval: 30_000 }
  );

  const addGoal = async (goal: GoalCreate) => {
    await createGoal(goal);
    mutate();
  };

  const logProgress = async (goalId: string, value: number, note?: string) => {
    await logGoalProgress(goalId, value, note);
    mutate();
  };

  return {
    goals: data || [],
    error,
    isLoading,
    refresh: mutate,
    addGoal,
    logProgress,
  };
}
