import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Error types for consistent error handling
export interface AppError {
  id: string;
  type: 'network' | 'validation' | 'auth' | 'server' | 'unknown';
  message: string;
  details?: string;
  timestamp: number;
  retryable: boolean;
  userMessage: string;
}

export interface ErrorState {
  errors: AppError[];
  isLoading: boolean;
  lastError?: AppError;
}

// Utility functions for error handling
export class ErrorHandler {
  static createError(
    type: AppError['type'],
    message: string,
    details?: string,
    retryable: boolean = false
  ): AppError {
    const userMessages = {
      network: 'Connection failed. Please check your internet and try again.',
      validation: 'Please check your input and try again.',
      auth: 'Authentication failed. Please sign in again.',
      server: 'Server error occurred. Please try again later.',
      unknown: 'An unexpected error occurred. Please try again.',
    };

    return {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      details,
      timestamp: Date.now(),
      retryable,
      userMessage: userMessages[type],
    };
  }

  static fromApiError(error: any): AppError {
    if (!error) {
      return this.createError('unknown', 'Unknown error occurred');
    }

    // Handle different error formats
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          return this.createError(
            'validation',
            data?.msg || 'Invalid request',
            data?.details
          );
        case 401:
          return this.createError(
            'auth',
            'Unauthorized access',
            data?.msg,
            true
          );
        case 403:
          return this.createError('auth', 'Access forbidden', data?.msg);
        case 404:
          return this.createError('server', 'Resource not found', data?.msg);
        case 422:
          return this.createError('validation', 'Validation failed', data?.msg);
        case 500:
          return this.createError(
            'server',
            'Internal server error',
            data?.msg,
            true
          );
        default:
          return this.createError(
            'server',
            data?.msg || 'Server error',
            data?.details,
            true
          );
      }
    }

    if (error.request) {
      // Network error
      return this.createError(
        'network',
        'Network request failed',
        error.message,
        true
      );
    }

    return this.createError(
      'unknown',
      error.message || 'Unknown error',
      undefined,
      true
    );
  }

  static fromValidationError(errors: Record<string, string>): AppError {
    const message = Object.values(errors).join(', ');
    return this.createError('validation', message);
  }
}

// Redux slice for global error management
const errorSlice = createSlice({
  name: 'error',
  initialState: {
    errors: [],
    isLoading: false,
  } as ErrorState,
  reducers: {
    addError: (state, action: PayloadAction<AppError>) => {
      state.errors.push(action.payload);
      state.lastError = action.payload;
    },
    removeError: (state, action: PayloadAction<string>) => {
      state.errors = state.errors.filter(
        (error) => error.id !== action.payload
      );
      if (state.lastError?.id === action.payload) {
        state.lastError = state.errors[state.errors.length - 1];
      }
    },
    clearErrors: (state) => {
      state.errors = [];
      state.lastError = undefined;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearLastError: (state) => {
      state.lastError = undefined;
    },
  },
});

export const {
  addError,
  removeError,
  clearErrors,
  setLoading,
  clearLastError,
} = errorSlice.actions;
export default errorSlice.reducer;

// Enhanced API error handling for Redux thunks
export const handleThunkError = (error: any, thunkAPI: any) => {
  const appError = ErrorHandler.fromApiError(error);
  thunkAPI.dispatch(addError(appError));
  return thunkAPI.rejectWithValue(appError);
};

// Hook for using error state in components
export const useErrorHandler = () => {
  // This would be used in components to access error state
  // Implementation would go in a custom hook file
};
