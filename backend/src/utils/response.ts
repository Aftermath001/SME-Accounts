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

/**
 * Send success response to client
 * @param res Express response object
 * @param data Response data
 * @param statusCode HTTP status code (default: 200)
 */
export function sendSuccess<T>(
  res: any,
  data: T,
  statusCode: number = 200
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
}

/**
 * Send error response to client
 * @param res Express response object
 * @param message Error message
 * @param statusCode HTTP status code (default: 500)
 */
export function sendError(res: any, message: string, statusCode: number = 500): void {
  const response: ApiResponse = {
    success: false,
    error: {
      code: String(statusCode),
      message,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
}

