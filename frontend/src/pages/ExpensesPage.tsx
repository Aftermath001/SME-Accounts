import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/EmptyState';

export default function ExpensesPage() {
  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Expenses</h1>
          <p className="text-slate-600 mt-1">Track and categorize business expenses</p>
        </div>
        <Button>+ Add Expense</Button>
      </div>

      <Card>
        <EmptyState
          icon="💰"
          title="No expenses recorded"
          description="Start tracking your business expenses for better financial management"
          action={<Button>Record Your First Expense</Button>}
        />
      </Card>
    </AppLayout>
  );
}
