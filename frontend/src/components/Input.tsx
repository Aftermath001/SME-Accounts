import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-2.5 bg-white border rounded-lg text-text-primary placeholder:text-text-secondary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed ${
          error ? 'border-error focus:ring-error' : 'border-slate-300 hover:border-slate-400'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-text-secondary">{helperText}</p>
      )}
    </div>
  )
);

Input.displayName = 'Input';
export default Input;
