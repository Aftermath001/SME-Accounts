export interface InitiatePaymentDTO {
  invoice_id: string;
  amount: number;
  phone_number: string; // MSISDN e.g. 2547...
}

export function validateInitiatePayment(body: any): InitiatePaymentDTO {
  const errors: string[] = [];
  const invoice_id = typeof body?.invoice_id === 'string' ? body.invoice_id : '';
  const amount = Number(body?.amount);
  const phone_number = typeof body?.phone_number === 'string' ? body.phone_number : '';

  if (!invoice_id) errors.push('invoice_id is required');
  if (!Number.isFinite(amount) || amount <= 0) errors.push('amount must be a positive number');
  if (!/^2547\d{8}$/.test(phone_number)) errors.push('phone_number must be in MSISDN format e.g., 2547XXXXXXXX');

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  return { invoice_id, amount, phone_number };
}
