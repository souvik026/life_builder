"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Check } from "lucide-react";
import type { HabitStatus } from "@/lib/types";

interface HabitGridProps {
  title: string;
  habits: HabitStatus[];
  onToggle?: (habitId: string, completed: boolean) => void;
}

export function HabitGrid({ title, habits, onToggle }: HabitGridProps) {
  const completedCount = habits.filter((h) => h.completed).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Badge variant={completedCount === habits.length ? "success" : "default"}>
          {completedCount}/{habits.length}
        </Badge>
      </CardHeader>
      <div className="space-y-2">
        {habits.map((habit, i) => (
          <div
            key={habit.id}
            className={`flex items-center justify-between rounded-xl border border-sand/40 px-4 py-3 transition-all duration-200 hover:border-sand hover:shadow-[0_1px_4px_rgba(61,46,30,0.06)] animate-fade-in-up delay-${i + 1}`}
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggle?.(habit.id, !habit.completed)}
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  habit.completed
                    ? "border-sage bg-sage text-warm-white scale-100"
                    : "border-sand text-sand hover:border-stone-light"
                }`}
              >
                <Check className={`h-3.5 w-3.5 transition-opacity duration-200 ${habit.completed ? "opacity-100" : "opacity-0"}`} />
              </button>
              <span className={`text-sm transition-colors duration-200 ${habit.completed ? "text-bark font-medium" : "text-stone"}`}>
                {habit.name}
              </span>
            </div>
            {habit.streak > 0 && (
              <Badge variant="success">{habit.streak}d</Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
