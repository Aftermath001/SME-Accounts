import AppLayout from '../layouts/AppLayout';
import Card from '../components/Card';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of your business finances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Invoices</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">0</p>
            </div>
            <div className="text-4xl">📄</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Expenses</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">KES 0</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">VAT Due</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">KES 0</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/invoices">
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="text-3xl">📄</div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Invoices</h3>
                  <p className="text-slate-600 text-sm mt-1">Create and manage customer invoices</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/expenses">
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="text-3xl">💰</div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Expenses</h3>
                  <p className="text-slate-600 text-sm mt-1">Track and categorize business expenses</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/customers">
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="text-3xl">👥</div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Customers</h3>
                  <p className="text-slate-600 text-sm mt-1">Manage customer information and contacts</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/reports">
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="text-3xl">📈</div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Reports</h3>
                  <p className="text-slate-600 text-sm mt-1">View financial reports and KRA compliance</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
