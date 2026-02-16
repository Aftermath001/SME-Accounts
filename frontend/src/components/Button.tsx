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
    'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed';

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-surface hover:bg-primary-dark shadow-md active:scale-[0.98]',
    secondary: 'bg-text-primary text-surface hover:bg-text-primary/90 shadow-md active:scale-[0.98]',
    outline: 'border border-text-secondary text-text-primary bg-surface hover:bg-background',
    danger: 'bg-error text-surface hover:bg-error/90 active:scale-[0.98]',
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
        <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </span>
      )}
      {children}
    </button>
  );
}
