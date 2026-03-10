import { useActor } from './useActor';
import { useQuery } from '@tanstack/react-query';

export type BackendConnectivity = 'connected' | 'connecting' | 'unavailable';

/**
 * Hook that wraps useActor and adds connectivity state detection
 */
export function useBackendConnectivity() {
  const { actor, isFetching } = useActor();
  
  // Test connectivity by attempting a lightweight query
  const connectivityQuery = useQuery({
    queryKey: ['backend-connectivity'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not initialized');
      }
      // Use getImportStatus as a lightweight connectivity test
      await actor.getImportStatus();
      return true;
    },
    enabled: !!actor,
    retry: 2,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Determine connectivity state
  let connectivity: BackendConnectivity = 'connecting';
  
  if (isFetching) {
    connectivity = 'connecting';
  } else if (!actor || connectivityQuery.isError) {
    connectivity = 'unavailable';
  } else if (actor && connectivityQuery.isSuccess) {
    connectivity = 'connected';
  }

  const isBackendUnavailable = connectivity === 'unavailable';

  return {
    actor,
    isFetching,
    connectivity,
    isBackendUnavailable,
    isError: connectivityQuery.isError || (!actor && !isFetching),
    error: connectivityQuery.error,
    refetch: connectivityQuery.refetch,
  };
}
