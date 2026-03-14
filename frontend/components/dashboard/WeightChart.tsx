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
            <CartesianGrid strokeDasharray="3 3" stroke="#d0e0d5" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b8a76" }} stroke="#d0e0d5" />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 11, fill: "#6b8a76" }}
              stroke="#d0e0d5"
              tickFormatter={(v: number) => `${v}kg`}
            />
            <Tooltip
              formatter={(value) => [`${value} kg`, "Weight"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #d0e0d5",
                background: "#f7fcf9",
                fontFamily: "Outfit, sans-serif",
                fontSize: 13,
              }}
            />
            <ReferenceLine
              y={targetWeight}
              stroke="#4a7c59"
              strokeDasharray="5 5"
              label={{ value: `Goal: ${targetWeight}kg`, position: "right", fontSize: 11, fill: "#4a7c59" }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#3d8b63"
              strokeWidth={2.5}
              dot={{ fill: "#3d8b63", r: 4, strokeWidth: 2, stroke: "#f7fcf9" }}
              activeDot={{ r: 6, fill: "#3d8b63", stroke: "#f7fcf9", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
