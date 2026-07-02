import React, { useState, useEffect, useRef } from "react";
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from "@/components/ui/popover";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Database, 
  RefreshCw, 
  Terminal, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Server,
  Sparkles
} from "lucide-react";
import { API_BASE_URL, setApiBaseUrl } from "@/config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && 
  (window.navigator.userAgent.toLowerCase().includes('electron') || (window as any).electronAPI);

export function BackendStatusIndicator() {
  const [status, setStatus] = useState<"ready" | "starting" | "stopped" | "error">("stopped");
  const [latency, setLatency] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [customUrl, setCustomUrl] = useState(API_BASE_URL);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Ping the server to check connectivity and latency
  const checkConnection = async () => {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000);
      
      const res = await fetch(API_BASE_URL + '/', {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(id);
      
      if (res.ok || res.status === 404) {
        setLatency(Date.now() - start);
        setStatus("ready");
      } else {
        throw new Error("Server error");
      }
    } catch (e) {
      setLatency(null);
      // Keep starting state during bootup, otherwise mark as stopped
      setStatus(prev => prev === "starting" ? "starting" : "stopped");
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();

    // Setup periodic ping
    const interval = setInterval(checkConnection, 5000);

    // Electron specific listeners
    let unsubscribeLog: (() => void) | undefined;
    let unsubscribeStatus: (() => void) | undefined;

    if (isElectron && (window as any).electronAPI) {
      const api = (window as any).electronAPI;
      
      // Get current status from main process
      // If port resolves, let's ping it
      if (api.onBackendStatus) {
        unsubscribeStatus = api.onBackendStatus((data: any) => {
          const electronStatus = typeof data === 'string' ? data : data.status;
          const electronPort = typeof data === 'object' ? data.port : null;
          
          setStatus(electronStatus);
          if (electronPort) {
            const newUrl = `http://127.0.0.1:${electronPort}`;
            setApiBaseUrl(newUrl);
            setCustomUrl(newUrl);
          }
          if (electronStatus === 'ready') {
            checkConnection();
          }
        });
      }

      if (api.onBackendLog) {
        unsubscribeLog = api.onBackendLog((logLine: string) => {
          setLogs(prev => {
            const next = [...prev, logLine];
            return next.slice(-200); // rolling window
          });
        });
      }
    }

    return () => {
      clearInterval(interval);
      if (unsubscribeLog) unsubscribeLog();
      if (unsubscribeStatus) unsubscribeStatus();
    };
  }, []);

  // Scroll terminal logs to bottom
  useEffect(() => {
    if (isConsoleOpen && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isConsoleOpen]);

  const handleSaveUrl = () => {
    try {
      new URL(customUrl);
      setApiBaseUrl(customUrl);
      toast.success("API Base URL updated successfully!");
      checkConnection();
    } catch (e) {
      toast.error("Please enter a valid URL (e.g. http://127.0.0.1:5000)");
    }
  };

  const handleRestartBackend = async () => {
    if (!isElectron || !(window as any).electronAPI?.restartBackend) return;
    
    setIsRestarting(true);
    setStatus("starting");
    setLogs(prev => [...prev, `[Renderer] Requesting backend restart...`]);
    
    try {
      const result = await (window as any).electronAPI.restartBackend();
      toast.success("Restart command sent successfully!");
    } catch (e: any) {
      toast.error("Failed to restart backend process: " + e.message);
      setStatus("error");
    } finally {
      setIsRestarting(false);
    }
  };

  // Color mapping based on backend status
  const statusColors = {
    ready: {
      dot: "bg-emerald-500 shadow-emerald-500/50",
      bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      label: "Connected"
    },
    starting: {
      dot: "bg-amber-500 animate-pulse shadow-amber-500/50",
      bg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      label: "Starting..."
    },
    stopped: {
      dot: "bg-rose-500 shadow-rose-500/50",
      bg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      label: "Disconnected"
    },
    error: {
      dot: "bg-rose-600 animate-ping shadow-rose-600/50",
      bg: "bg-rose-600/10 text-rose-600 border-rose-600/20",
      label: "Server Error"
    }
  };

  const currentConfig = statusColors[status] || statusColors.stopped;

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/40 hover:bg-muted/80 border border-border/60 transition-all duration-200">
            {/* Glowing Indicator Dot */}
            <span className={cn("relative flex h-2 w-2 rounded-full", currentConfig.dot)}>
              {status === "ready" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground tracking-wide uppercase">
              {isElectron ? "Offline API" : "Backend"}
            </span>
          </button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-5 bg-card/95 border border-border/80 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="space-y-4">
            {/* Status Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold">API Connection</span>
              </div>
              <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border", currentConfig.bg)}>
                {currentConfig.label}
              </span>
            </div>

            {/* Connection Info */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5" /> Type:</span>
                <span className="font-semibold text-foreground">
                  {isElectron ? "Desktop Offline Server" : "Web Environment"}
                </span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Latency:</span>
                <span className="font-semibold text-foreground">
                  {latency !== null ? `${latency} ms` : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> Platform:</span>
                <span className="font-semibold text-foreground">
                  {isElectron ? "Electron IPC" : "Web Browser"}
                </span>
              </div>
            </div>

            {/* URL Override Input */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                API Base URL
              </label>
              <div className="flex gap-2">
                <Input 
                  value={customUrl} 
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="h-8 text-xs font-mono rounded-lg border-border bg-background"
                  placeholder="http://127.0.0.1:5000"
                />
                <Button 
                  onClick={handleSaveUrl} 
                  size="sm" 
                  className="h-8 rounded-lg text-xs"
                >
                  Save
                </Button>
              </div>
            </div>

            {/* Electron Action Controls */}
            {isElectron && (
              <div className="space-y-2 pt-3 border-t border-border/40 flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 h-9 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-muted border-border/80"
                    onClick={handleRestartBackend}
                    disabled={isRestarting}
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5 text-muted-foreground", isRestarting && "animate-spin")} />
                    Restart Server
                  </Button>
                  
                  <Dialog open={isConsoleOpen} onOpenChange={setIsConsoleOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="flex-1 h-9 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-muted"
                      >
                        <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
                        Live Logs
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-6 bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-3xl overflow-hidden font-mono shadow-2xl">
                      <DialogHeader className="border-b border-zinc-850 pb-4 shrink-0">
                        <DialogTitle className="text-base font-bold flex items-center gap-2 text-zinc-100">
                          <Terminal className="w-5 h-5 text-purple-400" />
                          Offline Backend Console Server Logs
                        </DialogTitle>
                      </DialogHeader>
                      
                      {/* Terminal View */}
                      <div className="flex-1 overflow-y-auto bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80 my-4 text-xs space-y-1.5 scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-800">
                        {logs.length === 0 ? (
                          <div className="text-zinc-500 italic py-8 text-center flex flex-col items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5 animate-pulse text-zinc-600" />
                            No console logs received yet. Operations will appear here as they run.
                          </div>
                        ) : (
                          logs.map((log, index) => {
                            let textClass = "text-zinc-300";
                            if (log.includes("[Error]") || log.includes("Error:") || log.toLowerCase().includes("fail")) {
                              textClass = "text-red-400 font-semibold";
                            } else if (log.includes("[Backend]") || log.includes("Server is running")) {
                              textClass = "text-emerald-400 font-semibold";
                            } else if (log.includes("[Renderer]")) {
                              textClass = "text-purple-400";
                            }
                            return (
                              <div key={index} className={cn("leading-relaxed break-all", textClass)}>
                                {log}
                              </div>
                            );
                          })
                        )}
                        <div ref={consoleEndRef} />
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-2 border-t border-zinc-850 shrink-0">
                        <span>Offline Engine Version: V3 (Electron Sandbox)</span>
                        <div className="flex gap-4">
                          <span>Active Port: {API_BASE_URL.split(':').pop()}</span>
                          <button 
                            onClick={() => setLogs([])}
                            className="hover:underline text-zinc-400 font-bold"
                          >
                            Clear Console
                          </button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
