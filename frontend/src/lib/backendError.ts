/**
 * Utility to normalize backend/agent/network errors into user-friendly messages
 * while preserving the original error for console logging.
 */

export interface NormalizedError {
  userMessage: string;
  originalError: unknown;
  category: 'connectivity' | 'password' | 'parse' | 'unknown';
}

export function normalizeBackendError(error: unknown): NormalizedError {
  const originalError = error;
  
  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Connectivity/network issues
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('unreachable') ||
      message.includes('backend actor not initialized') ||
      message.includes('actor not initialized') ||
      message.includes('canister') && message.includes('unavailable')
    ) {
      return {
        userMessage: 'Backend unavailable. Please check your connection and try again.',
        originalError,
        category: 'connectivity',
      };
    }
    
    // Password-related errors
    if (
      message.includes('password') ||
      message.includes('unauthorized') ||
      message.includes('authentication')
    ) {
      return {
        userMessage: 'Invalid password. Please verify and try again.',
        originalError,
        category: 'password',
      };
    }
    
    // Parse errors
    if (message.includes('parse') || message.includes('invalid format')) {
      return {
        userMessage: 'Unable to parse file. Please check the file format.',
        originalError,
        category: 'parse',
      };
    }
    
    // Return the error message as-is if it's already user-friendly
    return {
      userMessage: error.message,
      originalError,
      category: 'unknown',
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      userMessage: error,
      originalError,
      category: 'unknown',
    };
  }
  
  // Fallback for unknown error types
  return {
    userMessage: 'An unexpected error occurred. Please try again.',
    originalError,
    category: 'unknown',
  };
}

/**
 * Check if an error indicates backend connectivity issues
 */
export function isConnectivityError(error: unknown): boolean {
  const normalized = normalizeBackendError(error);
  return normalized.category === 'connectivity';
}

/**
 * Check if an error indicates a password problem
 */
export function isPasswordError(error: unknown): boolean {
  const normalized = normalizeBackendError(error);
  return normalized.category === 'password';
}
