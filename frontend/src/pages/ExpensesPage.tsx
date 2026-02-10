import { useNavigate } from 'react-router-dom';

export default function ExpensesPage() {
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
            <p className="text-gray-600">Track your business expenses</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add Expense
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 text-center text-gray-500">
            No expenses recorded yet. Add your first expense to get started.
          </div>
        </div>
      </main>
    </div>
  );
}
