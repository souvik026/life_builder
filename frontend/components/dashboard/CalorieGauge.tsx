"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Flame } from "lucide-react";

interface CalorieGaugeProps {
  burnt: number;
  target: number;
}

export function CalorieGauge({ burnt, target }: CalorieGaugeProps) {
  const pct = Math.min((burnt / target) * 100, 100);
  const remaining = Math.max(target - burnt, 0);
  const color = pct >= 100 ? "#4a7c59" : "#3d8b63";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calories Burnt Today</CardTitle>
      </CardHeader>
      <div className="flex items-center gap-6">
        <div className="relative flex items-center justify-center">
          <svg width={100} height={100} className="-rotate-90">
            <circle cx={50} cy={50} r={42} stroke="#d0e0d5" strokeWidth={7} fill="none" />
            <circle
              cx={50}
              cy={50}
              r={42}
              stroke={color}
              strokeWidth={7}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 42}
              strokeDashoffset={2 * Math.PI * 42 * (1 - pct / 100)}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <Flame className="h-5 w-5" style={{ color }} />
            <span className="font-[family-name:var(--font-display)] text-lg font-bold text-bark">{burnt}</span>
          </div>
        </div>
        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-bark">
            {burnt} <span className="text-sm font-normal text-stone">/ {target} kcal</span>
          </p>
          {remaining > 0 ? (
            <p className="text-sm text-stone-light">{remaining} kcal to go</p>
          ) : (
            <p className="text-sm font-medium text-sage-dark">Target reached!</p>
          )}
        </div>
      </div>
    </Card>
  );
}
