interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const getStrength = () => {
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^a-zA-Z\d]/.test(password)) s++;
    return s;
  };

  const strength = getStrength();
  const pct = (strength / 5) * 100;

  const color = strength <= 2 ? 'bg-error' : strength <= 3 ? 'bg-warning' : 'bg-success';
  const label = strength <= 2 ? 'Weak' : strength <= 3 ? 'Medium' : 'Strong';

  return (
    <div className="space-y-1.5">
      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-slate-600">
        Password strength: <span className="font-medium">{label}</span>
      </p>
    </div>
  );
}
