"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Clock, Sparkles } from "lucide-react";
import type { TimedTask } from "@/lib/types";

interface TimedTaskListProps {
  tasks: TimedTask[];
}

export function TimedTaskList({ tasks }: TimedTaskListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>90-Day Timed Tasks</CardTitle>
      </CardHeader>
      <div className="space-y-5">
        {tasks.map((task) => {
          const pct = Math.min((task.minutes_today / task.target_minutes) * 100, 100);
          return (
            <div key={task.id} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-stone-light" />
                  <span className="text-sm font-medium text-bark">{task.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone">
                    {task.minutes_today}/{task.target_minutes} min
                  </span>
                  {task.streak_days > 0 && (
                    <Badge variant={task.streak_days >= 30 ? "success" : "default"}>
                      {task.streak_days}d
                    </Badge>
                  )}
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-sand/50">
                <div
                  className="h-2 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: pct >= 100 ? "#7c9a6e" : "#c4704b",
                  }}
                />
              </div>
              {task.prompt_add_task && (
                <div className="flex items-center gap-1.5 text-xs text-clay">
                  <Sparkles className="h-3 w-3" />
                  <span>30-day streak! Consider adding a new task.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
