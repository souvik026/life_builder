interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: "bg-sand/50 text-bark-light",
  success: "bg-sage/10 text-sage-dark",
  warning: "bg-terracotta/10 text-terracotta-dark",
  danger: "bg-terracotta/20 text-terracotta-dark",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
