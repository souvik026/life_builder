"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import type { HabitStatus } from "@/lib/types";

interface StreakHeatmapProps {
  morningHabits: HabitStatus[];
  lifeHabits: HabitStatus[];
}

export function StreakHeatmap({ morningHabits, lifeHabits }: StreakHeatmapProps) {
  const allHabits = [...morningHabits, ...lifeHabits];

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(5, 10);
  });

  const getOpacity = (habitIdx: number, dayIdx: number): number => {
    const habit = allHabits[habitIdx];
    if (!habit) return 0;
    if (dayIdx === 6) return habit.completed ? 1 : 0.1;
    return habit.streak > (6 - dayIdx) ? 0.8 : 0.12;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Streak Heatmap (Last 7 Days)</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[11px] text-stone-light pb-3 pr-4 font-normal">Habit</th>
              {days.map((day) => (
                <th key={day} className="text-center text-[11px] text-stone-light pb-3 font-normal px-1">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allHabits.map((habit, hIdx) => (
              <tr key={habit.id}>
                <td className="text-xs text-stone py-1 pr-4 truncate max-w-[150px]">{habit.name}</td>
                {days.map((day, dIdx) => {
                  const opacity = getOpacity(hIdx, dIdx);
                  const isCompleted = opacity > 0.5;
                  return (
                    <td key={day} className="text-center py-1 px-1">
                      <div
                        className="mx-auto h-5 w-5 rounded-md transition-colors duration-300"
                        style={{
                          backgroundColor: isCompleted
                            ? `rgba(74, 124, 89, ${opacity})`
                            : `rgba(208, 224, 213, ${opacity + 0.3})`,
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
