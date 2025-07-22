/**
 * Generic async operation handler with consistent error handling and loading states
 */
export const withAsyncOperation = async <T>(
  operation: () => Promise<T>,
  setLoading: (loading: boolean) => void,
  onError?: (error: Error) => void
): Promise<T | null> => {
  setLoading(true);
  try {
    const result = await operation();
    return result;
  } catch (error) {
    if (onError) {
      onError(error as Error);
    } else {
      console.error('Async operation failed:', error);
    }
    return null;
  } finally {
    setLoading(false);
  }
};
