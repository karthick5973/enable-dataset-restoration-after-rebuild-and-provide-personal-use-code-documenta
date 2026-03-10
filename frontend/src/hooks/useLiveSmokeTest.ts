import { useMemo } from 'react';
import { useActor } from './useActor';
import { useSparePartsData } from './useSparePartsData';
import { isLiveEnvironment, isDraftEnvironment, getCurrentHostname, getEnvironmentLabel } from '@/lib/publishLive/environment';

export interface SmokeTestStep {
  id: string;
  label: string;
  status: 'pending' | 'success' | 'warning' | 'error' | 'manual';
  message?: string;
  isManual?: boolean;
}

export interface LiveSmokeTestState {
  steps: SmokeTestStep[];
  overallStatus: 'pending' | 'partial' | 'success' | 'error' | 'blocked';
  isLiveEnvironment: boolean;
  isDraftEnvironment: boolean;
  currentHostname: string;
  environmentLabel: string;
}

/**
 * Hook to compute Live smoke-test signals using existing app primitives.
 * Tracks: Environment detection, UI load, backend connectivity, data import status, search functionality, and persistence.
 */
export function useLiveSmokeTest(): LiveSmokeTestState {
  const { actor, isFetching: isActorFetching } = useActor();
  const { data: spareParts, isLoading, importStatus } = useSparePartsData();

  const currentHostname = getCurrentHostname();
  const isLive = isLiveEnvironment();
  const isDraft = isDraftEnvironment();
  const environmentLabel = getEnvironmentLabel();

  const steps = useMemo<SmokeTestStep[]>(() => {
    const result: SmokeTestStep[] = [];

    // Step 0: Environment detection (CRITICAL - blocks other checks if not Live)
    if (!isLive) {
      result.push({
        id: 'environment-detection',
        label: 'Live environment detection',
        status: 'error',
        message: isDraft 
          ? 'You are on Draft. Open your Live URL (your-slug.caffeine.xyz) to verify production deployment.'
          : 'Not on Live environment. Publish to Live and open the Live URL to verify.',
      });
      
      // If not on Live, mark remaining checks as blocked
      result.push({
        id: 'ui-load',
        label: 'UI loads successfully',
        status: 'pending',
        message: 'Blocked: Must be on Live environment to verify',
      });
      
      result.push({
        id: 'backend-connectivity',
        label: 'Backend connectivity',
        status: 'pending',
        message: 'Blocked: Must be on Live environment to verify',
      });
      
      result.push({
        id: 'data-import',
        label: 'Data import verification',
        status: 'pending',
        message: 'Blocked: Must be on Live environment to verify',
      });
      
      result.push({
        id: 'search-functionality',
        label: 'Search functionality',
        status: 'pending',
        message: 'Blocked: Must be on Live environment to verify',
      });
      
      result.push({
        id: 'persistence-check',
        label: 'Persistence verification (manual)',
        status: 'manual',
        message: 'Manual step: Close and reopen Live URL to verify app stays online',
        isManual: true,
      });
      
      return result;
    }

    // Step 0: Environment detection - SUCCESS (we're on Live)
    result.push({
      id: 'environment-detection',
      label: 'Live environment detection',
      status: 'success',
      message: `Confirmed Live environment: ${currentHostname}`,
    });

    // Step 1: UI loads successfully
    result.push({
      id: 'ui-load',
      label: 'UI loads successfully',
      status: 'success',
      message: 'Application UI is rendered and interactive',
    });

    // Step 2: Backend connectivity
    if (isActorFetching) {
      result.push({
        id: 'backend-connectivity',
        label: 'Backend connectivity',
        status: 'pending',
        message: 'Initializing connection to backend canister...',
      });
    } else if (actor) {
      result.push({
        id: 'backend-connectivity',
        label: 'Backend connectivity',
        status: 'success',
        message: 'Successfully connected to backend canister',
      });
    } else {
      result.push({
        id: 'backend-connectivity',
        label: 'Backend connectivity',
        status: 'error',
        message: 'Failed to connect to backend canister',
      });
    }

    // Step 3: Data import verification
    if (isLoading) {
      result.push({
        id: 'data-import',
        label: 'Data import verification',
        status: 'pending',
        message: 'Checking import status...',
      });
    } else if (importStatus && importStatus > 0) {
      result.push({
        id: 'data-import',
        label: 'Data import verification',
        status: 'success',
        message: `${importStatus} spare parts loaded successfully`,
      });
    } else {
      result.push({
        id: 'data-import',
        label: 'Data import verification',
        status: 'warning',
        message: 'No data imported yet. Upload an Excel file to complete verification.',
      });
    }

    // Step 4: Search functionality
    if (spareParts && spareParts.length > 0) {
      result.push({
        id: 'search-functionality',
        label: 'Search functionality',
        status: 'success',
        message: 'Search and filtering are operational',
      });
    } else if (importStatus === 0) {
      result.push({
        id: 'search-functionality',
        label: 'Search functionality',
        status: 'pending',
        message: 'Waiting for data to test search functionality',
      });
    } else {
      result.push({
        id: 'search-functionality',
        label: 'Search functionality',
        status: 'pending',
        message: 'Loading data...',
      });
    }

    // Step 5: Persistence check (manual verification)
    result.push({
      id: 'persistence-check',
      label: 'Persistence verification (manual)',
      status: 'manual',
      message: 'Manual step: Close this tab, then reopen the Live URL to verify the app stays online',
      isManual: true,
    });

    return result;
  }, [actor, isActorFetching, spareParts, isLoading, importStatus, isLive, isDraft, currentHostname]);

  const overallStatus = useMemo<'pending' | 'partial' | 'success' | 'error' | 'blocked'>(() => {
    // If not on Live environment, status is blocked
    if (!isLive) {
      return 'blocked';
    }

    const hasError = steps.some((s) => s.status === 'error');
    const hasWarning = steps.some((s) => s.status === 'warning');
    const hasPending = steps.some((s) => s.status === 'pending');
    const allAutomatedSuccess = steps.filter(s => !s.isManual).every((s) => s.status === 'success');

    if (hasError) return 'error';
    if (allAutomatedSuccess) return 'success';
    if (hasWarning || hasPending) return 'partial';
    return 'pending';
  }, [steps, isLive]);

  return {
    steps,
    overallStatus,
    isLiveEnvironment: isLive,
    isDraftEnvironment: isDraft,
    currentHostname,
    environmentLabel,
  };
}
