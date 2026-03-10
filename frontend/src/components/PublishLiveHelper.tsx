import { useState } from 'react';
import { ExternalLink, Copy, CheckCircle2, AlertCircle, Rocket, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateSlug, normalizeSlug, generateLiveUrl } from '@/lib/publishLive/slug';
import { isLiveEnvironment } from '@/lib/publishLive/environment';

export default function PublishLiveHelper() {
  const [slug, setSlug] = useState('');
  const [showUrl, setShowUrl] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const isLive = isLiveEnvironment();

  const validation = validateSlug(slug);
  const normalizedSlug = slug ? normalizeSlug(slug) : '';
  const liveUrl = normalizedSlug && validation.isValid ? generateLiveUrl(normalizedSlug) : '';

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setShowUrl(false);
    setCopied(false);
  };

  const handleGenerateUrl = () => {
    if (validation.isValid) {
      setShowUrl(true);
    }
  };

  const handleCopyUrl = async () => {
    if (!liveUrl) return;
    
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(liveUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        const input = document.createElement('input');
        input.value = liveUrl;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleOpenUrl = () => {
    if (!liveUrl) return;
    
    try {
      if (typeof window !== 'undefined' && window.open) {
        window.open(liveUrl, '_blank', 'noopener,noreferrer');
      } else {
        const link = document.createElement('a');
        link.href = liveUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  // If already on Live, show "Already Live" message
  if (isLive) {
    return (
      <div className="space-y-4">
        <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <p className="text-sm font-medium text-foreground mb-2">✓ You're on Live!</p>
            <p className="text-xs text-muted-foreground mb-3">
              This is your permanent Live deployment at <strong>{typeof window !== 'undefined' ? window.location.hostname : ''}</strong>. Your app stays online continuously and will not shut down.
            </p>
            <p className="text-xs text-muted-foreground">
              Switch to the <strong>Verify</strong> tab to run the deployment checklist and confirm everything is working correctly.
            </p>
          </AlertDescription>
        </Alert>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <p className="font-medium text-foreground mb-2">Need to make changes?</p>
            <p className="text-muted-foreground">
              Return to your Draft environment in the Caffeine platform to make updates, then rebuild and publish again to update the Live version.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Draft environment: show publish instructions
  return (
    <div className="space-y-4">
      <Alert className="bg-primary/5 border-primary/20">
        <Rocket className="h-4 w-4 text-primary" />
        <AlertDescription className="text-xs space-y-3">
          <div>
            <p className="font-semibold text-foreground mb-1">Ready to publish to Live?</p>
            <p className="text-muted-foreground">
              Publishing creates a permanent production URL that stays online continuously. Follow these steps:
            </p>
          </div>
          <ol className="list-decimal list-inside space-y-2 ml-2 text-muted-foreground">
            <li>
              <strong className="text-foreground">Choose your domain slug</strong> below (5-50 characters)
            </li>
            <li>
              <strong className="text-foreground">Go to the Caffeine platform</strong> and click "Publish to Live"
            </li>
            <li>
              <strong className="text-foreground">Enter your slug</strong> and confirm the deployment
            </li>
            <li>
              <strong className="text-foreground">Wait 1-2 minutes</strong> for deployment to complete
            </li>
            <li>
              <strong className="text-foreground">Open your Live URL</strong> to verify (see Verify tab)
            </li>
          </ol>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="slug-input" className="text-sm font-medium">
          Choose Your Domain Slug
        </Label>
        <div className="flex gap-2">
          <Input
            id="slug-input"
            type="text"
            placeholder="my-spare-parts-app"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className={
              slug && !validation.isValid
                ? 'border-destructive focus-visible:ring-destructive'
                : ''
            }
          />
          <Button
            onClick={handleGenerateUrl}
            disabled={!validation.isValid}
            size="sm"
            variant="outline"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
        {slug && !validation.isValid && validation.error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {validation.error}
          </p>
        )}
        {slug && validation.isValid && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-primary" />
            Valid slug - ready to use
          </p>
        )}
      </div>

      {showUrl && liveUrl && (
        <Alert className="bg-primary/5 border-primary/20">
          <Rocket className="h-4 w-4 text-primary" />
          <AlertDescription>
            <p className="text-sm font-medium text-foreground mb-2">Your Live URL will be:</p>
            <div className="flex items-center gap-2 mb-3">
              <code className="flex-1 text-xs bg-background/50 px-3 py-2 rounded border border-border font-mono">
                {liveUrl}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyUrl}
                className="flex-shrink-0"
                title="Copy URL"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleOpenUrl}
                className="flex-shrink-0"
                title="Open URL (after publishing)"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
            <div className="bg-background/50 rounded p-2 space-y-1 text-xs">
              <p className="font-medium text-foreground">Next steps:</p>
              <ol className="list-decimal list-inside space-y-0.5 ml-2 text-muted-foreground">
                <li>Copy this URL for reference</li>
                <li>Go to the Caffeine platform and publish with slug: <code className="text-foreground font-mono">{normalizedSlug}</code></li>
                <li>After deployment completes, open the URL above</li>
                <li>Verify the green "Live" badge appears in the header</li>
                <li>Run the verification checklist (Verify tab)</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <p className="font-medium text-foreground mb-1">Important:</p>
          <p className="text-muted-foreground">
            Publishing must be done through the <strong>Caffeine platform</strong>, not from within this app. 
            This helper generates your Live URL and provides guidance. Click the <strong>?</strong> icon above for detailed instructions.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
