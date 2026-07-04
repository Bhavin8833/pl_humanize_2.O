import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { CircularGauge } from "@/components/ui/CircularGauge";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Wand2, Loader2, RefreshCw, Sparkles, Zap, Upload, History as HistoryIcon, FileText, CheckCircle2, AlertCircle, Settings, Clock, FileDown } from "lucide-react";
import { HistorySidebar, HistoryItem } from "@/components/HistorySidebar";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { API_BASE_URL } from "@/config";
import { 
  DocBlock, 
  parseHtmlToBlocks, 
  parseTextToBlocks, 
  mapParagraphsToBlocks, 
  blocksToDisplayString,
  generateDocxFromBlocks, 
  generatePdfFromBlocks, 
  downloadBlob 
} from "@/lib/documentGenerator";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface HumanizeResult {
  humanized_text: string;
  text?: string;
  ai_score: number;
  aiScore?: number;
  human_score: number;
  humanScore?: number;
  passes_completed: string[];
  mode: string;
  strength?: string;
  loops: number;
  score_history: number[];
  processingTime: number;
  auto_stop: boolean;
  warning?: string;
}

interface DetectionResult {
  ai_score: number;
  human_score: number;
}

const SAMPLE_TEXT = `Artificial intelligence has revolutionized the way we interact with technology. It is important to note that AI systems are becoming increasingly sophisticated. Furthermore, these technologies are being integrated into various sectors. Moreover, the implications of AI development are far-reaching. Consequently, businesses must adapt to remain competitive. Therefore, understanding AI is crucial for success. Additionally, ethical considerations play a vital role in AI development. In conclusion, AI will continue to shape our future in profound ways.`;

const MAX_SMART_HUMANIZE_TRIES = 20;
const AI_THRESHOLD = 10;

