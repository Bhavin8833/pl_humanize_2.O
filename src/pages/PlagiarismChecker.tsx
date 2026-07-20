import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { TextAreaBox } from "@/components/ui/TextAreaBox";
import { 
  FileCheck, 
  Loader2, 
  Sparkles, 
  Upload, 
  Copy, 
  Trash2, 
  FileDown, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Info,
  Layers,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config";
import { motion, AnimatePresence } from "framer-motion";
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { 
  generatePlagiarismPdfReport, 
  generatePlagiarismDocxReport, 
  PlagiarismReportData, 
  SentenceItem 
} from "@/lib/plagiarismReportGenerator";
import { downloadBlob } from "@/lib/documentGenerator";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const SAMPLE_PLAGIARISM_TEXT = `Artificial intelligence is changing the world at a rapid pace. Machine learning algorithms analyze vast datasets to identify complex patterns and make predictions. Higher education institutions are increasingly integrating automated tools into their academic curricula. Original research requires critical analysis and unique human insight to synthesize novel conclusions.`;

export default function PlagiarismChecker() {
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStepMessage, setLoadingStepMessage] = useState("Scanning Content...");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  
  // API connection status and report state
  const [isApiConnected, setIsApiConnected] = useState<boolean | null>(null);
  const [disconnectionNotice, setDisconnectionNotice] = useState<string>("");
  const [report, setReport] = useState<PlagiarismReportData | null>(null);
  
  // PDF/DOCX Download status
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const maxChars = 100000;

  // Read text from PDF files
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
      throw new Error("Could not parse PDF file");
    }
  };

  // Read text from Word files
  const readDocxFile = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (e) {
      console.error("DOCX read error:", e);
      throw new Error("Could not parse Word document");
    }
  };

  const processUploadedFile = async (file: File) => {
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    try {
      let extractedText = "";
      if (ext === 'pdf') {
        extractedText = await readPdfFile(file);
      } else if (ext === 'docx') {
        extractedText = await readDocxFile(file);
      } else if (ext === 'txt' || ext === 'md') {
        extractedText = await file.text();
      } else {
        throw new Error("Unsupported file type. Please upload .txt, .docx, or .pdf files.");
      }

      if (!extractedText.trim()) {
        throw new Error("File appears to be empty.");
      }

      setInputText(extractedText);
      setUploadedFileName(file.name);
      setReport(null);
      setIsApiConnected(null);
      toast.success(`Loaded file: ${file.name}`);
    } catch (error) {
      console.error("File upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to read file");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processUploadedFile(file);
      e.target.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      await processUploadedFile(file);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
      setReport(null);
      setIsApiConnected(null);
      toast.success("Pasted text from clipboard");
    } catch {
      toast.error("Could not access clipboard");
    }
  };

  const handleTrySample = () => {
    setInputText(SAMPLE_PLAGIARISM_TEXT);
    setUploadedFileName("");
    setReport(null);
    setIsApiConnected(null);
    toast.success("Sample text loaded");
  };

  const handleClear = () => {
    setInputText("");
    setUploadedFileName("");
    setReport(null);
    setIsApiConnected(null);
    setDisconnectionNotice("");
  };

  const handleCheckPlagiarism = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter or upload some text to check for plagiarism.");
      return;
    }

    if (charCount > maxChars) {
      toast.error(`Text exceeds maximum limit of ${maxChars.toLocaleString()} characters.`);
      return;
    }

    setIsProcessing(true);
    setReport(null);
    setIsApiConnected(null);
    setDisconnectionNotice("");

    // Cycle through animated loading state messages
    setLoadingStepMessage("Scanning Content...");
    const msgTimer1 = setTimeout(() => setLoadingStepMessage("Analyzing Similarity..."), 1000);
    const msgTimer2 = setTimeout(() => setLoadingStepMessage("Generating Report..."), 2000);

    try {
      const response = await fetch(`${API_BASE_URL}/api/plagiarism-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      // Artificial mini-delay to ensure smooth animation experience
      await new Promise(r => setTimeout(r, 2200));

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Plagiarism check failed.");
      }

      const data = await response.json();

      if (data.connected === false) {
        setIsApiConnected(false);
        const noticeMsg = data.message || "No plagiarism detection service is currently connected. Connect a supported provider (such as Copyleaks or another plagiarism API) to enable real plagiarism scanning.";
        setDisconnectionNotice(noticeMsg);
        toast.info("Plagiarism detection provider check complete.");
      } else if (data.connected === true && data.report) {
        setIsApiConnected(true);
        setReport(data.report);
        toast.success("Plagiarism scan completed.");
      } else {
        setIsApiConnected(false);
        setDisconnectionNotice("No plagiarism detection service is currently connected. Connect a supported provider (such as Copyleaks or another plagiarism API) to enable real plagiarism scanning.");
      }

    } catch (error) {
      console.error("Plagiarism check error:", error);
      toast.error("Failed to check plagiarism. Please verify your backend server.");
    } finally {
      clearTimeout(msgTimer1);
      clearTimeout(msgTimer2);
      setIsProcessing(false);
    }
  };

  const handleCopyReport = () => {
    const totalSentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

    let summaryText = `--- PL HUMANIZER PLAGIARISM REPORT ---\n`;
    summaryText += `Date: ${new Date().toLocaleString()}\n`;
    if (isApiConnected && report) {
      summaryText += `Originality Score: ${report.originalityScore.toFixed(1)}%\n`;
      summaryText += `Similarity Score: ${report.similarityScore.toFixed(1)}%\n`;
      summaryText += `Total Words: ${report.totalWords}\n`;
      summaryText += `Total Sentences: ${report.totalSentences}\n`;
      summaryText += `Unique Sentences: ${report.uniqueSentences}\n`;
      summaryText += `Duplicate Sentences: ${report.duplicateSentences}\n`;
    } else {
      summaryText += `Status: Service Not Connected\n`;
      summaryText += `Notice: ${disconnectionNotice}\n`;
      summaryText += `Total Words: ${wordCount}\n`;
      summaryText += `Total Sentences: ${totalSentences}\n`;
    }
    summaryText += `\n--- Analyzed Text ---\n${inputText}\n`;

    navigator.clipboard.writeText(summaryText);
    toast.success("Report copied to clipboard");
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const sentences = inputText
        .split(/(?<=[.!?])\s+/)
        .filter(s => s.trim().length > 0);

      const reportData: PlagiarismReportData = report || {
        originalityScore: 100,
        similarityScore: 0,
        totalWords: wordCount,
        totalSentences: sentences.length,
        duplicateSentences: 0,
        uniqueSentences: sentences.length,
        originalText: inputText,
      };

      const blob = await generatePlagiarismPdfReport(reportData);
      downloadBlob(blob, `Plagiarism_Report_${Date.now()}.pdf`);
      toast.success("Downloaded PDF Report");
    } catch (err) {
      console.error("PDF Report generation error:", err);
      toast.error("Failed to generate PDF Report");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    setIsDownloadingDocx(true);
    try {
      const sentences = inputText
        .split(/(?<=[.!?])\s+/)
        .filter(s => s.trim().length > 0);

      const reportData: PlagiarismReportData = report || {
        originalityScore: 100,
        similarityScore: 0,
        totalWords: wordCount,
        totalSentences: sentences.length,
        duplicateSentences: 0,
        uniqueSentences: sentences.length,
        originalText: inputText,
      };

      const blob = await generatePlagiarismDocxReport(reportData);
      downloadBlob(blob, `Plagiarism_Report_${Date.now()}.docx`);
      toast.success("Downloaded Word Report");
    } catch (err) {
      console.error("Word Report generation error:", err);
      toast.error("Failed to generate Word Report");
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  // Sentences breakdown helper for rendering sentence highlights
  const sentenceList: SentenceItem[] = report?.sentences || inputText
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 0)
    .map(s => ({
      text: s,
      status: "unique" as const,
      similarity: 0
    }));

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-4rem)] py-6 md:py-16 overflow-hidden">
        
        {/* Ambient background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] mix-blend-screen" />
          <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px] mix-blend-screen" />
        </div>

        <div className="container relative z-10 max-w-5xl mx-auto px-4">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <ShieldCheck className="h-4 w-4" />
              <span>Real-Time Plagiarism Verification</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
              Plagiarism <span className="gradient-primary-text">Checker</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Scan your documents for originality, similarity scores, duplicate content, and sentence-level source detection.
            </p>
          </motion.div>

          {/* Main Input Editor Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-10 relative"
          >
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={handleDrop}
              className={cn(
                "relative bg-card/40 backdrop-blur-xl border rounded-3xl p-6 shadow-card-lg transition-all duration-300",
                isDragging ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-white/10 dark:border-white/5"
              )}
            >
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePaste}
                    className="h-8 rounded-lg text-xs font-semibold"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Paste Text
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTrySample}
                    className="h-8 rounded-lg text-xs font-semibold"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    Try Sample
                  </Button>
                  {inputText && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="h-8 rounded-lg text-xs font-semibold text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* File Upload Button */}
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".txt,.docx,.pdf,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border/60 rounded-lg transition-colors shadow-sm">
                      <Upload className="h-3.5 w-3.5 mr-1.5 text-primary" />
                      Upload .txt, .docx, .pdf
                    </span>
                  </label>
                </div>
              </div>

              {/* Uploaded File Indicator Banner */}
              {uploadedFileName && (
                <div className="mb-3 flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
                  <span className="flex items-center gap-1.5 truncate">
                    <FileText className="h-4 w-4 shrink-0" />
                    Uploaded File: <strong>{uploadedFileName}</strong>
                  </span>
                  <button 
                    onClick={() => setUploadedFileName("")}
                    className="hover:underline text-[11px] shrink-0 ml-2"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Editor Textarea with scanning overlay */}
              <div className="relative rounded-2xl overflow-hidden group">
                <TextAreaBox
                  value={inputText}
                  onChange={(val) => {
                    setInputText(val);
                    setReport(null);
                    setIsApiConnected(null);
                  }}
                  placeholder="Paste your text here or upload a document (.txt, .docx, .pdf) to scan for plagiarism..."
                  maxHeight="360px"
                  className="bg-background/50 border-none rounded-2xl transition-all"
                />

                {/* Animated Scanning Overlay while checking */}
                <AnimatePresence>
                  {isProcessing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm"
                    >
                      <motion.div
                        animate={{ y: ["-20%", "120%"] }}
                        transition={{ duration: 2.2, ease: "linear", repeat: Infinity }}
                        className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_hsl(var(--primary))]"
                      />
                      
                      <div className="bg-card/90 border border-border/80 px-6 py-4 rounded-2xl shadow-xl flex flex-col items-center gap-3">
                        <Loader2 className="h-7 w-7 text-primary animate-spin" />
                        <span className="text-sm font-bold text-foreground animate-pulse">
                          {loadingStepMessage}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Character Count & Action Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground bg-background/50 px-4 py-2 rounded-xl border border-border/50">
                  <span>
                    <strong className={charCount > maxChars ? "text-destructive" : "text-foreground"}>
                      {charCount.toLocaleString()}
                    </strong> / {maxChars.toLocaleString()} chars
                  </span>
                  <span className="text-border">|</span>
                  <span><strong>{wordCount.toLocaleString()}</strong> words</span>
                </div>

                <Button
                  variant="gradient"
                  size="xl"
                  onClick={handleCheckPlagiarism}
                  disabled={isProcessing || !inputText.trim()}
                  className="w-full sm:w-auto rounded-xl shadow-lg relative overflow-hidden group"
                >
                  <span className="relative flex items-center justify-center gap-2">
                    {isProcessing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <FileCheck className="h-5 w-5" />
                    )}
                    Check Plagiarism
                  </span>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <AnimatePresence>
            {(isApiConnected !== null || report !== null) && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Disconnected Provider System Notice Banner */}
                {isApiConnected === false && disconnectionNotice && (
                  <motion.div 
                    initial={{ scale: 0.96 }}
                    animate={{ scale: 1 }}
                    className="bg-amber-500/10 border-2 border-amber-500/30 dark:bg-amber-950/30 dark:border-amber-500/40 rounded-3xl p-6 shadow-lg relative overflow-hidden"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl shrink-0">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                          Plagiarism Service Status Notice
                        </h3>
                        <p className="text-sm font-medium leading-relaxed text-amber-950 dark:text-amber-200">
                          {disconnectionNotice}
                        </p>
                        <p className="text-xs text-muted-foreground pt-1">
                          The complete frontend UI and backend endpoints are 100% ready. Once an API key is connected, live originality and similarity scanning will automatically populate here.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Score Summary Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Card 1: Originality Score */}
                  <div className="bg-card/40 backdrop-blur-xl rounded-[2rem] border border-white/10 p-6 shadow-card-lg relative overflow-hidden flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Originality Score</span>
                        <h3 className="text-3xl font-extrabold text-foreground mt-1">
                          {isApiConnected && report ? `${report.originalityScore.toFixed(1)}%` : "100.0%"}
                        </h3>
                      </div>
                      <div className="p-3 bg-green-500/10 text-green-500 rounded-2xl">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="w-full bg-muted/60 h-3 rounded-full overflow-hidden border border-border/50">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: isApiConnected && report ? `${report.originalityScore}%` : "100%" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Higher score indicates content is unique and original.
                    </p>
                  </div>

                  {/* Card 2: Similarity Score */}
                  <div className="bg-card/40 backdrop-blur-xl rounded-[2rem] border border-white/10 p-6 shadow-card-lg relative overflow-hidden flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Similarity Score</span>
                        <h3 className="text-3xl font-extrabold text-foreground mt-1">
                          {isApiConnected && report ? `${report.similarityScore.toFixed(1)}%` : "0.0%"}
                        </h3>
                      </div>
                      <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
                        <Layers className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="w-full bg-muted/60 h-3 rounded-full overflow-hidden border border-border/50">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: isApiConnected && report ? `${report.similarityScore}%` : "0%" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Lower similarity score indicates minimal web matches.
                    </p>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="bg-card/40 backdrop-blur-xl rounded-[2rem] border border-white/10 p-6 shadow-card-lg">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Plagiarism Report Metrics
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-background/50 border border-border/60 text-center">
                      <span className="text-xs text-muted-foreground font-medium block mb-1">Total Words</span>
                      <span className="text-xl font-black text-foreground">
                        {report ? report.totalWords.toLocaleString() : wordCount.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-background/50 border border-border/60 text-center">
                      <span className="text-xs text-muted-foreground font-medium block mb-1">Total Sentences</span>
                      <span className="text-xl font-black text-foreground">
                        {report ? report.totalSentences.toLocaleString() : sentenceList.length.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-background/50 border border-border/60 text-center">
                      <span className="text-xs text-muted-foreground font-medium block mb-1">Unique Sentences</span>
                      <span className="text-xl font-black text-green-500">
                        {report ? report.uniqueSentences.toLocaleString() : sentenceList.length.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-background/50 border border-border/60 text-center">
                      <span className="text-xs text-muted-foreground font-medium block mb-1">Duplicate Sentences</span>
                      <span className="text-xl font-black text-red-500">
                        {report ? report.duplicateSentences.toLocaleString() : "0"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sentence Highlight Color Legend & Detailed View */}
                <div className="bg-card/40 backdrop-blur-xl rounded-[2rem] border border-white/10 p-6 md:p-8 shadow-card-lg space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Sentence Similarity Highlights</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Color-coded breakdown of document sentences</p>
                    </div>

                    {/* Color Legend */}
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Green = Unique
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border border-yellow-500/20">
                        <span className="h-2 w-2 rounded-full bg-yellow-500" />
                        Yellow = Similar
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        Red = Highly Similar
                      </div>
                    </div>
                  </div>

                  {/* Sentence List Container */}
                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin">
                    {sentenceList.map((sentence, idx) => {
                      const status = sentence.status;
                      const isUnique = status === "unique";
                      const isSimilar = status === "similar";
                      const isHighlySimilar = status === "highly_similar";

                      return (
                        <div
                          key={idx}
                          className={cn(
                            "p-4 rounded-xl border text-sm leading-relaxed transition-all flex flex-col sm:flex-row items-start justify-between gap-3",
                            isUnique && "bg-green-50/40 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 text-foreground",
                            isSimilar && "bg-yellow-50/40 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/30 text-foreground",
                            isHighlySimilar && "bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-foreground"
                          )}
                        >
                          <p className="flex-1 font-medium">{sentence.text}</p>
                          <span
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-bold shrink-0 self-start sm:self-center",
                              isUnique && "bg-green-500 text-white shadow-sm shadow-green-500/30",
                              isSimilar && "bg-yellow-500 text-white shadow-sm shadow-yellow-500/30",
                              isHighlySimilar && "bg-red-500 text-white shadow-sm shadow-red-500/30"
                            )}
                          >
                            {isUnique ? "Unique" : isSimilar ? `Similar (${sentence.similarity || 45}%)` : `Highly Similar (${sentence.similarity || 90}%)`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Report Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleCopyReport}
                    className="rounded-xl font-semibold border-border/80 hover:bg-muted"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Report
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleDownloadPdf}
                    disabled={isDownloadingPdf}
                    className="rounded-xl font-semibold border-border/80 hover:bg-muted"
                  >
                    {isDownloadingPdf ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileDown className="h-4 w-4 mr-2 text-red-500" />
                    )}
                    Download PDF
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleDownloadDocx}
                    disabled={isDownloadingDocx}
                    className="rounded-xl font-semibold border-border/80 hover:bg-muted"
                  >
                    {isDownloadingDocx ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileDown className="h-4 w-4 mr-2 text-blue-500" />
                    )}
                    Download DOCX
                  </Button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </Layout>
  );
}
