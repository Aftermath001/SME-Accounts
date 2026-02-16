import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/EmptyState';

export default function CustomersPage() {
  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-600 mt-1">Manage customer information and contacts</p>
        </div>
        <Button>+ Add Customer</Button>
      </div>

      <Card>
        <EmptyState
          icon="👥"
          title="No customers yet"
          description="Add your first customer to start creating invoices"
          action={<Button>Add Your First Customer</Button>}
        />
      </Card>
    </AppLayout>
  );
}
