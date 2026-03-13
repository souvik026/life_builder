interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ children, className = "", style }: CardProps) {
  return (
    <div className={`bg-warm-white rounded-2xl border border-sand/60 p-6 shadow-[0_1px_3px_rgba(61,46,30,0.04)] ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: CardProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }: CardProps) {
  return (
    <h3 className={`font-[family-name:var(--font-display)] text-sm font-semibold text-bark-light tracking-widest uppercase ${className}`}>
      {children}
    </h3>
  );
}
