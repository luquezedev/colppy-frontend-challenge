import { SWRConfiguration } from 'swr';
import axios, { AxiosError } from 'axios';

// Global fetcher function
export const fetcher = async (url: string) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

// SWR global configuration
export const swrConfig: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  dedupingInterval: 2000,
  focusThrottleInterval: 5000,
  keepPreviousData: true,
  onError: (error: Error, key: string) => {
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error(`SWR Error for ${key}:`, error);
    }
  },
  onSuccess: (data, key) => {
    // Log successful fetches in development
    if (import.meta.env.DEV) {
      console.log(`SWR Success for ${key}:`, data);
    }
  },
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Don't retry on 404
    if ((error as AxiosError)?.response?.status === 404) return;

    // Don't retry on 401 (unauthorized)
    if ((error as AxiosError)?.response?.status === 401) return;

    // Only retry up to 3 times
    if (retryCount >= 3) return;

    // Retry after exponential backoff
    setTimeout(() => revalidate({ retryCount }), 1000 * Math.pow(2, retryCount));
  },
};
