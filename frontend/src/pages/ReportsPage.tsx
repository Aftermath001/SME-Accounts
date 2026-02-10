import { useNavigate } from 'react-router-dom';

export default function ReportsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
              SME Accounts
            </h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="text-gray-600">View your financial reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit & Loss</h3>
            <p className="text-gray-600 mb-4">View your income and expenses</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              View Report
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">VAT Summary</h3>
            <p className="text-gray-600 mb-4">KRA VAT compliance report</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              View Report
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
