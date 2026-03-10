import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppHeader from './components/AppHeader';
import UploadCard from './components/UploadCard';
import SparePartsTable from './components/SparePartsTable';
import EmptyState from './components/EmptyState';
import BackendUnavailableState from './components/BackendUnavailableState';
import DatasetRetentionNotice from './components/DatasetRetentionNotice';
import { useSparePartsData, useRetentionStatus } from './hooks/useSparePartsData';
import { useBackendConnectivity } from './hooks/useBackendConnectivity';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const { data: spareParts, isLoading, importStatus, isImporting, isBackendUnavailable } = useSparePartsData();
  const { data: retentionStatus, isLoading: isRetentionLoading, isError: isRetentionError } = useRetentionStatus();
  const { refetch: refetchConnectivity } = useBackendConnectivity();
  const [searchQuery, setSearchQuery] = useState('');
  const [appIdentifier, setAppIdentifier] = useState('spare-parts-finder');
  const [isRetrying, setIsRetrying] = useState(false);

  // Compute hostname safely in an effect
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      setAppIdentifier(window.location.hostname);
    }
  }, []);

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    try {
      await refetchConnectivity();
    } finally {
      setIsRetrying(false);
    }
  };

  const hasData = spareParts && spareParts.length > 0;
  // Don't show empty state if we're importing and have previous data
  const showEmptyState = !hasData && !isLoading && !isImporting && !isBackendUnavailable;
  const showBackendUnavailable = isBackendUnavailable && !isLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          <DatasetRetentionNotice 
            retentionStatus={retentionStatus}
            isLoading={isRetentionLoading}
            isError={isRetentionError}
          />
          
          <UploadCard />
          
          {showBackendUnavailable && (
            <BackendUnavailableState 
              onRetry={handleRetryConnection}
              isRetrying={isRetrying}
            />
          )}
          
          {showEmptyState && <EmptyState />}
          
          {hasData && (
            <SparePartsTable 
              spareParts={spareParts}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              totalCount={importStatus}
            />
          )}
        </div>
      </main>

      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} · Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(appIdentifier)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
