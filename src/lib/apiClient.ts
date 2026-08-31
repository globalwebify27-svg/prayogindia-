export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Universal API Client Wrapper for future Production Backend Integration.
 * Standardizes fetch requests, authentication bearer headers, and JSON error handling.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP Request Failed with status ${response.status}`;
      let errorsData: Record<string, string[]> | undefined = undefined;

      try {
        const errorJson: ApiErrorResponse = await response.json();
        errorMessage = errorJson.message || errorMessage;
        errorsData = errorJson.errors;
      } catch {
        // Fallback for non-JSON error bodies
      }

      throw new ApiError(errorMessage, response.status, errorsData);
    }

    // Return parsed JSON response
    return (await response.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err.message || 'Network error occurred. Please check your internet connection.',
      0
    );
  }
}
