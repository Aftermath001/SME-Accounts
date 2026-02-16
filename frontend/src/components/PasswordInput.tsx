import { useState,type InputHTMLAttributes, forwardRef } from 'react';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const [show, setShow] = useState(false);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-900 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={show ? 'text' : 'password'}
            className={`w-full px-4 py-2.5 pr-10 bg-white border rounded-lg text-slate-900 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed ${
              error ? 'border-error focus:ring-error' : 'border-slate-300 hover:border-slate-400'
            } ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors"
            tabIndex={-1}
          >
            {show ? '🙈' : '👁️'}
          </button>
        </div>
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-xs text-slate-600">{helperText}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
