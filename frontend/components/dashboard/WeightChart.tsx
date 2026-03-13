"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { WeightEntry } from "@/lib/types";

interface WeightChartProps {
  history: WeightEntry[];
  targetWeight: number;
}

export function WeightChart({ history, targetWeight }: WeightChartProps) {
  const data = history.map((entry) => ({
    date: entry.date.slice(5),
    weight: entry.weight_kg,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight Progress</CardTitle>
      </CardHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d4" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8a7e72" }} stroke="#e8e0d4" />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 11, fill: "#8a7e72" }}
              stroke="#e8e0d4"
              tickFormatter={(v: number) => `${v}kg`}
            />
            <Tooltip
              formatter={(value) => [`${value} kg`, "Weight"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e8e0d4",
                background: "#fffcf7",
                fontFamily: "Outfit, sans-serif",
                fontSize: 13,
              }}
            />
            <ReferenceLine
              y={targetWeight}
              stroke="#7c9a6e"
              strokeDasharray="5 5"
              label={{ value: `Goal: ${targetWeight}kg`, position: "right", fontSize: 11, fill: "#7c9a6e" }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#c4704b"
              strokeWidth={2.5}
              dot={{ fill: "#c4704b", r: 4, strokeWidth: 2, stroke: "#fffcf7" }}
              activeDot={{ r: 6, fill: "#c4704b", stroke: "#fffcf7", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
