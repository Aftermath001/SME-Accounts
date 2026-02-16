import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import PasswordInput from '../components/PasswordInput';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="max-w-md mx-auto p-6 bg-surface shadow-md">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-text-primary">Welcome back</h2>
          <p className="text-sm text-text-secondary">
            Sign in to manage your SME finances and KRA compliance.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 text-xs rounded-xl bg-error/20 text-error border border-error/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            type="email"
            name="email"
            label="Work email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <PasswordInput
            name="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <div className="flex justify-end text-xs text-text-secondary">
            <button type="button" className="text-primary font-medium hover:underline">
              Forgot password?
            </button>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-text-secondary">
          New to SME Accounts?{' '}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
