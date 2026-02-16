import { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex-1 lg:flex-none" />

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
              SME Accounts
            </p>
            <p className="text-[11px] text-neutral-500">
              Kenyan SME finance workspace
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-sm hover:border-slate-300"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-[11px] font-semibold text-white">
                {user?.email?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-medium text-slate-900">
                  {user?.email}
                </p>
                <p className="text-[11px] text-neutral-500">Account owner</p>
              </div>
              <svg
                className="h-3 w-3 text-neutral-400"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white py-1 text-sm shadow-card">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-between px-3 py-2 text-xs text-error-500 hover:bg-red-50"
                >
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
