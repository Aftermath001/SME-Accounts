import AppLayout from '../layouts/AppLayout';
import Card from '../components/Card';
import Button from '../components/Button';

export default function ReportsPage() {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-600 mt-1">Financial reports and KRA compliance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">📊</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Profit & Loss</h3>
              <p className="text-slate-600 text-sm mb-4">View your income and expenses over time</p>
              <Button variant="secondary">View Report</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">📈</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">VAT Summary</h3>
              <p className="text-slate-600 text-sm mb-4">KRA VAT compliance and filing report</p>
              <Button variant="secondary">View Report</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💼</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Balance Sheet</h3>
              <p className="text-slate-600 text-sm mb-4">Assets, liabilities, and equity overview</p>
              <Button variant="secondary">View Report</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">📅</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Monthly Summary</h3>
              <p className="text-slate-600 text-sm mb-4">Month-by-month financial performance</p>
              <Button variant="secondary">View Report</Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
