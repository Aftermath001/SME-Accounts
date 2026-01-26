export interface StkPushRequest {
  BusinessShortCode: string; // Till/Paybill shortcode
  Password: string; // Base64(Shortcode + Passkey + Timestamp)
  Timestamp: string; // yyyyMMddHHmmss
  TransactionType: 'CustomerPayBillOnline' | 'CustomerBuyGoodsOnline';
  Amount: number; // KES
  PartyA: string; // MSISDN, e.g., 2547...
  PartyB: string; // BusinessShortCode
  PhoneNumber: string; // MSISDN
  CallBackURL: string;
  AccountReference: string; // invoice ref or id
  TransactionDesc: string;
}

export interface StkPushSyncResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string; // '0' if accepted for processing
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface MpesaCallbackItem {
  Name: string;
  Value?: string | number;
}

export interface StkCallbackBody {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: MpesaCallbackItem[];
  };
}

export interface StkCallbackPayload {
  Body: {
    stkCallback: StkCallbackBody;
  };
}

export interface InitiateStkResult {
  payment_id: string;
  checkout_request_id: string;
  response: StkPushSyncResponse;
}
