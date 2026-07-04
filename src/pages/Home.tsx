import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { 
  Wand2, 
  RefreshCcw, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  BrainCircuit, 
  Zap, 
  FileText,
  AlertCircle,
  Upload
} from "lucide-react";
import { motion, useScroll, Variants } from "framer-motion";
import { useRef, useState, useEffect } from "react";

// Animation Variants
const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

// Interactive Live Typing Sandbox Preview for Hero Section
function InteractivePreview() {
  const [stage, setStage] = useState<"typing-ai" | "processing" | "typing-human" | "complete">("typing-ai");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [aiScore, setAiScore] = useState(100);

  const aiText = "Artificial intelligence algorithms are designed to generate content that mimics human behavior by predicting the most probable words. In conclusion, it is important to note that this process is highly mathematical and predictable.";
  const humanizedText = "AI engines are built to write text that sounds human by predicting word patterns. At its core, though, this process is pure math and highly predictable, which is why it leaves a distinct digital footprint.";

  useEffect(() => {
    let active = true;
    const runSequence = async () => {
      while (active) {
        // Stage 1: Typing AI Text
        setStage("typing-ai");
        setInputText("");
        setOutputText("");
        setAiScore(100);
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        for (let i = 0; i <= aiText.length; i++) {
          if (!active) return;
          setInputText(aiText.substring(0, i));
          await new Promise((resolve) => setTimeout(resolve, 15 + Math.random() * 15));
        }
        
        await new Promise((resolve) => setTimeout(resolve, 1500));
        if (!active) return;

        // Stage 2: Processing (Pulse/Spin)
        setStage("processing");
        await new Promise((resolve) => setTimeout(resolve, 2500));
        if (!active) return;

        // Stage 3: Typing Humanized Text & Counting Down Score
        setStage("typing-human");
        const scoreInterval = setInterval(() => {
          setAiScore((prev) => {
            const next = prev - 6;
            return next < 0 ? 0 : next;
          });
        }, 80);

        for (let i = 0; i <= humanizedText.length; i++) {
          if (!active) {
            clearInterval(scoreInterval);
            return;
          }
          setOutputText(humanizedText.substring(0, i));
          await new Promise((resolve) => setTimeout(resolve, 10 + Math.random() * 12));
        }
        clearInterval(scoreInterval);
        setAiScore(0);
        if (!active) return;

        // Stage 4: Complete
        setStage("complete");
        await new Promise((resolve) => setTimeout(resolve, 4500));
      }
    };

    runSequence();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto bg-card/85 dark:bg-card/45 border border-border/80 dark:border-white/10 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Mock browser header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border/60 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="text-[11px] font-medium text-muted-foreground bg-background/60 dark:bg-black/20 px-3 py-0.5 rounded border border-border/40 dark:border-white/5">
          pl-humanize-preview.io
        </div>
        <div className="w-12" /> {/* spacer */}
      </div>

      <div className="p-4 space-y-4">
        {/* Input area */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-muted-foreground">Input (AI text)</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${aiScore > 50 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
              AI Content: {aiScore}%
            </span>
          </div>
          <div className="relative h-24 p-3 bg-background border border-border/80 rounded-xl text-xs overflow-y-auto leading-relaxed font-sans text-foreground/80 scrollbar-thin">
            {inputText}
            {stage === "typing-ai" && <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-primary animate-pulse align-middle" />}
          </div>
        </div>

        {/* Action Indicator */}
        <div className="flex justify-center my-2">
          {stage === "processing" ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold animate-pulse-subtle">
              <Wand2 className="w-3.5 h-3.5 animate-spin" />
              Humanizing Text Engine Active...
            </div>
          ) : stage === "typing-human" || stage === "complete" ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 border border-green-500/20 rounded-full text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Bypass Checks Verified (0% AI)
            </div>
          ) : (
            <div className="h-8" /> // placeholder
          )}
        </div>

        {/* Output area */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-muted-foreground">Output (Humanized)</span>
            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-[10px] font-bold">
              100% Human Score
            </span>
          </div>
          <div className="relative h-24 p-3 bg-muted/40 border border-border/60 rounded-xl text-xs overflow-y-auto leading-relaxed font-sans text-foreground/95 italic scrollbar-thin">
            {outputText}
            {stage === "typing-human" && <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-green-500 animate-pulse align-middle" />}
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentAnimationShowcase() {
  const [step, setStep] = useState<"idle" | "uploading" | "processing" | "ready" | "downloading">("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let active = true;
    const runAnimation = async () => {
      while (active) {
        setStep("idle");
        setProgress(0);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (!active) return;

        // Stage 1: Uploading file
        setStep("uploading");
        for (let i = 0; i <= 100; i += 10) {
          if (!active) return;
          setProgress(i);
          await new Promise((resolve) => setTimeout(resolve, 80));
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (!active) return;

        // Stage 2: Processing (scanning layout blocks)
        setStep("processing");
        setProgress(0);
        for (let i = 0; i <= 100; i += 5) {
          if (!active) return;
          setProgress(i);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        await new Promise((resolve) => setTimeout(resolve, 600));
        if (!active) return;

        // Stage 3: Ready for download
        setStep("ready");
        await new Promise((resolve) => setTimeout(resolve, 2500));
        if (!active) return;

        // Stage 4: Downloading
        setStep("downloading");
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    };

    runAnimation();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto bg-card/60 backdrop-blur-xl border border-border/80 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px]" />

      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side: Animated Canvas */}
        <div className="relative border border-border/60 dark:border-white/5 bg-background/50 dark:bg-black/25 rounded-2xl p-5 min-h-[300px] flex flex-col justify-between overflow-hidden shadow-inner">
          
          {/* Scanning light animation overlay during processing */}
          {step === "processing" && (
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan top-0 z-20" />
          )}

          {/* Heading */}
          <div className="flex items-center justify-between pb-3 border-b border-border/40 dark:border-white/5 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <FileText className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-foreground leading-none">Chapter_1_Intro.docx</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Word Document (Original Layout)</p>
              </div>
            </div>
            <span className="text-[10px] bg-muted dark:bg-muted/40 px-2 py-0.5 rounded text-muted-foreground font-semibold">576 words</span>
          </div>

          {/* Document Content Mock */}
          <div className="space-y-4 flex-1">
            {/* Title Mock */}
            <div className="space-y-1">
              <div className="h-4 w-1/3 bg-foreground/15 rounded-md" />
              <div className="h-3.5 w-1/4 bg-foreground/10 rounded-md" />
            </div>

            {/* Paragraph Mock */}
            <div className="space-y-2">
              <div className="h-2.5 w-full bg-muted-foreground/10 rounded" />
              <div className="h-2.5 w-full bg-muted-foreground/10 rounded" />
              <div className="h-2.5 w-5/6 bg-muted-foreground/10 rounded" />
            </div>

            {/* Subheading Mock */}
            <div className="h-3.5 w-1/2 bg-foreground/15 rounded-md mt-6" />

            {/* Lists Mock */}
            <div className="space-y-2 pl-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <div className="h-2.5 w-2/3 bg-muted-foreground/10 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <div className="h-2.5 w-3/4 bg-muted-foreground/10 rounded" />
              </div>
            </div>
          </div>

          {/* Upload Status Card */}
          <div className="mt-6 pt-4 border-t border-border/40 dark:border-white/5">
            {step === "idle" && (
              <div className="flex items-center justify-center py-4 border border-dashed border-border/80 dark:border-white/10 rounded-xl bg-muted/20 hover:bg-muted/30 transition-all cursor-pointer">
                <div className="text-center">
                  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1.5 animate-bounce" />
                  <p className="text-xs font-semibold text-foreground">Waiting for document upload...</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Supports PDF and Word formats</p>
                </div>
              </div>
            )}

            {step === "uploading" && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-primary">Uploading document...</span>
                  <span className="font-bold text-primary">{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted dark:bg-muted/30 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {step === "processing" && (
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-purple-500">Humanizing content blocks...</span>
                  <span className="font-bold text-purple-500">Active</span>
                </div>
                <div className="w-full h-1.5 bg-muted dark:bg-muted/30 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 animate-pulse" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {(step === "ready" || step === "downloading") && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Humanized Output Ready</p>
                    <p className="text-[10px] text-emerald-600 font-medium">Layout mapping 1:1 verified</p>
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  className={`h-8 font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all ${
                    step === "downloading" 
                      ? "bg-emerald-700 text-white animate-pulse" 
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {step === "downloading" ? "Downloading..." : "Download DOCX"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Showcase Explainer */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Format Preservation Engine v2</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
            Upload Word or PDF, <br />
            Get the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Exact Same Layout</span> Out.
          </h3>

          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
            Unlike other tools that copy all your document content into a giant plain-text input box and completely strip your document styling, PL Humanize maps the layout structure in place.
          </p>

          <div className="space-y-3.5">
            {[
              "Preserves Headings (H1, H2, H3) and Titles in place",
              "Retains Bulleted and Numbered lists automatically",
              "Maintains custom margins, page line spacing, and italicized footers",
              "Applies deep humanization block-by-block concurrently"
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-sm font-medium text-foreground/80">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button variant="outline" className="border-border/60 hover:bg-muted font-medium transition-all" asChild>
              <Link to="/humanize">
                Try Document Humanizer
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TableAnimationShowcase() {
  const [step, setStep] = useState<"ai" | "processing" | "human">("ai");

  useEffect(() => {
    let active = true;
    const runSequence = async () => {
      while (active) {
        setStep("ai");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        if (!active) return;

        setStep("processing");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (!active) return;

        setStep("human");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    };

    runSequence();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto bg-card/60 backdrop-blur-xl border border-border/80 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px]" />

      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side: Showcase Explainer */}
        <div className="space-y-6 order-2 md:order-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Wand2 className="w-3.5 h-3.5" />
            <span>Table Structure Engine v2</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
            Seamless <span className="gradient-primary-text">Table Content</span> Humanization.
          </h3>

          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
            Other humanizers corrupt table grids or merge columns into a single unreadable block of text. PL Humanize parses each cell independently, humanizes the contents, and maps them back into the exact same table structure.
          </p>

          <div className="space-y-3.5">
            {[
              "Maintains table borders, rows, and header styling",
              "Humanizes each cell content concurrently",
              "Outputs clean markdown pipe grids directly in the editor",
              "Re-generates identical grid tables on Docx/PDF downloads"
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-sm font-medium text-foreground/80">
                <CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button variant="outline" className="border-border/60 hover:bg-muted font-medium transition-all" asChild>
              <Link to="/humanize">
                Try Table Humanizer
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Right Side: Animated Mock Table */}
        <div className="relative border border-border/60 dark:border-white/5 bg-background/50 dark:bg-black/25 rounded-2xl p-5 min-h-[300px] flex flex-col justify-between overflow-hidden shadow-inner order-1 md:order-2">
          
          {step === "processing" && (
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan top-0 z-20" />
          )}

          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-border/40 dark:border-white/5 mb-4">
            <span className="text-xs font-bold text-foreground">Interactive Table Preview</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${step === 'ai' ? 'bg-red-500 animate-pulse' : step === 'processing' ? 'bg-purple-500 animate-spin' : 'bg-green-500'}`} />
              <span className="text-[10px] text-muted-foreground font-semibold">
                {step === 'ai' ? '98% AI detected' : step === 'processing' ? 'Rewriting cells...' : '0% AI (100% Human)'}
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="border border-border/80 dark:border-white/10 rounded-xl overflow-hidden text-xs bg-card/45">
            {/* Table Header Row */}
            <div className="grid grid-cols-2 bg-muted/60 dark:bg-white/5 border-b border-border/80 dark:border-white/10 font-bold text-foreground">
              <div className="p-2.5 border-r border-border/80 dark:border-white/10">Strengths</div>
              <div className="p-2.5">Opportunities</div>
            </div>
            
            {/* Table Body Row */}
            <div className="grid grid-cols-2">
              {/* Strengths Cell */}
              <div className="p-2.5 border-r border-b border-border/80 dark:border-white/10 min-h-[100px] transition-all">
                {step === 'ai' && (
                  <p className="text-red-500/90 leading-relaxed">
                    Utilizing artificial intelligence algorithms allows our digital marketing to achieve maximum predictive optimizations.
                  </p>
                )}
                {step === 'processing' && (
                  <div className="space-y-2">
                    <div className="h-2 w-11/12 bg-purple-500/20 rounded animate-pulse" />
                    <div className="h-2 w-5/6 bg-purple-500/20 rounded animate-pulse" />
                  </div>
                )}
                {step === 'human' && (
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium leading-relaxed italic">
                    By incorporating tailored digital strategies, we can optimize outreach and connect directly with core audiences.
                  </p>
                )}
              </div>

              {/* Opportunities Cell */}
              <div className="p-2.5 border-b border-border/80 dark:border-white/10 min-h-[100px] transition-all">
                {step === 'ai' && (
                  <p className="text-red-500/90 leading-relaxed">
                    It is crucial to integrate smartphone configurations to expand market capitalization opportunities.
                  </p>
                )}
                {step === 'processing' && (
                  <div className="space-y-2">
                    <div className="h-2 w-5/6 bg-purple-500/20 rounded animate-pulse" />
                    <div className="h-2 w-4/5 bg-purple-500/20 rounded animate-pulse" />
                  </div>
                )}
                {step === 'human' && (
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium leading-relaxed italic">
                    We can build custom mobile experiences that tap into rising markets and unlock new customer channels.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Footer status bar */}
          <div className="mt-4 pt-3 border-t border-border/40 dark:border-white/5 flex justify-center text-[11px]">
            {step === 'ai' && (
              <span className="text-red-500 font-semibold bg-red-500/10 px-3 py-1 rounded-full">
                AI Phrasing Flags Detected inside Table Grid
              </span>
            )}
            {step === 'processing' && (
              <span className="text-purple-500 font-semibold animate-pulse-subtle bg-purple-500/10 px-3 py-1 rounded-full">
                Contextual cell-by-cell humanizer engine processing...
              </span>
            )}
            {step === 'human' && (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Grid Formats Preserved & Humanized
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  return (
    <Layout>
      {/* Styles for scanning animation */}
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0.8; }
          50% { top: 95%; opacity: 0.8; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[85vh] md:min-h-[90vh] flex items-center pt-6 md:pt-0">
        <div className="absolute inset-0 gradient-primary-lr opacity-[0.03]" />

        {/* Live Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated Grid overlay */}
          <motion.div
            className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage: 'radial-gradient(circle at center, currentColor 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
            animate={{
              backgroundPosition: ['0px 0px', '40px 40px']
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Enhanced Floating Blobs */}
          <motion.div
            className="absolute -top-20 -left-20 w-[30rem] h-[30rem] bg-primary/30 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen"
            animate={{
              x: [0, 80, 0],
              y: [0, -80, 0],
              scale: [1, 1.15, 1]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-40 -right-20 w-[35rem] h-[35rem] bg-blue-500/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen"
            animate={{
              x: [0, -100, 0],
              y: [0, 60, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute -bottom-40 left-1/3 w-[40rem] h-[40rem] bg-purple-500/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"
            animate={{
              x: [0, 40, 0],
              y: [0, -40, 0],
              scale: [1, 1.08, 1]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>

        <div className="container relative z-10 py-10 md:py-24">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
            {/* Hero Text */}
            <motion.div
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeUpVariant} className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-medium">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                The Next Generation AI Assistant
              </motion.div>

              <motion.h1 variants={fadeUpVariant} className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight">
                Humanize AI Content
                <span className="gradient-primary-text block mt-1">Instantly & Naturally</span>
              </motion.h1>

              <motion.p variants={fadeUpVariant} className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Convert AI-written text into natural human-like content. Our advanced multi-pass engine transforms robotic prose into authentic, engaging writing that bypasses AI detectors.
              </motion.p>

              <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-2">
                <Button variant="gradient" size="xl" className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-8 text-base md:text-lg rounded-full shadow-lg hover:shadow-primary/25 transition-all duration-300" asChild>
                  <Link to="/humanize">
                    Start Humanizing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-8 text-base md:text-lg rounded-full border-2 hover:bg-muted transition-all duration-300" asChild>
                  <Link to="/ai-detector">
                    Check AI Score
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Interactive Sandbox Preview */}
            <motion.div 
              className="lg:col-span-5 w-full flex justify-center hidden sm:flex"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <InteractivePreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16 md:py-24 lg:py-32">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Powerful AI Text Tools
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to transform and analyze AI-generated content
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* AI Humanizer */}
          <motion.div variants={fadeUpVariant} className="h-full group">
            <Link to="/humanize" className="block h-full transition-transform duration-300">
              <FeatureCard
                icon={<Wand2 className="h-6 w-6 text-white" />}
                iconBgClassName="bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-md shadow-purple-500/30"
                title="AI Humanizer"
                description="Transform AI-written text into natural, human-like content using our advanced multi-pass humanization engine."
                className="h-full border border-border/80 dark:border-border/20 hover:border-purple-500/50 dark:hover:border-purple-500/40 transition-all shadow-md hover:shadow-xl hover:shadow-purple-500/5"
              />
            </Link>
          </motion.div>

          {/* Paraphrase Tool */}
          <motion.div variants={fadeUpVariant} className="h-full group">
            <Link to="/paraphrase" className="block h-full transition-transform duration-300">
              <FeatureCard
                icon={<RefreshCcw className="h-6 w-6 text-white" />}
                iconBgClassName="bg-gradient-to-tr from-teal-500 to-emerald-400 shadow-md shadow-teal-500/30"
                title="Paraphrase Tool"
                description="Rewrite your text with fresh vocabulary and improved clarity while preserving the original meaning."
                className="h-full border border-border/80 dark:border-border/20 hover:border-teal-500/50 dark:hover:border-teal-500/40 transition-all shadow-md hover:shadow-xl hover:shadow-teal-500/5"
              />
            </Link>
          </motion.div>

          {/* PL AI Detector */}
          <motion.div variants={fadeUpVariant} className="h-full group">
            <Link to="/ai-detector" className="block h-full transition-transform duration-300">
              <FeatureCard
                icon={<Search className="h-6 w-6 text-white" />}
                iconBgClassName="bg-gradient-to-tr from-amber-500 to-orange-400 shadow-md shadow-amber-500/30"
                title="PL AI Detector"
                description="Analyze text to detect AI-generated content with detailed scoring and sentence-level breakdown."
                className="h-full border border-border/80 dark:border-border/20 hover:border-amber-500/50 dark:hover:border-amber-500/40 transition-all shadow-md hover:shadow-xl hover:shadow-amber-500/5"
              />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Document Export Feature Showcase Section */}
      <section className="bg-muted/15 border-t border-b border-border/40 py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
          >
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">New Big Feature</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mt-4 mb-4">
              Word & PDF Format Preservation
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our layout-preserving AI parses your headings, bullet points, and structures. The humanized output download matches your uploaded document layout exactly!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <DocumentAnimationShowcase />
          </motion.div>
        </div>
      </section>

      {/* Table Humanizer Showcase Section */}
      <section className="bg-background border-b border-border/40 py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
          >
            <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">New Big Feature</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mt-4 mb-4">
              Advanced Table Humanization
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Retain your SWOT analysis and data grids! Our engine rewrites each cell separately and keeps borders, headers, and rows structured.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <TableAnimationShowcase />
          </motion.div>
        </div>
      </section>

      {/* Why PL_Humanize Section */}
      <section className="py-16 md:py-24 lg:py-32 relative">
        <div className="container max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
          >
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6">
              What Sets <span className="gradient-primary-text">PL Humanize</span> Apart?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Not all humanizers are created equal. Here is why our engine outperforms basic paraphrasing tools.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              className="space-y-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeUpVariant} className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <BrainCircuit className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Context Preservation Engine</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Unlike basic spinners that blindly replace synonyms and break grammar, our multi-pass AI understands the deep context of your text to maintain its original meaning and narrative flow.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeUpVariant} className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                    <ShieldCheck className="w-6 h-6 text-teal-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Undetectable Guarantee</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Designed specifically to bypass the most stringent AI detectors. Our engine restructures the underlying syntax to remove algorithmic watermarks completely.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeUpVariant} className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <Zap className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Dynamic Tone Calibration</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Whether you need an academic thesis, a professional corporate email, or a casual blog post, our targeted modes adapt the vocabulary and phrasing to perfectly match your desired voice.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Comparison Table Card */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-blue-500/10 rounded-3xl transform rotate-3 scale-105 blur-xl"></div>
              <div className="relative bg-card border border-border/80 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <span className="font-bold text-base sm:text-lg text-foreground">Comparison</span>
                  <div className="flex gap-6 sm:gap-8 font-semibold text-xs sm:text-sm">
                    <span className="text-muted-foreground">Others</span>
                    <span className="text-primary font-bold text-right">PL Humanize</span>
                  </div>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  {[
                    "Bypasses Major AI Detectors",
                    "Maintains Original Meaning",
                    "Fixes Grammatical Errors",
                    "Custom Tone Selection",
                    "No Robotic Phrasing"
                  ].map((feature, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium text-xs sm:text-sm pr-2">{feature}</span>
                      <div className="flex justify-end gap-10 sm:gap-14 pr-3 sm:pr-8 text-sm w-[100px] sm:w-[140px] shrink-0">
                        <span className="text-muted-foreground/40 font-bold">—</span>
                        <CheckCircle2 className="w-5 h-5 text-primary fill-primary/10 shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Step by Step Process Section */}
      <section className="bg-muted/30 py-16 md:py-24 lg:py-32 relative overflow-hidden" ref={containerRef}>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        <div className="container max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
          >
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6">
              How the Magic Happens
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A seamless, step-by-step process that guarantees 100% human-sounding text in seconds.
            </p>
          </motion.div>

          <div className="relative">
            {/* Vertical Line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-border/80 dark:bg-border/30 -translate-x-1/2 rounded-full overflow-hidden">
              <motion.div
                className="w-full bg-primary"
                style={{ height: "100%", scaleY: scrollYProgress, transformOrigin: "top" }}
              />
            </div>

            <div className="space-y-24">
              {/* Step 1 */}
              <motion.div
                className="relative flex flex-col md:flex-row items-center justify-between group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <div className="md:w-5/12 text-center md:text-right mb-8 md:mb-0 md:pr-12">
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Phase 01</span>
                  <h3 className="text-2xl font-bold mb-3 text-foreground mt-1">1. AI Footprint Analysis</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our system scans your input text to detect robotic phrasing, predictable sentence lengths, and common AI watermarks used by models like ChatGPT.
                  </p>
                </div>
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border-4 border-background bg-blue-500/10 items-center justify-center z-10 transition-transform group-hover:scale-110 shadow-lg">
                  <Search className="w-6 h-6 text-blue-500" />
                </div>
                <div className="md:w-5/12 md:pl-12 w-full">
                  <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                    <div className="absolute left-0 right-0 h-0.5 bg-blue-500/40 animate-scan z-20"></div>
                    <div className="flex items-center gap-3 mb-4 justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping"></div>
                        <span className="text-xs font-semibold text-muted-foreground">Deep Scanning...</span>
                      </div>
                      <span className="text-xs font-bold text-red-500">98% AI Match</span>
                    </div>
                    <div className="space-y-2.5">
                      <div className="h-2 w-full bg-red-500/15 rounded"></div>
                      <div className="h-2 w-5/6 bg-red-500/15 rounded"></div>
                      <div className="h-2 w-4/6 bg-muted rounded"></div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                className="relative flex flex-col md:flex-row-reverse items-center justify-between group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="md:w-5/12 text-center md:text-left mb-8 md:mb-0 md:pl-12">
                  <span className="text-xs font-bold text-purple-500 uppercase tracking-widest">Phase 02</span>
                  <h3 className="text-2xl font-bold mb-3 text-foreground mt-1">2. Restructuring & Rewriting</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The core engine activates, completely restructuring sentences, injecting natural human burstiness, and replacing complex vocabulary with authentic human equivalents.
                  </p>
                </div>
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border-4 border-background bg-purple-500/10 items-center justify-center z-10 transition-transform group-hover:scale-110 shadow-lg">
                  <Wand2 className="w-6 h-6 text-purple-500" />
                </div>
                <div className="md:w-5/12 md:pr-12 w-full">
                  <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
                    <div className="flex items-center gap-3 mb-4">
                      <RefreshCcw className="w-4 h-4 text-purple-500 animate-spin" />
                      <span className="text-xs font-semibold text-purple-500">Rephrasing Contextual Sentences</span>
                    </div>
                    <div className="space-y-2.5">
                      <div className="h-2 w-11/12 bg-purple-500/20 rounded animate-pulse"></div>
                      <div className="h-2 w-full bg-purple-500/20 rounded animate-pulse"></div>
                      <div className="h-2 w-3/4 bg-purple-500/20 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                className="relative flex flex-col md:flex-row items-center justify-between group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="md:w-5/12 text-center md:text-right mb-8 md:mb-0 md:pr-12">
                  <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Phase 03</span>
                  <h3 className="text-2xl font-bold mb-3 text-foreground mt-1">3. Final Verification</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Before delivering the result, the system automatically checks the output against our internal AI detector to ensure it passes as 100% human-written content.
                  </p>
                </div>
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border-4 border-background bg-green-500/10 items-center justify-center z-10 transition-transform group-hover:scale-110 shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div className="md:w-5/12 md:pl-12 w-full">
                  <div className="bg-card p-6 rounded-2xl border border-green-500/20 shadow-lg shadow-green-500/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded">Verified Output</span>
                      <span className="text-xs font-bold text-green-600">0% AI Detected</span>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed italic bg-muted/30 p-2.5 rounded-lg border border-border/40">
                      "The resulting text flows naturally, utilizing varied sentence structures and authentic vocabulary that bypasses modern AI detectors with ease."
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>



      {/* Bottom Final CTA Section */}
      <section className="relative overflow-hidden py-16 md:py-24 lg:py-32 bg-background border-t border-border/40">
        {/* Glow backdrop overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="container max-w-4xl mx-auto text-center relative z-10 space-y-8 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
              Ready to Humanize Your Writing?
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Bypass AI detectors and rewrite robotic content instantly with our state-of-the-art engine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button variant="gradient" size="xl" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-primary/25 transition-all duration-300" asChild>
                <Link to="/humanize">
                  Start Humanizing Now
                  <Wand2 className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full border-2 hover:bg-muted transition-all duration-300" asChild>
                <Link to="/ai-detector">
                  Test Your Score Free
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
