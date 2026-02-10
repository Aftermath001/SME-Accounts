export function formatCurrencyKES(amount: number): string {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 2 }).format(
    Number(amount.toFixed(2))
  );
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}
