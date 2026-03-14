"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CompletionTrendPoint {
  date: string;
  pct: number;
}

interface CompletionTrendChartProps {
  data: CompletionTrendPoint[];
}

export function CompletionTrendChart({ data }: CompletionTrendChartProps) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    date: d.date.slice(5),
    pct: d.pct,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Completion Rate</CardTitle>
      </CardHeader>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d0e0d5" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b8a76" }} stroke="#d0e0d5" />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#6b8a76" }}
              stroke="#d0e0d5"
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, "Completion"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #d0e0d5",
                background: "#f7fcf9",
                fontFamily: "Outfit, sans-serif",
                fontSize: 13,
              }}
            />
            <Line
              type="monotone"
              dataKey="pct"
              stroke="#4a7c59"
              strokeWidth={2}
              dot={{ fill: "#4a7c59", r: 3, strokeWidth: 2, stroke: "#f7fcf9" }}
              activeDot={{ r: 5, fill: "#4a7c59", stroke: "#f7fcf9", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
