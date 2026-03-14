"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, BookOpen, Settings, Leaf } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/setup", label: "Setup", icon: Settings },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-sand bg-warm-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage/10 transition-colors group-hover:bg-sage/20">
            <Leaf className="h-4 w-4 text-sage" />
          </div>
          <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-bark tracking-tight">
            90 Days
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-sage/10 font-medium text-sage-dark"
                    : "text-stone hover:bg-cream-dark hover:text-bark-light"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
