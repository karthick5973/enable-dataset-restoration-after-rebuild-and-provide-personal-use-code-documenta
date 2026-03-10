import { CheckCircle2, AlertCircle, Clock, AlertTriangle, ExternalLink, RefreshCw, Info, XCircle, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLiveSmokeTest } from '@/hooks/useLiveSmokeTest';

interface LiveSmokeTestPanelProps {
  onClose?: () => void;
}

export default function LiveSmokeTestPanel({ onClose }: LiveSmokeTestPanelProps) {
  const { 
    steps, 
    overallStatus, 
    isLiveEnvironment, 
    isDraftEnvironment,
    currentHostname,
    environmentLabel 
  } = useLiveSmokeTest();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'manual':
        return <ClipboardCheck className="w-5 h-5 text-blue-600" />;
      case 'pending':
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getOverallStatusBadge = () => {
    switch (overallStatus) {
      case 'success':
        return <Badge className="bg-green-600 hover:bg-green-700">All checks passed</Badge>;
      case 'error':
        return <Badge variant="destructive">Checks failed</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Not on Live</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">Partial success</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline">Checking...</Badge>;
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg">Live Deployment Verification</CardTitle>
            <CardDescription className="mt-1">
              Verify your production deployment is working correctly
            </CardDescription>
          </div>
          {getOverallStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Environment Info */}
        <Alert className={isLiveEnvironment ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-muted/50'}>
          {isLiveEnvironment ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive" />
          )}
          <AlertDescription>
            <p className="text-sm font-medium mb-1">
              {environmentLabel} Environment
            </p>
            <code className="text-xs bg-background/50 px-2 py-1 rounded border border-border">
              {currentHostname}
            </code>
            {isLiveEnvironment && (
              <p className="text-xs text-muted-foreground mt-2">
                ✓ Confirmed Live deployment - your app stays online continuously
              </p>
            )}
          </AlertDescription>
        </Alert>

        {/* Draft Environment Callout */}
        {isDraftEnvironment && (
          <Alert className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-600 dark:border-yellow-900">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm space-y-2">
              <p className="font-medium text-foreground">⚠️ You are on Draft, not Live</p>
              <p className="text-muted-foreground">
                To verify your Live deployment, you must open the actual Live URL after publishing.
              </p>
              <div className="bg-background/50 rounded p-2 space-y-1 text-xs">
                <p className="font-medium text-foreground">How to verify Live properly:</p>
                <ol className="list-decimal list-inside space-y-0.5 ml-2 text-muted-foreground">
                  <li>Publish your app to Live using the Caffeine platform</li>
                  <li>Open your Live URL (your-slug.caffeine.xyz) in a fresh browser tab</li>
                  <li>Look for the green "Live" badge in the header (not yellow "Draft")</li>
                  <li>Run through this verification checklist on the Live URL</li>
                  <li>Close and reopen the Live URL to confirm persistence</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Development Environment Callout (localhost, etc.) */}
        {!isLiveEnvironment && !isDraftEnvironment && (
          <Alert className="bg-muted/50 border-muted-foreground/20">
            <Info className="h-4 w-4 text-muted-foreground" />
            <AlertDescription className="text-sm space-y-2">
              <p className="font-medium text-foreground">Development Environment</p>
              <p className="text-muted-foreground">
                You are in a local development environment. To verify your Live deployment, publish to Live and open the Live URL.
              </p>
              <div className="bg-background/50 rounded p-2 space-y-1 text-xs">
                <p className="font-medium text-foreground">Steps to verify Live:</p>
                <ol className="list-decimal list-inside space-y-0.5 ml-2 text-muted-foreground">
                  <li>Publish your app to Live via the Caffeine platform</li>
                  <li>Open the Live URL in a new browser tab or incognito window</li>
                  <li>Confirm the green "Live" badge appears in the header</li>
                  <li>Test all functionality using the checklist below</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Live Environment Success Message */}
        {isLiveEnvironment && overallStatus === 'success' && (
          <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm">
              <p className="font-medium text-foreground mb-1">✓ Live Deployment Verified!</p>
              <p className="text-muted-foreground text-xs">
                Your app is deployed to Live and all automated checks passed. Complete the manual persistence check below to finish verification.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Verification Checklist */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Verification Checklist</h4>
          <ScrollArea className="h-[280px] pr-3">
            <div className="space-y-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    step.status === 'success'
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
                      : step.status === 'error'
                      ? 'bg-destructive/5 border-destructive/20'
                      : step.status === 'warning'
                      ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900'
                      : step.status === 'manual'
                      ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                      : 'bg-muted/30 border-border'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {step.label}
                    </p>
                    {step.message && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {step.message}
                      </p>
                    )}
                    {step.isManual && step.status === 'manual' && (
                      <div className="mt-2 p-2 bg-background/50 rounded text-xs space-y-1">
                        <p className="font-medium text-foreground">Manual verification required:</p>
                        <ol className="list-decimal list-inside space-y-0.5 ml-2 text-muted-foreground">
                          <li>Close this browser tab completely</li>
                          <li>Reopen the Live URL in a new tab</li>
                          <li>Verify the app loads and the green "Live" badge is visible</li>
                          <li>Confirm all functionality still works</li>
                        </ol>
                        <p className="text-muted-foreground mt-1">
                          This confirms your Live deployment persists and doesn't shut down like Draft environments.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh Checks
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
          )}
        </div>

        {/* Additional Info for Non-Live Environments */}
        {!isLiveEnvironment && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <p className="font-medium text-foreground mb-1">Need help publishing?</p>
              <p className="text-muted-foreground">
                Switch to the <strong>Publish</strong> tab for step-by-step guidance on publishing to Live, or click the <strong>?</strong> icon for detailed instructions.
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
