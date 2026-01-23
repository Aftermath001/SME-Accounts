/**
 * API Response wrapper for consistent response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export function successResponse<T>(dataOrMessage: T | string, data?: T | string): ApiResponse<T> {
  // Support two patterns:
  // 1. successResponse(data) - data first
  // 2. successResponse(message, data) - message and data
  let responseData: T | unknown = dataOrMessage;
  
  if (typeof dataOrMessage === 'string' && data !== undefined) {
    responseData = data;
  }

  return {
    success: true,
    data: responseData as T,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(
  code: string,
  message: string,
  timestamp?: string
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
    },
    timestamp: timestamp || new Date().toISOString(),
  };
}
