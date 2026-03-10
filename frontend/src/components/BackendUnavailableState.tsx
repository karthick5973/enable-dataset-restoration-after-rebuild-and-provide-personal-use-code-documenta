import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BackendUnavailableStateProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export default function BackendUnavailableState({ onRetry, isRetrying = false }: BackendUnavailableStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            Backend Unavailable
          </CardTitle>
          <CardDescription>
            Unable to connect to the backend service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The backend service is currently unavailable. This could be due to:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Network connectivity issues</li>
                <li>Backend canister is not running</li>
                <li>Temporary service interruption</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Please check your internet connection and try again. If the problem persists, 
              the service may be temporarily unavailable.
            </p>
            
            <Button 
              onClick={onRetry} 
              disabled={isRetrying}
              className="w-full"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Connection
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
