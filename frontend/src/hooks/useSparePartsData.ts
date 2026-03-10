import { useQuery, useMutation, useQueryClient, useIsMutating } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import { useActor } from './useActor';
import { useBackendConnectivity } from './useBackendConnectivity';
import type { SparePart, UploadResponse, RetentionStatus } from '@/backend';
import { normalizeBackendError } from '@/lib/backendError';
import { saveBackup } from '@/lib/backup/sparePartsBackup';

export function useSparePartsData() {
  const { actor, isFetching: isActorFetching } = useActor();
  const { connectivity, isBackendUnavailable } = useBackendConnectivity();
  const queryClient = useQueryClient();
  
  // Track the last successfully loaded dataset
  const lastStableDataRef = useRef<SparePart[]>([]);
  const lastStableCountRef = useRef<number>(0);
  
  // Check if an import mutation is currently in progress
  const isImporting = useIsMutating({ mutationKey: ['importDataset'] }) > 0;

  const sparePartsQuery = useQuery<SparePart[]>({
    queryKey: ['spareParts'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend actor not initialized');
      }
      return actor.getAllSpareParts();
    },
    enabled: !!actor && !isActorFetching && connectivity === 'connected',
    staleTime: 0, // Always consider data stale to ensure fresh fetches after import
  });

  const importStatusQuery = useQuery<number>({
    queryKey: ['importStatus'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend actor not initialized');
      }
      const status = await actor.getImportStatus();
      return Number(status);
    },
    enabled: !!actor && !isActorFetching && connectivity === 'connected',
    staleTime: 0, // Always consider data stale to ensure fresh fetches after import
  });

  // Update stable references when we have successful data
  useEffect(() => {
    if (sparePartsQuery.data && sparePartsQuery.isSuccess && !isImporting) {
      lastStableDataRef.current = sparePartsQuery.data;
    }
  }, [sparePartsQuery.data, sparePartsQuery.isSuccess, isImporting]);

  useEffect(() => {
    if (importStatusQuery.data !== undefined && importStatusQuery.isSuccess && !isImporting) {
      lastStableCountRef.current = importStatusQuery.data;
    }
  }, [importStatusQuery.data, importStatusQuery.isSuccess, isImporting]);

  // During import, return the last stable data to prevent empty state flash
  const stableData = isImporting && lastStableDataRef.current.length > 0
    ? lastStableDataRef.current
    : sparePartsQuery.data;

  const stableCount = isImporting && lastStableCountRef.current > 0
    ? lastStableCountRef.current
    : (importStatusQuery.data || 0);

  return {
    data: stableData,
    isLoading: sparePartsQuery.isLoading || isActorFetching,
    error: sparePartsQuery.error,
    importStatus: stableCount,
    isImporting,
    isBackendUnavailable,
    connectivity,
  };
}

export function useRetentionStatus() {
  const { actor, isFetching: isActorFetching } = useActor();
  const { connectivity } = useBackendConnectivity();

  return useQuery<RetentionStatus>({
    queryKey: ['retentionStatus'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend actor not initialized');
      }
      return actor.getRetentionStatus();
    },
    enabled: !!actor && !isActorFetching && connectivity === 'connected',
    refetchInterval: 60000, // Refetch every minute to keep time remaining current
  });
}

export function useImportDataset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['importDataset'],
    mutationFn: async ({ spareParts, password }: { spareParts: SparePart[]; password: string }) => {
      if (!actor) {
        throw new Error('Backend actor not initialized');
      }
      const response: UploadResponse = await actor.uploadDataset(spareParts, password);
      
      // Handle explicit password incorrect response
      if (response === 'passwordIncorrect') {
        throw new Error('Import failed: Invalid maintenance password');
      }
      
      return { response, spareParts };
    },
    onSuccess: async ({ spareParts }) => {
      // Save backup to localStorage after successful import
      saveBackup(spareParts);
      
      // Invalidate and refetch both queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ['spareParts'] });
      await queryClient.invalidateQueries({ queryKey: ['importStatus'] });
      await queryClient.invalidateQueries({ queryKey: ['retentionStatus'] });
      
      // Force immediate refetch to ensure UI updates
      await queryClient.refetchQueries({ queryKey: ['spareParts'] });
      await queryClient.refetchQueries({ queryKey: ['importStatus'] });
      await queryClient.refetchQueries({ queryKey: ['retentionStatus'] });
    },
    onError: (error) => {
      const normalized = normalizeBackendError(error);
      console.error('Import failed:', normalized.originalError);
      // Refetch to ensure we show the correct (unchanged) data after a failed import
      queryClient.refetchQueries({ queryKey: ['spareParts'] });
      queryClient.refetchQueries({ queryKey: ['importStatus'] });
    },
    onSettled: () => {
      // Ensure queries are refetched after mutation settles (success or error)
      queryClient.refetchQueries({ queryKey: ['spareParts'] });
      queryClient.refetchQueries({ queryKey: ['importStatus'] });
    },
  });
}

export function useVerifyPassword() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (password: string) => {
      if (!actor) {
        throw new Error('Backend actor not initialized');
      }
      return actor.verifyMaintenancePassword(password);
    },
  });
}

export function useChangePassword() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => {
      if (!actor) {
        throw new Error('Backend actor not initialized');
      }
      return actor.changeMaintenancePassword(oldPassword, newPassword);
    },
  });
}
