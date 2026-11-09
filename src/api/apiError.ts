import axios from 'axios';

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Turn any thrown value into a human readable ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const serverMessage = (error.response?.data as { message?: string } | undefined)?.message;
    if (!error.response) {
      return new ApiError('Cannot reach the server. Please check your internet connection.', undefined);
    }
    switch (status) {
      case 400:
        return new ApiError(serverMessage ?? 'Invalid request.', status);
      case 401:
        return new ApiError(serverMessage ?? 'Your session has expired. Please sign in again.', status);
      case 403:
        return new ApiError('You do not have permission to perform this action.', status);
      case 404:
        return new ApiError('The requested resource was not found.', status);
      case 429:
        return new ApiError('Too many requests. Please slow down and try again.', status);
      default:
        if (status && status >= 500) {
          return new ApiError('The server encountered an error. Please try again later.', status);
        }
        return new ApiError(serverMessage ?? error.message, status);
    }
  }
  return new ApiError(error instanceof Error ? error.message : 'Something went wrong.');
}
