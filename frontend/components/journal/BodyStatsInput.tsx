"use client";

import { Scale, Flame } from "lucide-react";

interface BodyStatsInputProps {
  weight: string;
  calories: string;
  onWeightChange: (val: string) => void;
  onCaloriesChange: (val: string) => void;
  readonly?: boolean;
}

export function BodyStatsInput({ weight, calories, onWeightChange, onCaloriesChange, readonly }: BodyStatsInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-bark-light mb-3">Body Stats</label>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-sand/60 bg-cream p-3">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-3.5 w-3.5 text-sage" />
            <span className="text-xs font-medium text-stone uppercase tracking-wide">Weight (kg)</span>
          </div>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => onWeightChange(e.target.value)}
            disabled={readonly}
            placeholder="e.g. 78.5"
            className="w-full rounded-lg border border-sand bg-warm-white px-3 py-1.5 text-sm text-bark focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage/20 disabled:opacity-60"
          />
        </div>
        <div className="rounded-xl border border-sand/60 bg-cream p-3">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-3.5 w-3.5 text-terracotta" />
            <span className="text-xs font-medium text-stone uppercase tracking-wide">Calories Burnt</span>
          </div>
          <input
            type="number"
            value={calories}
            onChange={(e) => onCaloriesChange(e.target.value)}
            disabled={readonly}
            placeholder="e.g. 350"
            className="w-full rounded-lg border border-sand bg-warm-white px-3 py-1.5 text-sm text-bark focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage/20 disabled:opacity-60"
          />
        </div>
      </div>
    </div>
  );
}
