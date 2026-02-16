import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import PasswordInput from '../components/PasswordInput';
import PasswordStrength from '../components/PasswordStrength';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { requiresEmailConfirmation } = await signUp(email, password);

      if (requiresEmailConfirmation) {
        setSuccess(
          'Account created. Please check your email to confirm your account.',
        );
      } else {
        setSuccess('Account created successfully. Redirecting...');
        setTimeout(() => navigate('/dashboard'), 1200);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="max-w-md mx-auto p-6 bg-surface shadow-md">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-text-primary">
            Create your SME account
          </h2>
          <p className="text-sm text-text-secondary">
            Manage invoices, expenses, VAT, and KRA compliance in one place.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 text-xs rounded-xl bg-error/20 text-error border border-error/30">
            {error}
          </div>
        )}
        {success && !error && (
          <div className="mt-4 p-3 text-xs rounded-xl bg-success/20 text-success border border-success/30">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            type="email"
            name="email"
            label="Work email"
            placeholder="you@company.com"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            required
            helperText="We’ll send important account and KRA updates here."
          />

          <div className="space-y-2">
            <PasswordInput
              name="password"
              label="Password"
              placeholder="Create a strong password"
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <PasswordStrength password={password} />
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
