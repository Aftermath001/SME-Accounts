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

export function successResponse<T>(data: T, timestamp?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: timestamp || new Date().toISOString(),
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
