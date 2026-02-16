import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerRight?: ReactNode;
}

export default function Card({
  children,
  className = '',
  title,
  subtitle,
  headerRight,
}: CardProps) {
  return (
    <section className={`bg-surface backdrop-blur-sm rounded-2xl shadow-card border border-slate-100 ${className}`}>
      {(title || subtitle || headerRight) && (
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h3>}
            {subtitle && <p className="mt-1 text-xs text-text-secondary">{subtitle}</p>}
          </div>
          {headerRight && <div className="shrink-0">{headerRight}</div>}
        </header>
      )}
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}
