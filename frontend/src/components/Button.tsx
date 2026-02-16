import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const baseStyles =
    'inline-flex items-center justify-center rounded-xl font-medium tracking-tight transition-all duration-150 ease-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed';

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-primary text-white shadow-sm hover:bg-primary-dark active:scale-[0.98]',
    secondary:
      'bg-slate-900 text-white hover:bg-slate-800 shadow-sm active:scale-[0.98]',
    outline:
      'border border-slate-300 text-neutral-700 bg-white hover:bg-slate-50 hover:border-slate-400',
    danger:
      'bg-error text-white shadow-sm hover:bg-red-600 active:scale-[0.98]',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span className="mr-2 inline-flex h-4 w-4 items-center justify-center" aria-hidden="true">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </span>
      )}
      {children}
    </button>
  );
}
