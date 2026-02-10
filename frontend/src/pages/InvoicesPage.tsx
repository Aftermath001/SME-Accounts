import AppLayout from '../layouts/AppLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

export default function InvoicesPage() {
  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-600 mt-1">Create and manage customer invoices</p>
        </div>
        <Button>+ Create Invoice</Button>
      </div>

      <Card>
        <EmptyState
          icon="📄"
          title="No invoices yet"
          description="Create your first invoice to start billing customers"
          action={<Button>Create Your First Invoice</Button>}
        />
      </Card>
    </AppLayout>
  );
}
