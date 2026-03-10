import { Package, Rocket, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PublishLiveHelpModal from './PublishLiveHelpModal';
import PublishLiveHelper from './PublishLiveHelper';
import LiveSmokeTestPanel from './LiveSmokeTestPanel';
import { isLiveEnvironment, isDraftEnvironment } from '@/lib/publishLive/environment';

export default function AppHeader() {
  const [showPublishHelp, setShowPublishHelp] = useState(false);
  const [showPublishHelper, setShowPublishHelper] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('publish');
  
  const isLive = isLiveEnvironment();
  const isDraft = isDraftEnvironment();

  // Default to "verify" tab when on Live, "publish" when on Draft
  useEffect(() => {
    if (isLive) {
      setActiveTab('verify');
    } else {
      setActiveTab('publish');
    }
  }, [isLive]);

  return (
    <>
      <header className="border-b border-border bg-card/95 sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Spare Parts Finder</h1>
                <p className="text-xs text-muted-foreground">Search your inventory with ease</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isDraft && (
                <Badge variant="outline" className="border-yellow-600 text-yellow-700 dark:text-yellow-400 font-semibold">
                  Draft
                </Badge>
              )}
              {isLive && (
                <Badge className="bg-green-600 hover:bg-green-700 border-green-600 font-semibold shadow-sm">
                  ✓ Live
                </Badge>
              )}
              {!isLive && !isDraft && (
                <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
                  Dev
                </Badge>
              )}
              <Popover open={showPublishHelper} onOpenChange={setShowPublishHelper}>
                <PopoverTrigger asChild>
                  <Button
                    variant={isLive ? "outline" : "default"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {isLive ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="hidden sm:inline">Verify Live</span>
                        <span className="sm:hidden">Verify</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4" />
                        <span className="hidden sm:inline">Publish Live</span>
                        <span className="sm:hidden">Publish</span>
                      </>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[480px] p-0" align="end">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b">
                      <div className="flex items-center gap-3 flex-1">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="publish" className="text-xs">
                            <Rocket className="w-3 h-3 mr-1.5" />
                            Publish
                          </TabsTrigger>
                          <TabsTrigger value="verify" className="text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1.5" />
                            Verify
                          </TabsTrigger>
                        </TabsList>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPublishHelp(true)}
                        className="h-auto p-1 ml-2"
                        title="Help & Instructions"
                      >
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                    
                    <TabsContent value="publish" className="p-4 m-0">
                      <PublishLiveHelper />
                    </TabsContent>
                    
                    <TabsContent value="verify" className="p-4 m-0">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-sm mb-1">Live Verification Checklist</h3>
                          <p className="text-xs text-muted-foreground">
                            {isLive 
                              ? 'Run automated checks and complete manual verification steps'
                              : 'Open your Live URL to run verification checks'
                            }
                          </p>
                        </div>
                        <LiveSmokeTestPanel onClose={() => setShowPublishHelper(false)} />
                      </div>
                    </TabsContent>
                  </Tabs>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </header>

      <PublishLiveHelpModal 
        open={showPublishHelp} 
        onOpenChange={setShowPublishHelp} 
      />
    </>
  );
}
