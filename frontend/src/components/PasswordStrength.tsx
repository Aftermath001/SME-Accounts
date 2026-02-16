interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const getStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const strength = getStrength();
  const percentage = (strength / 5) * 100;

  const getColor = () => {
    if (strength <= 2) return 'bg-error';
    if (strength <= 3) return 'bg-warning';
    return 'bg-success';
  };

  const getLabel = () => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="space-y-1.5">
      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full transition-all duration-300 ${getColor()}`} style={{ width: `${percentage}%` }} />
      </div>
      <p className="text-xs text-text-secondary">
        Password strength: <span className="font-medium">{getLabel()}</span>
      </p>
    </div>
  );
}
