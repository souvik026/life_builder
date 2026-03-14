"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface TaskTimeBar {
  name: string;
  total_minutes: number;
}

interface TaskTimeChartProps {
  data: TaskTimeBar[];
}

export function TaskTimeChart({ data }: TaskTimeChartProps) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    name: d.name,
    hours: Math.round((d.total_minutes / 60) * 10) / 10,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Task Hours</CardTitle>
      </CardHeader>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d0e0d5" />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#6b8a76" }}
              stroke="#d0e0d5"
              tickFormatter={(v: number) => `${v}h`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: "#6b8a76" }}
              stroke="#d0e0d5"
              width={100}
            />
            <Tooltip
              formatter={(value) => [`${value} hours`, "Time"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #d0e0d5",
                background: "#f7fcf9",
                fontFamily: "Outfit, sans-serif",
                fontSize: 13,
              }}
            />
            <Bar dataKey="hours" fill="#4a7c59" radius={[0, 6, 6, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