export default function Humanize() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState<string>("");
  const [mode, setMode] = useState("general");
  const [strength, setStrength] = useState("balanced");
  const [autoCopy, setAutoCopy] = useState(false);
  const [result, setResult] = useState<HumanizeResult | null>(null);

  // Live AI Detection states
  const [inputDetection, setInputDetection] = useState<DetectionResult | null>(null);
  const [outputDetection, setOutputDetection] = useState<DetectionResult | null>(null);
  const [isDetectingInput, setIsDetectingInput] = useState(false);
  const [isDetectingOutput, setIsDetectingOutput] = useState(false);

  // Smart Humanize states
  const [smartHumanizeAttempts, setSmartHumanizeAttempts] = useState(0);
  const [isSmartHumanizing, setIsSmartHumanizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [uploadedFileType, setUploadedFileType] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [inputBlocks, setInputBlocks] = useState<DocBlock[]>([]);
  const [outputBlocks, setOutputBlocks] = useState<DocBlock[]>([]);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem("humanize_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem("humanize_history", JSON.stringify(history));
  }, [history]);

  const addToHistory = (original: string, humanized: string, aiScore: number) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      original,
      humanized,
      aiScore,
    };
    setHistory((prev) => [newItem, ...prev].slice(0, 50)); // Keep last 50
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setInputText(item.original);
    setOutputText(item.humanized);
    setUploadedFileType(null);
    setUploadedFileName("");
    setInputBlocks(parseTextToBlocks(item.original));
    setOutputBlocks(parseTextToBlocks(item.humanized));
    setResult({
      humanized_text: item.humanized,
      ai_score: item.aiScore,
      human_score: 100 - item.aiScore,
      passes_completed: [],
      mode: "history",
      strength: "balanced",
      loops: 1,
      score_history: [item.aiScore],
      processingTime: 0,
      auto_stop: true,
    });
    toast.success("History item loaded");
  };

  const handleClearHistory = () => {
    setHistory([]);
    toast.success("History cleared");
  };

  // Debounced AI detection for input text
  useEffect(() => {
    const detectAI = async () => {
      if (!inputText.trim() || inputText.length < 100) {
        setInputDetection(null);
        return;
      }

      setIsDetectingInput(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/ai-detector`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText }),
        });

        if (!response.ok) throw new Error("Detection failed");

        const data = await response.json();

        setInputDetection({
          ai_score: data.ai_score ?? data.aiScore ?? 0,
          human_score: data.human_score ?? data.humanScore ?? 100,
        });
      } catch (error) {
        console.error("Input detection error:", error);
      } finally {
        setIsDetectingInput(false);
      }
    };

    const timeoutId = setTimeout(detectAI, 800);
    return () => clearTimeout(timeoutId);
  }, [inputText]);

  // Detect AI for output text when it changes
  useEffect(() => {
    const detectAI = async () => {
      if (!outputText.trim() || outputText.length < 100) {
        setOutputDetection(null);
        return;
      }

      setIsDetectingOutput(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/ai-detector`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: outputText }),
        });

        if (!response.ok) throw new Error("Detection failed");

        const data = await response.json();

        setOutputDetection({
          ai_score: data.ai_score ?? data.aiScore ?? 0,
          human_score: data.human_score ?? data.humanScore ?? 100,
        });
      } catch (error) {
        console.error("Output detection error:", error);
      } finally {
        setIsDetectingOutput(false);
      }
    };

    const timeoutId = setTimeout(detectAI, 500);
    return () => clearTimeout(timeoutId);
  }, [outputText]);

  const wordCount = (text: string) =>
    text.trim() ? text.trim().split(/\s+/).length : 0;

  const readPdfFile = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      return fullText;
    } catch (e) {
      console.error("PDF read error:", e);
      throw new Error("Could not parse PDF");
    }
  };

  const readDocxFileHtml = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      return result.value;
    } catch (e) {
      console.error("DOCX HTML read error:", e);
      throw new Error("Could not parse Word document styles");
    }
  };

  const processFile = async (file: File) => {
    if (!file) return;

    const fileType = file.name.split('.').pop()?.toLowerCase();

    try {
      let text = "";
      let blocks: DocBlock[] = [];
      
      if (fileType === 'pdf') {
        text = await readPdfFile(file);
        blocks = parseTextToBlocks(text);
      } else if (fileType === 'docx') {
        const html = await readDocxFileHtml(file);
        blocks = parseHtmlToBlocks(html);
        text = blocksToDisplayString(blocks);
      } else if (fileType === 'txt' || fileType === 'md') {
        text = await file.text();
        blocks = parseTextToBlocks(text);
      } else {
        throw new Error("Unsupported file type");
      }

      if (!text.trim()) {
        throw new Error("File appears to be empty");
      }

      setInputText(text);
      setOutputText("");
      setResult(null);
      setUploadedFileType(fileType || null);
      setUploadedFileName(file.name);
      setInputBlocks(blocks);
      setOutputBlocks([]);
      toast.success("File loaded successfully");
    } catch (error) {
      console.error("File processing error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to read file");
    }
  };

  const handleTrySample = () => {
    setInputText(SAMPLE_TEXT);
    setOutputText("");
    setResult(null);
    setUploadedFileType(null);
    setUploadedFileName("");
    setInputBlocks(parseTextToBlocks(SAMPLE_TEXT));
    setOutputBlocks([]);
    toast.success("Sample text loaded");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
      // Reset input so same file can be selected again if needed
      e.target.value = '';
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
      setOutputText("");
      setResult(null);
      toast.success("Text pasted from clipboard");
    } catch {
      toast.error("Could not access clipboard");
    }
  };

  const humanizeOnce = async (textToProcess: string): Promise<{ text: string; score: number } | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/humanize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToProcess,
          mode,
          strength,
          action: "humanize",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to humanize");
      }

      const data = await response.json();

      if (data.warning) {
        toast.warning(data.warning);
      }

      const humanizeResult = data as HumanizeResult;
      const finalText = humanizeResult.humanized_text || humanizeResult.text || "";

      return { text: finalText, score: 0 };
    } catch (error) {
      console.error("Humanize error:", error);
      const message = error instanceof Error ? error.message : "Failed to humanize";
      if (message.includes("Rate") || message.includes("429")) {
        toast.error("Rate limited. Please wait a moment and try again.");
      } else {
        toast.error(message);
      }
      return null;
    }
  };

  const detectAIScore = async (text: string): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-detector`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("Detection failed");
      const data = await response.json();

      return data.ai_score ?? data.aiScore ?? 0;
    } catch (error) {
      console.error("Detection error:", error);
      return 100;
    }
  };

  const handleHumanize = async (action: "humanize" | "rehumanize" = "humanize") => {
    const textToProcess = action === "rehumanize" ? outputText : inputText;

    if (!textToProcess.trim()) {
      toast.error(action === "rehumanize" ? "No output to re-humanize" : "Please enter some text to humanize");
      return;
    }

    setIsProcessing(true);
    setProcessingAction(action);

    try {
      const blocksToProcess = getBlocksForProcessing(action);
      const plainTextPayload = blocksToProcess.map(b => b.text).join('\n\n');

      const result = await humanizeOnce(plainTextPayload);
      if (!result) return;

      const parsedOutputBlocks = mapParagraphsToBlocks(result.text, blocksToProcess);
      setOutputBlocks(parsedOutputBlocks);

      const cleanText = blocksToDisplayString(parsedOutputBlocks);

      setOutputText(cleanText);

      // Detect AI score for the humanized output
      const aiScore = await detectAIScore(cleanText);

      setResult({
        humanized_text: cleanText,
        ai_score: aiScore,
        human_score: 100 - aiScore,
        passes_completed: [],
        mode,
        strength,
        loops: 1,
        score_history: [aiScore],
        processingTime: 0,
        auto_stop: aiScore < AI_THRESHOLD,
      });

      addToHistory(textToProcess, cleanText, aiScore);

      if (aiScore < AI_THRESHOLD) {
        toast.success(`Done! AI score: ${aiScore.toFixed(1)}%`);
      } else {
        toast.success(`Completed. AI score: ${aiScore.toFixed(1)}%`);
      }

      if (autoCopy) {
        navigator.clipboard.writeText(cleanText);
        toast.success("Auto-copied result to clipboard!");
      }
    } finally {
      setIsProcessing(false);
      setProcessingAction("");
    }
  };

  const handleSmartHumanize = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to humanize");
      return;
    }

    setIsSmartHumanizing(true);
    setSmartHumanizeAttempts(0);
    setProcessingAction("smart");

    let currentBlocks = getBlocksForProcessing("humanize");
    let currentPlain = currentBlocks.map(b => b.text).join('\n\n');
    let bestText = inputText;
    let bestBlocks = currentBlocks;
    let minScore = 100;
    let attempts = 0;
    let currentScore = 100;

    try {
      while (attempts < MAX_SMART_HUMANIZE_TRIES) {
        attempts++;
        setSmartHumanizeAttempts(attempts);

        toast.info(`Smart Humanize: Attempt ${attempts}/${MAX_SMART_HUMANIZE_TRIES}... (Best: ${minScore.toFixed(0)}%)`);

        const result = await humanizeOnce(currentPlain);
        if (!result) break;

        const parsedOutputBlocks = mapParagraphsToBlocks(result.text, currentBlocks);
        
        const cleanText = blocksToDisplayString(parsedOutputBlocks);

        setOutputText(cleanText);
        setOutputBlocks(parsedOutputBlocks);

        // Detect AI score
        currentScore = await detectAIScore(cleanText);

        // Track Best Score
        if (currentScore < minScore) {
          minScore = currentScore;
          bestText = cleanText;
          bestBlocks = parsedOutputBlocks;
        }

        setResult({
          humanized_text: cleanText,
          ai_score: currentScore,
          human_score: 100 - currentScore,
          passes_completed: [],
          mode,
          strength,
          loops: attempts,
          score_history: [],
          processingTime: 0,
          auto_stop: currentScore < 2,
        });

        if (currentScore < 2) {
          addToHistory(inputText, cleanText, currentScore);
          toast.success(`Success! Dropped to ${currentScore.toFixed(1)}% AI in ${attempts} tries.`);

          if (autoCopy) {
            navigator.clipboard.writeText(cleanText);
            toast.success("Auto-copied result to clipboard!");
          }
          break;
        }

        // Prepare for the next loop
        currentBlocks = parsedOutputBlocks;
        currentPlain = parsedOutputBlocks.map(b => b.text).join('\n\n');

        if (attempts >= MAX_SMART_HUMANIZE_TRIES) {
          // RESTORE BEST RESULT
          setOutputText(bestText);
          setOutputBlocks(bestBlocks);
          setResult({
            humanized_text: bestText,
            ai_score: minScore,
            human_score: 100 - minScore,
            passes_completed: [],
            mode,
            strength,
            loops: attempts,
            score_history: [],
            processingTime: 0,
            auto_stop: false, // timed out
          });

          toast.warning(`Reached limit. Reverting to BEST result: ${minScore.toFixed(1)}%`);

          if (autoCopy) {
            navigator.clipboard.writeText(bestText);
          }
        }
      }
    } finally {
      setIsSmartHumanizing(false);
      setSmartHumanizeAttempts(0);
      setProcessingAction("");
    }
  };

  const handleCopy = () => {
    if (!outputText) {
      toast.error("No output to copy");
      return;
    }
    navigator.clipboard.writeText(outputText);
    toast.success("Copied to clipboard");
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setResult(null);
    setInputDetection(null);
    setOutputDetection(null);
    setUploadedFileType(null);
    setUploadedFileName("");
    setInputBlocks([]);
    setOutputBlocks([]);
  };

  const getBlocksForProcessing = (action: "humanize" | "rehumanize"): DocBlock[] => {
    if (action === "rehumanize") {
      if (outputBlocks.length > 0) {
        return outputBlocks;
      }
      return parseTextToBlocks(outputText);
    }
    
    const joinedInput = inputBlocks.map(b => b.text).join('\n\n');
    const normalizedInputText = inputText.replace(/\s+/g, ' ').trim();
    const normalizedJoined = joinedInput.replace(/\s+/g, ' ').trim();
    
    if (inputBlocks.length > 0 && normalizedInputText === normalizedJoined) {
      return inputBlocks;
    }
    
    return parseTextToBlocks(inputText);
  };

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  const handleDownloadPdf = async () => {
    if (!outputText) {
      toast.error("No output text to download");
      return;
    }
    setIsDownloadingPdf(true);
    try {
      let filename = "humanized.pdf";
      if (uploadedFileName) {
        const baseName = uploadedFileName.substring(0, uploadedFileName.lastIndexOf('.')) || uploadedFileName;
        filename = `${baseName}_humanized.pdf`;
      }
      
      const blocks = outputBlocks.length > 0 ? outputBlocks : parseTextToBlocks(outputText);
      const blob = await generatePdfFromBlocks(blocks);
      downloadBlob(blob, filename);
      toast.success(`Downloaded as PDF: ${filename}`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF document");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!outputText) {
      toast.error("No output text to download");
      return;
    }
    setIsDownloadingDocx(true);
    try {
      let filename = "humanized.docx";
      if (uploadedFileName) {
        const baseName = uploadedFileName.substring(0, uploadedFileName.lastIndexOf('.')) || uploadedFileName;
        filename = `${baseName}_humanized.docx`;
      }

      const blocks = outputBlocks.length > 0 ? outputBlocks : parseTextToBlocks(outputText);
      const blob = await generateDocxFromBlocks(blocks);
      downloadBlob(blob, filename);
      toast.success(`Downloaded as Word: ${filename}`);
    } catch (error) {
      console.error("Word generation failed:", error);
      toast.error("Failed to generate Word document");
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 10) return "text-green-500";
    if (score < 30) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score < 10) return "bg-green-500/10 border-green-500/20";
    if (score < 30) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  return (
    <Layout>
      <div className="container py-6 md:py-16 relative">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-10 mt-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Advanced AI Bypass Technology</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Humanize AI Content <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text gradient-primary-lr">
                Instantly & Naturally
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform robotic AI text into natural human writing that flawlessly bypasses all major AI detectors.
            </p>
          </div>

          {/* Main Two-Panel Layout */}
          <div className="bg-card/50 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-border shadow-2xl overflow-hidden animate-slide-up relative z-10">
            {/* Ambient Glow */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            
            <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
              {/* Input Panel */}
              <div className="p-4 md:p-8 flex flex-col relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tl-3xl lg:rounded-l-3xl"></div>
                
                <div className="flex flex-wrap items-center justify-between mb-4 relative z-10 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">AI Text Input</span>
                  </div>
                  {/* Buttons */}
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setHistoryOpen(true)}
                      className="text-xs h-8 bg-background/50 hover:bg-background border border-border/50 shadow-sm transition-all"
                    >
                      <HistoryIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
                      History
                    </Button>
                    <div className="w-px h-4 bg-border/50 mx-1 self-center hidden sm:block" />
                    <input type="file" id="file-upload" className="hidden" accept=".txt,.md,.pdf,.docx,.doc" onChange={handleFileUpload} />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => document.getElementById("file-upload")?.click()}
                      className="text-xs h-8 bg-background/50 hover:bg-background border border-border/50 shadow-sm transition-all"
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
                      Upload
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handlePaste}
                      className="text-xs h-8 bg-background/50 hover:bg-background border border-border/50 shadow-sm transition-all"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
                      Paste
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleTrySample}
                      className="text-xs h-8 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 shadow-sm transition-all"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                      Sample
                    </Button>
                  </div>
                </div>

                <div
                  className={`relative flex-1 transition-all duration-300 z-10 rounded-2xl overflow-hidden border ${isDragging ? "ring-2 ring-primary ring-offset-2 scale-[1.01] bg-primary/5 border-primary" : "border-border/50 bg-background/40 hover:bg-background/60"}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isDragging && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center border-2 border-dashed border-primary rounded-2xl">
                      <div className="p-4 bg-primary/10 rounded-full mb-3 animate-bounce">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-primary">Drop file to import text</p>
                    </div>
                  )}
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste your AI-generated text here or drag & drop a file (PDF, Word, TXT)..."
                    className="w-full h-52 md:h-80 p-4 md:p-5 bg-transparent resize-none focus:outline-none text-sm leading-relaxed scrollbar-thin z-10 relative text-foreground/90 placeholder:text-muted-foreground/60"
                  />
                </div>
                
                <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground font-medium px-1">
                  <div className="flex gap-4">
                    <span><strong className="text-foreground">{wordCount(inputText)}</strong> words</span>
                    <span><strong className="text-foreground">{inputText.length}</strong> chars</span>
                  </div>
                  
                  {/* Live Detection Badge - Input */}
                  <div className="flex items-center gap-2">
                    {inputText.length >= 100 && (
                      isDetectingInput ? (
                        <div className="flex items-center gap-1.5 text-primary">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span className="text-xs">Analyzing...</span>
                        </div>
                      ) : inputDetection ? (
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${getScoreBg(inputDetection.ai_score)}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${inputDetection.ai_score < 30 ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                          <span className={`text-xs font-bold ${getScoreColor(inputDetection.ai_score)}`}>
                            {inputDetection.ai_score.toFixed(0)}% AI
                          </span>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              </div>

              {/* Output Panel */}
              <div className="p-4 md:p-8 flex flex-col relative group bg-muted/10">
                <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tr-3xl lg:rounded-r-3xl"></div>

                <div className="flex items-center justify-between mb-4 relative z-10 min-h-[32px]">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Humanized Output</span>
                  </div>
                  
                  {/* Output AI Score Header Badge */}
                  {result && (
                    <div className="animate-fade-in flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Final Score:</span>
                      <div className={`px-2.5 py-1 rounded-full border shadow-sm ${getScoreBg(result.ai_score)}`}>
                        <span className={`text-xs font-bold ${getScoreColor(result.ai_score)}`}>
                          {result.ai_score.toFixed(0)}% AI
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative flex-1 rounded-2xl overflow-hidden border border-border/50 bg-background/60 shadow-inner z-10 transition-all duration-300 hover:bg-background/80">
                  <textarea
                    value={outputText}
                    readOnly
                    placeholder="Your humanized text will appear here seamlessly..."
                    className="w-full h-52 md:h-80 p-4 md:p-5 bg-transparent resize-none focus:outline-none text-sm leading-relaxed scrollbar-thin text-foreground/90 placeholder:text-muted-foreground/50"
                  />
                  
                  {/* Processing Overlay */}
                  {(isProcessing || isSmartHumanizing) && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-in fade-in duration-200">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Wand2 className="w-5 h-5 text-primary animate-pulse" />
                        </div>
                      </div>
                      <p className="mt-4 text-sm font-semibold text-foreground tracking-wide">
                        {isSmartHumanizing ? `Smart Humanize: Attempt ${smartHumanizeAttempts}` : "Humanizing Text..."}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Applying advanced anti-detection models</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-3 text-xs font-medium px-1">
                  <span className="text-muted-foreground"><strong className="text-foreground">{wordCount(outputText)}</strong> words</span>
                  
                  <div className="flex gap-2 relative z-10 flex-wrap items-center">
                    {outputText && (
                      <>
                        <Button
                          variant={uploadedFileType === 'docx' ? "default" : "outline"}
                          size="sm"
                          onClick={handleDownloadDocx}
                          disabled={isDownloadingDocx}
                          className={`text-xs h-8 shadow-sm transition-all duration-300 font-medium ${
                            uploadedFileType === 'docx'
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-md shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98]"
                              : "border-border/50 hover:bg-emerald-600/10 hover:text-emerald-600 hover:border-emerald-600/30"
                          }`}
                        >
                          {isDownloadingDocx ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          ) : (
                            <FileDown className="h-3.5 w-3.5 mr-1.5" />
                          )}
                          Word (.docx)
                        </Button>

                        <Button
                          variant={uploadedFileType === 'pdf' ? "default" : "outline"}
                          size="sm"
                          onClick={handleDownloadPdf}
                          disabled={isDownloadingPdf}
                          className={`text-xs h-8 shadow-sm transition-all duration-300 font-medium ${
                            uploadedFileType === 'pdf'
                              ? "bg-red-600 hover:bg-red-700 text-white border-none shadow-md shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98]"
                              : "border-border/50 hover:bg-red-600/10 hover:text-red-600 hover:border-red-600/30"
                          }`}
                        >
                          {isDownloadingPdf ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          ) : (
                            <FileDown className="h-3.5 w-3.5 mr-1.5" />
                          )}
                          PDF (.pdf)
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      disabled={!outputText}
                      className="text-xs h-8 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="text-xs h-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="border-t border-border/50 bg-background/80 backdrop-blur-xl p-4 md:px-8 relative z-20">
              <div className="flex flex-col md:flex-row items-center justify-between gap-5">
                {/* Settings Dock */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 bg-muted/30 px-4 py-2.5 rounded-2xl border border-border/50 w-full md:w-auto">
                  {/* Strength */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Strength</span>
                    <Select value={strength} onValueChange={setStrength}>
                      <SelectTrigger className="w-[110px] h-8 text-xs bg-background border-border/50 shadow-sm focus:ring-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-px h-5 bg-border/50 hidden sm:block"></div>

                  {/* Mode */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Mode</span>
                    <Select value={mode} onValueChange={setMode}>
                      <SelectTrigger className="w-[120px] h-8 text-xs bg-background border-border/50 shadow-sm focus:ring-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-px h-5 bg-border/50 hidden sm:block"></div>

                  {/* Auto Copy Toggle */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-copy"
                      checked={autoCopy}
                      onCheckedChange={setAutoCopy}
                      className="scale-90 data-[state=checked]:bg-primary"
                    />
                    <label
                      htmlFor="auto-copy"
                      className="text-xs font-medium text-muted-foreground cursor-pointer select-none"
                    >
                      Auto Copy
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => handleHumanize("rehumanize")}
                    disabled={isProcessing || isSmartHumanizing || !outputText.trim()}
                    className="h-11 border-border/50 shadow-sm hover:bg-muted/50 font-medium transition-all w-full sm:w-auto"
                  >
                    {isProcessing && processingAction === "rehumanize" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Re-Humanize
                  </Button>

                  <Button
                    variant="default"
                    onClick={() => handleHumanize("humanize")}
                    disabled={isProcessing || isSmartHumanizing || !inputText.trim()}
                    className="h-11 px-8 bg-foreground text-background hover:bg-foreground/90 font-medium shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
                  >
                    {isProcessing && processingAction === "humanize" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Humanize
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="gradient"
                    onClick={handleSmartHumanize}
                    disabled={isProcessing || isSmartHumanizing || !inputText.trim()}
                    className="h-11 px-6 shadow-md shadow-primary/20 font-medium transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 group w-full sm:w-auto"
                  >
                    {isSmartHumanizing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Smart Working...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                        Smart Humanize
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Dashboard */}
          {result && (
            <div className="mt-8 animate-slide-up animation-delay-100">
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="h-4 w-1 rounded-full bg-primary"></div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Analysis Results</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* AI Score Gauge Card */}
                <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute -top-4 -right-4 p-3 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                    <AlertCircle className="w-32 h-32 text-foreground" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground mb-3 relative z-10">AI Detected</p>
                  <div className="flex items-end gap-3 relative z-10">
                    <CircularGauge value={result.ai_score} size={64} strokeWidth={6} showIcon={false} />
                    <div className="pb-1">
                      <p className={`text-xl font-bold ${getScoreColor(result.ai_score)}`}>
                        {result.ai_score.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground leading-none">Likely AI</p>
                    </div>
                  </div>
                </div>

                {/* Human Score Gauge Card */}
                <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute -top-4 -right-4 p-3 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                    <CheckCircle2 className="w-32 h-32 text-foreground" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground mb-3 relative z-10">Human Score</p>
                  <div className="flex items-end gap-3 relative z-10">
                    <CircularGauge value={result.human_score} size={64} strokeWidth={6} showIcon={false} 
                      color={result.human_score > 70 ? "text-green-500" : result.human_score > 40 ? "text-yellow-500" : "text-red-500"} 
                    />
                    <div className="pb-1">
                      <p className={`text-xl font-bold ${result.human_score > 70 ? "text-green-500" : result.human_score > 40 ? "text-yellow-500" : "text-red-500"}`}>
                        {result.human_score.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground leading-none">Likely Human</p>
                    </div>
                  </div>
                </div>

                {/* Processing Stats */}
                <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-4">
                  <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute -bottom-4 -right-4 p-3 opacity-[0.03] group-hover:rotate-45 transition-transform duration-500">
                      <Settings className="w-32 h-32 text-foreground" />
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2 relative z-10">
                      <Settings className="w-4 h-4" />
                      <p className="text-xs font-medium">Processing Mode</p>
                    </div>
                    <p className="text-xl font-bold text-foreground capitalize relative z-10">{result.mode || mode}</p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize relative z-10">{result.strength || strength} strength</p>
                  </div>
                  
                  <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute -bottom-4 -right-4 p-3 opacity-[0.03] group-hover:-rotate-12 transition-transform duration-500">
                      <Clock className="w-32 h-32 text-foreground" />
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2 relative z-10">
                      <Clock className="w-4 h-4" />
                      <p className="text-xs font-medium">Generation Time</p>
                    </div>
                    <p className="text-xl font-bold text-foreground relative z-10">
                      {((result.processingTime || 0) / 1000).toFixed(1)}s
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 relative z-10">{result.loops || 1} pass(es) completed</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bypasses AI Detectors */}
          <div className="mt-12 text-center">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-5">
              Flawlessly Bypasses Major AI Detectors
            </p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground/80">
              {["Turnitin", "GPTZero", "Copyleaks", "ZeroGPT", "Originality.ai", "Writer", "Sapling"].map((name) => (
                <span key={name} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <HistorySidebar
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        history={history}
        onSelect={handleSelectHistory}
        onClear={handleClearHistory}
      />
    </Layout>
  );
}
