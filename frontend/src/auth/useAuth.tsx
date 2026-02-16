import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ requiresEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const normalizeEmail = (email: string) => email.trim().toLowerCase();

  const mapAuthErrorMessage = (message: string) => {
    const normalized = message.toLowerCase();

    if (normalized.includes('invalid login credentials')) {
      return 'Invalid login credentials. Check your email and password.';
    }

    if (
      normalized.includes('email not confirmed') ||
      normalized.includes('email confirmation required')
    ) {
      return 'Email not confirmed. Please check your inbox for the confirmation link.';
    }

    if (
      normalized.includes('user already registered') ||
      normalized.includes('user already exists')
    ) {
      return 'User already registered. Try signing in instead.';
    }

    return message || 'Authentication failed. Please try again.';
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription?.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });

    if (error) {
      throw new Error(mapAuthErrorMessage(error.message));
    }
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: normalizeEmail(email),
      password,
    });

    if (error) {
      throw new Error(mapAuthErrorMessage(error.message));
    }

    const requiresEmailConfirmation = !data.session;
    return { requiresEmailConfirmation };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
