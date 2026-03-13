"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { useHabits } from "@/hooks/useHabits";
import { StatCard } from "@/components/dashboard/StatCard";
import { WeightChart } from "@/components/dashboard/WeightChart";
import { CalorieGauge } from "@/components/dashboard/CalorieGauge";
import { HabitGrid } from "@/components/dashboard/HabitGrid";
import { TimedTaskList } from "@/components/dashboard/TimedTaskList";
import { StreakHeatmap } from "@/components/dashboard/StreakHeatmap";
import { Calendar, Target, Flame, TrendingUp, Leaf } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const { toggleHabit } = useHabits();

  if (isLoading || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <Leaf className="h-8 w-8 text-sage animate-pulse" />
          <span className="text-sm text-stone">Loading your day...</span>
        </div>
      </div>
    );
  }

  const totalHabits = data.morning_habits.length + data.life_habits.length;
  const completedHabits =
    data.morning_habits.filter((h) => h.completed).length +
    data.life_habits.filter((h) => h.completed).length;

  const bestStreak = Math.max(
    ...data.morning_habits.map((h) => h.streak),
    ...data.life_habits.map((h) => h.streak),
    0
  );

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-bark">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}
          </h1>
          <p className="mt-2 text-sm text-stone">
            Day <span className="font-[family-name:var(--font-display)] font-semibold text-bark">{data.day_number}</span> of 90 &middot; {data.today}
          </p>
        </div>

        {/* Stat cards row */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Day", value: `${data.day_number}/90`, subtitle: `${90 - data.day_number} days remaining`, icon: Calendar },
            { title: "Today's Habits", value: `${completedHabits}/${totalHabits}`, subtitle: `${Math.round((completedHabits / totalHabits) * 100)}% done`, icon: Target },
            { title: "Calories Burnt", value: data.body.calories_burnt_today, subtitle: `Target: ${data.body.target_calories} kcal`, icon: Flame },
            { title: "Best Streak", value: `${bestStreak}d`, subtitle: "Current longest", icon: TrendingUp },
          ].map((card, i) => (
            <div key={card.title} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <StatCard {...card} />
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column: Habits */}
          <div className="space-y-6 lg:col-span-2">
            <div className="animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
              <HabitGrid
                title="Morning Routine"
                habits={data.morning_habits}
                onToggle={toggleHabit}
              />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
              <HabitGrid
                title="Life Habits"
                habits={data.life_habits}
                onToggle={toggleHabit}
              />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "0.55s" }}>
              <StreakHeatmap
                morningHabits={data.morning_habits}
                lifeHabits={data.life_habits}
              />
            </div>
          </div>

          {/* Right column: Body + Tasks */}
          <div className="space-y-6">
            <div className="animate-slide-in-right" style={{ animationDelay: "0.4s" }}>
              <CalorieGauge
                burnt={data.body.calories_burnt_today}
                target={data.body.target_calories}
              />
            </div>
            <div className="animate-slide-in-right" style={{ animationDelay: "0.5s" }}>
              <WeightChart
                history={data.body.weight_history}
                targetWeight={data.body.target_weight_kg}
              />
            </div>
            <div className="animate-slide-in-right" style={{ animationDelay: "0.6s" }}>
              <TimedTaskList tasks={data.timed_tasks} />
            </div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-10 animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
          <div className="rounded-2xl bg-warm-white border border-sand/60 p-6 shadow-[0_1px_3px_rgba(61,46,30,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-bark-light tracking-widest uppercase">
                Overall 90-Day Progress
              </span>
              <span className="font-[family-name:var(--font-display)] text-lg font-bold text-bark">
                {data.overall_completion_pct}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-sand/40">
              <div
                className="h-3 rounded-full bg-sage transition-all duration-1000 ease-out"
                style={{ width: `${data.overall_completion_pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
