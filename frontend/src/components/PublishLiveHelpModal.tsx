import { X, Rocket, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PublishLiveHelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PublishLiveHelpModal({ open, onOpenChange }: PublishLiveHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Publish Your App Live</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Make your app permanently available on the web
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="px-6 py-4 space-y-6">
            {/* Draft vs Live Explanation */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Draft vs Live Apps
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 border border-muted-foreground/20">
                  <p className="font-medium text-foreground">Draft Apps:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Temporary preview environment for testing</li>
                    <li>Automatically shut down when unused (pages close automatically)</li>
                    <li>Perfect for development and testing changes</li>
                    <li>Can be rebuilt anytime without losing your work</li>
                  </ul>
                </div>
                <div className="bg-primary/5 rounded-lg p-4 space-y-2 border border-primary/20">
                  <p className="font-medium text-foreground">Live Apps:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Permanent deployment on the Internet Computer</li>
                    <li>Never shut down — stays online continuously</li>
                    <li>Custom domain name (your-slug.caffeine.xyz)</li>
                    <li>Production-ready and shareable with anyone</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How to Publish */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <Rocket className="w-4 h-4 text-primary" />
                How to Publish Live
              </h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Open the Caffeine platform</p>
                    <p className="text-xs mt-1">Navigate to your project dashboard in the Caffeine interface</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Click "Publish to Live"</p>
                    <p className="text-xs mt-1">Find the publish button in your project controls</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Choose your domain slug</p>
                    <p className="text-xs mt-1">Pick a unique name for your app's URL (see rules below)</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs">
                    4
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Confirm and deploy</p>
                    <p className="text-xs mt-1">Review your settings and start the deployment (usually takes 1-2 minutes)</p>
                  </div>
                </li>
              </ol>
            </section>

            {/* How to Verify Live */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-primary" />
                How to Verify Your Live Deployment
              </h3>
              <Alert className="bg-primary/5 border-primary/20 mb-3">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  <p className="font-medium text-foreground mb-2">Important: Test in a fresh browser session</p>
                  <p className="text-muted-foreground text-xs">
                    To confirm your Live deployment is truly permanent and accessible to everyone, test it in a fresh browser session (incognito/private window or different browser).
                  </p>
                </AlertDescription>
              </Alert>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Open your Live URL</p>
                    <p className="text-xs mt-1">Visit your-slug.caffeine.xyz in a new browser tab or incognito window</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Check the Live indicator</p>
                    <p className="text-xs mt-1">Look for the green "Live" badge in the header (not "Draft")</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Test core functionality</p>
                    <p className="text-xs mt-1">Upload a dataset, search for parts, and verify everything works</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs">
                    4
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Verify permanence</p>
                    <p className="text-xs mt-1">Close the tab, wait a few minutes, then reopen the Live URL — it should still work without any shutdowns</p>
                  </div>
                </li>
              </ol>
            </section>

            {/* Domain Slug Rules */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">Domain Slug Requirements</h3>
              <Alert className="border-muted-foreground/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <p className="font-medium mb-2">Your domain slug must follow these rules:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                    <li>Between <strong className="text-foreground">5 and 50 characters</strong> long</li>
                    <li>Only <strong className="text-foreground">letters, numbers, and hyphens</strong> allowed</li>
                    <li>No spaces or special characters</li>
                    <li>Must be unique across all Caffeine apps</li>
                  </ul>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-foreground">Examples:</p>
                    <p className="text-xs text-muted-foreground">✅ spare-parts-finder</p>
                    <p className="text-xs text-muted-foreground">✅ my-inventory-app</p>
                    <p className="text-xs text-muted-foreground">✅ parts123</p>
                    <p className="text-xs text-destructive">❌ spare_parts (underscores not allowed)</p>
                    <p className="text-xs text-destructive">❌ app (too short, less than 5 characters)</p>
                  </div>
                </AlertDescription>
              </Alert>
            </section>

            {/* Troubleshooting */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                Troubleshooting
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 border border-muted-foreground/20">
                  <p className="font-medium text-foreground">
                    "Something went wrong with the deployment"
                  </p>
                  <p className="text-muted-foreground text-xs">
                    This generic error can happen for several reasons. Try these steps:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground text-xs">
                    <li>
                      <strong className="text-foreground">Check your slug:</strong> Make sure it follows the 5-50 character rule and uses only letters, numbers, and hyphens
                    </li>
                    <li>
                      <strong className="text-foreground">Try a different slug:</strong> Your chosen name might already be taken
                    </li>
                    <li>
                      <strong className="text-foreground">Rebuild your draft first:</strong> Sometimes rebuilding the draft before publishing helps
                    </li>
                    <li>
                      <strong className="text-foreground">Wait and retry:</strong> Temporary platform issues may resolve themselves
                    </li>
                  </ul>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 border border-muted-foreground/20">
                  <p className="font-medium text-foreground">Still having issues?</p>
                  <p className="text-muted-foreground text-xs">
                    Contact Caffeine support through the platform dashboard for assistance with persistent deployment problems.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t border-border flex justify-end">
          <Button onClick={() => onOpenChange(false)} variant="default">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
