"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MoodTrendPoint {
  date: string;
  mood: string;
}

const MOOD_VALUE: Record<string, number> = {
  terrible: 1,
  bad: 2,
  okay: 3,
  good: 4,
  great: 5,
};

const MOOD_LABEL: Record<number, string> = {
  1: "Terrible",
  2: "Bad",
  3: "Okay",
  4: "Good",
  5: "Great",
};

interface MoodTrendChartProps {
  data: MoodTrendPoint[];
}

export function MoodTrendChart({ data }: MoodTrendChartProps) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    date: d.date.slice(5),
    value: MOOD_VALUE[d.mood] || 3,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Trend</CardTitle>
      </CardHeader>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d0e0d5" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b8a76" }} stroke="#d0e0d5" />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 11, fill: "#6b8a76" }}
              stroke="#d0e0d5"
              tickFormatter={(v: number) => MOOD_LABEL[v] || ""}
            />
            <Tooltip
              formatter={(value) => [MOOD_LABEL[value as number] || value, "Mood"]}
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
              dataKey="value"
              stroke="#c4956a"
              strokeWidth={2}
              dot={{ fill: "#c4956a", r: 4, strokeWidth: 2, stroke: "#f7fcf9" }}
              activeDot={{ r: 6, fill: "#c4956a", stroke: "#f7fcf9", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
