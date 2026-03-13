import { Card } from "@/components/ui/Card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue }: StatCardProps) {
  const trendColor = trend === "up" ? "text-sage-dark" : trend === "down" ? "text-terracotta" : "text-stone";

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-stone uppercase tracking-wide">{title}</p>
          <p className="mt-1.5 font-[family-name:var(--font-display)] text-3xl font-bold text-bark">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-stone-light">{subtitle}</p>}
          {trendValue && (
            <p className={`mt-1 text-sm font-medium ${trendColor}`}>{trendValue}</p>
          )}
        </div>
        <div className="rounded-xl bg-cream-dark p-3">
          <Icon className="h-5 w-5 text-stone" />
        </div>
      </div>
    </Card>
  );
}
