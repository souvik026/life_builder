"use client";

import useSWR from "swr";
import { getDashboardSummary } from "@/lib/api";
import type { DashboardSummary } from "@/lib/types";

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR<DashboardSummary>(
    "dashboard-summary",
    getDashboardSummary,
    { refreshInterval: 30000 }
  );

  return { data, error, isLoading, refresh: mutate };
}
