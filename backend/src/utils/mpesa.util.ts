import { MpesaCallbackItem, StkCallbackBody } from '../types/mpesa.types';

export function formatTimestamp(date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const HH = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
}

export function buildPassword(shortcode: string, passkey: string, timestamp: string): string {
  const raw = `${shortcode}${passkey}${timestamp}`;
  return Buffer.from(raw).toString('base64');
}

export function getCallbackItem(items: MpesaCallbackItem[] | undefined, name: string): string | undefined {
  const found = items?.find((i) => i.Name === name);
  const val = found?.Value;
  return val !== undefined && val !== null ? String(val) : undefined;
}

export function extractReceiptNumber(cb: StkCallbackBody): string | undefined {
  return getCallbackItem(cb.CallbackMetadata?.Item, 'MpesaReceiptNumber');
}

export function extractAmount(cb: StkCallbackBody): number | undefined {
  const v = getCallbackItem(cb.CallbackMetadata?.Item, 'Amount');
  return v ? Number(v) : undefined;
}

export function extractPhone(cb: StkCallbackBody): string | undefined {
  return getCallbackItem(cb.CallbackMetadata?.Item, 'PhoneNumber');
}
