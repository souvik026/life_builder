"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useGoals } from "@/hooks/useGoals";
import { Target, ArrowRight } from "lucide-react";

export function GoalSection() {
  const { goals, isLoading } = useGoals("active");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Goals</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-center py-8">
          <Target className="h-5 w-5 text-stone-light animate-pulse" />
        </div>
      </Card>
    );
  }

  const topGoals = goals.slice(0, 4);

  if (topGoals.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Goals</CardTitle>
          <Link
            href="/goals"
            className="text-xs font-medium text-sage hover:text-sage-dark transition-colors"
          >
            Set goals &rarr;
          </Link>
        </CardHeader>
        <p className="text-sm text-stone">No active goals yet.</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Goals</CardTitle>
        <Link
          href="/goals"
          className="flex items-center gap-1 text-xs font-medium text-sage hover:text-sage-dark transition-colors"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <div className="space-y-4">
        {topGoals.map((goal) => (
          <div key={goal.id} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate text-sm font-medium text-bark">{goal.title}</span>
                <Badge variant="default">{goal.category}</Badge>
              </div>
              <span className="shrink-0 font-[family-name:var(--font-display)] text-sm font-semibold text-bark">
                {Math.round(goal.progress_pct)}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-sand/50">
              <div
                className="h-1.5 rounded-full bg-sage transition-all duration-700 ease-out"
                style={{ width: `${goal.progress_pct}%` }}
              />
            </div>
            {goal.target_value !== null && (
              <div className="flex items-center justify-between text-[11px] text-stone-light">
                <span>
                  {goal.current_value} / {goal.target_value} {goal.unit}
                </span>
                {goal.days_remaining !== null && <span>{goal.days_remaining}d left</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
