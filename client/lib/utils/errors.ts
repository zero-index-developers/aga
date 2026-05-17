/**
 * Error Handling Utilities
 * 
 * Centralized error handling and formatting utilities
 * to ensure consistent error messages across the application.
 */

import { NextResponse } from 'next/server';

/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
  error: string;
  message?: string;
  status: number;
  details?: any;
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Extract error message from unknown error type
 * 
 * @param error - Error of unknown type
 * @returns Human-readable error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unknown error occurred';
}

/**
 * Create a standardized error response for API routes
 * 
 * @param error - Error to format
 * @param defaultMessage - Default message if error has none
 * @param status - HTTP status code
 * @returns NextResponse with error
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = 'An error occurred',
  status: number = 500
): NextResponse {
  const message = getErrorMessage(error);
  
  const response: ApiErrorResponse = {
    error: message || defaultMessage,
    status,
  };

  // Add details in development
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    response.details = {
      stack: error.stack,
      name: error.name,
    };
  }

  console.error(`[API Error ${status}]:`, message, error);

  return NextResponse.json(response, { status });
}

/**
 * Handle API errors with specific status codes
 */
export const ErrorResponses = {
  /**
   * 400 Bad Request
   */
  badRequest(message: string = 'Bad request'): NextResponse {
    return createErrorResponse(new Error(message), message, 400);
  },

  /**
   * 401 Unauthorized
   */
  unauthorized(message: string = 'Authentication required'): NextResponse {
    return createErrorResponse(new Error(message), message, 401);
  },

  /**
   * 403 Forbidden
   */
  forbidden(message: string = 'Access forbidden'): NextResponse {
    return createErrorResponse(new Error(message), message, 403);
  },

  /**
   * 404 Not Found
   */
  notFound(message: string = 'Resource not found'): NextResponse {
    return createErrorResponse(new Error(message), message, 404);
  },

  /**
   * 409 Conflict
   */
  conflict(message: string = 'Resource conflict'): NextResponse {
    return createErrorResponse(new Error(message), message, 409);
  },

  /**
   * 422 Unprocessable Entity
   */
  unprocessable(message: string = 'Invalid data'): NextResponse {
    return createErrorResponse(new Error(message), message, 422);
  },

  /**
   * 500 Internal Server Error
   */
  internal(error: unknown, message: string = 'Internal server error'): NextResponse {
    return createErrorResponse(error, message, 500);
  },

  /**
   * 502 Bad Gateway
   */
  badGateway(message: string = 'Backend service unavailable'): NextResponse {
    return createErrorResponse(new Error(message), message, 502);
  },

  /**
   * 503 Service Unavailable
   */
  serviceUnavailable(message: string = 'Service temporarily unavailable'): NextResponse {
    return createErrorResponse(new Error(message), message, 503);
  },
};

/**
 * Wrap async API route handlers with error handling
 * 
 * @param handler - Async route handler function
 * @returns Wrapped handler with error handling
 * 
 * @example
 * export const GET = withErrorHandling(async (req) => {
 *   // Your logic here
 *   return NextResponse.json({ data });
 * });
 */
export function withErrorHandling(
  handler: (req: Request, context?: any) => Promise<NextResponse>
) {
  return async (req: Request, context?: any): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return createErrorResponse(error, error.message, error.status);
      }
      return ErrorResponses.internal(error);
    }
  };
}

/**
 * Validate required fields in request body
 * 
 * @param data - Request body data
 * @param requiredFields - Array of required field names
 * @throws ApiError if validation fails
 */
export function validateRequiredFields(
  data: any,
  requiredFields: string[]
): void {
  const missing = requiredFields.filter(field => !data[field]);
  
  if (missing.length > 0) {
    throw new ApiError(
      `Missing required fields: ${missing.join(', ')}`,
      400
    );
  }
}

/**
 * Check if error is a network error
 * 
 * @param error - Error to check
 * @returns True if error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ETIMEDOUT')
    );
  }
  return false;
}

/**
 * Check if error is an authentication error
 * 
 * @param error - Error to check
 * @returns True if error is auth-related
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 401 || error.status === 403;
  }
  if (error instanceof Error) {
    return (
      error.message.includes('auth') ||
      error.message.includes('unauthorized') ||
      error.message.includes('forbidden')
    );
  }
  return false;
}

/**
 * Format error for logging
 * 
 * @param error - Error to format
 * @param context - Additional context
 * @returns Formatted error string
 */
export function formatErrorForLogging(
  error: unknown,
  context?: Record<string, any>
): string {
  const message = getErrorMessage(error);
  const timestamp = new Date().toISOString();
  
  let log = `[${timestamp}] ${message}`;
  
  if (context) {
    log += `\nContext: ${JSON.stringify(context, null, 2)}`;
  }
  
  if (error instanceof Error && error.stack) {
    log += `\nStack: ${error.stack}`;
  }
  
  return log;
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in milliseconds
 * @returns Result of function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Made with Bob
