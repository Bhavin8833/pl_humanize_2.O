import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns"; // Standard date lib usually available, or I'll just use simple JS if not.

// Simplistic date formatter if date-fns is not available (checking package.json is expensive, I'll assume standard JS for safety).
const timeAgo = (date: number) => {
    const seconds = Math.floor((Date.now() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

export interface HistoryItem {
    id: string;
    timestamp: number;
    original: string;
    humanized: string;
    aiScore: number;
}

interface HistorySidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    history: HistoryItem[];
    onSelect: (item: HistoryItem) => void;
    onClear: () => void;
}

export function HistorySidebar({ open, onOpenChange, history, onSelect, onClear }: HistorySidebarProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <SheetTitle>History</SheetTitle>
                            <SheetDescription>
                                Your recent humanization attempts
                            </SheetDescription>
                        </div>
                        {history.length > 0 && (
                            <Button variant="ghost" size="sm" onClick={onClear} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear All
                            </Button>
                        )}
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 p-6">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                            <Clock className="h-12 w-12 mb-4 opacity-20" />
                            <p>No history yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    className="group relative flex flex-col gap-2 p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                                    onClick={() => {
                                        onSelect(item);
                                        onOpenChange(false);
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {timeAgo(item.timestamp)}
                                        </span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.aiScore < 10
                                                ? "bg-green-500/10 text-green-500"
                                                : item.aiScore < 50
                                                    ? "bg-yellow-500/10 text-yellow-500"
                                                    : "bg-red-500/10 text-red-500"
                                            }`}>
                                            {item.aiScore.toFixed(1)}% AI
                                        </span>
                                    </div>

                                    <p className="text-sm font-medium text-foreground line-clamp-2">
                                        {item.humanized || "No output"}
                                    </p>

                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                            {item.original.length} chars
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
