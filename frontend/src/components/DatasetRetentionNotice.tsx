import { AlertTriangle, CheckCircle2, Clock, Info, Rocket } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { isLiveEnvironment, isDraftEnvironment } from '@/lib/publishLive/environment';
import type { RetentionStatus } from '@/backend';

interface DatasetRetentionNoticeProps {
  retentionStatus?: RetentionStatus;
  isLoading: boolean;
  isError: boolean;
}

export default function DatasetRetentionNotice({ 
  retentionStatus, 
  isLoading, 
  isError 
}: DatasetRetentionNoticeProps) {
  const isLive = isLiveEnvironment();
  const isDraft = isDraftEnvironment();

  // Format time remaining in a human-readable way
  const formatTimeRemaining = (nanoseconds: bigint): string => {
    const totalSeconds = Number(nanoseconds) / 1_000_000_000;
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  };

  // Show Draft warning if in Draft environment
  if (isDraft) {
    return (
      <Alert className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-600 dark:border-yellow-900">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <AlertTitle className="text-foreground font-semibold">Draft Environment Warning</AlertTitle>
        <AlertDescription className="text-sm space-y-2">
          <p className="text-muted-foreground">
            You are currently in a <strong className="text-foreground">Draft environment</strong>. Draft deployments are temporary and may shut down when inactive, causing your pages to close automatically.
          </p>
          <p className="text-muted-foreground">
            To keep your app online permanently and prevent automatic shutdowns, <strong className="text-foreground">publish your app to Live</strong> using the <Rocket className="inline w-3.5 h-3.5 mx-0.5" /> Publish Live button in the header.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // Show Development warning if in local/development environment
  if (!isLive && !isDraft) {
    return (
      <Alert className="bg-muted/50 border-muted-foreground/20">
        <Info className="h-5 w-5 text-muted-foreground" />
        <AlertTitle className="text-foreground font-semibold">Development Environment</AlertTitle>
        <AlertDescription className="text-sm">
          <p className="text-muted-foreground">
            You are in a local development environment. To deploy your app permanently and keep it online, publish it to Live using the Caffeine platform.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // Live environment - show retention status
  if (isLoading) {
    return (
      <Card className="bg-card/50">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground animate-pulse" />
            <div>
              <p className="text-sm font-medium text-foreground">Checking retention status...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !retentionStatus) {
    return (
      <Alert className="bg-primary/5 border-primary/20">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <AlertTitle className="text-foreground font-semibold flex items-center gap-2">
          Live Environment
          <Badge className="bg-primary hover:bg-primary/90">Always Online</Badge>
        </AlertTitle>
        <AlertDescription className="text-sm">
          <p className="text-muted-foreground">
            Your app is deployed to Live and will remain online permanently. Data retention status is currently unavailable.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // Show retention info based on data existence
  if (!retentionStatus.dataExists) {
    return (
      <Alert className="bg-primary/5 border-primary/20">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <AlertTitle className="text-foreground font-semibold flex items-center gap-2">
          Live Environment
          <Badge className="bg-primary hover:bg-primary/90">Always Online</Badge>
        </AlertTitle>
        <AlertDescription className="text-sm">
          <p className="text-muted-foreground">
            Your app is deployed to Live and will remain online permanently. No dataset has been uploaded yet, or the previous dataset has expired after 7 days.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // Data exists - show time remaining
  const timeRemaining = retentionStatus.timeRemaining;
  const isExpiringSoon = Number(timeRemaining) < 24 * 60 * 60 * 1_000_000_000; // Less than 1 day

  return (
    <Alert className={isExpiringSoon 
      ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-600 dark:border-yellow-900" 
      : "bg-primary/5 border-primary/20"
    }>
      <Clock className={`h-5 w-5 ${isExpiringSoon ? 'text-yellow-600' : 'text-primary'}`} />
      <AlertTitle className="text-foreground font-semibold flex items-center gap-2">
        Live Environment
        <Badge className="bg-primary hover:bg-primary/90">Always Online</Badge>
      </AlertTitle>
      <AlertDescription className="text-sm space-y-1">
        <p className="text-muted-foreground">
          Your app is deployed to Live and will remain online permanently. Your current dataset will be retained for <strong className="text-foreground">{formatTimeRemaining(timeRemaining)}</strong>.
        </p>
        {isExpiringSoon && (
          <p className="text-yellow-700 dark:text-yellow-400 font-medium">
            ⚠️ Dataset expires soon. Upload a new dataset to reset the 7-day retention period.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
