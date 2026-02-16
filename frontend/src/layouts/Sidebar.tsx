import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/invoices', label: 'Invoices', icon: '📄' },
  { path: '/expenses', label: 'Expenses', icon: '💰' },
  { path: '/customers', label: 'Customers', icon: '👥' },
  { path: '/reports', label: 'Reports', icon: '📈' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900/95 backdrop-blur transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="border-b border-slate-800 px-6 py-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-600 text-xs font-semibold text-white">
                SME
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">
                  SME Accounts
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Financial SaaS for Kenya
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-800 px-4 py-3">
            <p className="text-[10px] text-slate-500 text-center">
              © 2026 SME Accounts
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
