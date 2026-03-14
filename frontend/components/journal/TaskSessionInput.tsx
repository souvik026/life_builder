"use client";

import { Clock } from "lucide-react";

interface TaskItem {
  id: string;
  name: string;
  target_minutes: number;
}

interface TaskSessionInputProps {
  tasks: TaskItem[];
  values: Record<string, number>;
  onChange: (taskId: string, minutes: number) => void;
  readonly?: boolean;
}

export function TaskSessionInput({ tasks, values, onChange, readonly }: TaskSessionInputProps) {
  if (tasks.length === 0) return null;

  return (
    <div>
      <label className="block text-sm font-medium text-bark-light mb-3">Timed Task Sessions</label>
      <div className="space-y-2.5">
        {tasks.map((t) => {
          const mins = values[t.id] || 0;
          const pct = Math.min((mins / t.target_minutes) * 100, 100);
          return (
            <div key={t.id} className="rounded-xl border border-sand/60 bg-cream p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-sage" />
                  <span className="text-sm font-medium text-bark">{t.name}</span>
                </div>
                <span className="text-xs text-stone">Target: {t.target_minutes} min</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  value={mins || ""}
                  onChange={(e) => onChange(t.id, parseInt(e.target.value) || 0)}
                  disabled={readonly}
                  placeholder="0"
                  className="w-20 rounded-lg border border-sand bg-warm-white px-3 py-1.5 text-sm text-bark text-center focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage/20 disabled:opacity-60"
                />
                <span className="text-xs text-stone">min</span>
                <div className="flex-1 h-2 rounded-full bg-sand/40 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${pct >= 100 ? "bg-sage" : "bg-sage/50"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
