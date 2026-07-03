import { useState, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { TextAreaBox } from "@/components/ui/TextAreaBox";
import { Switch } from "@/components/ui/switch";
import { Copy, Trash2, RefreshCcw, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";
import { motion, AnimatePresence } from "framer-motion";

export default function Paraphrase() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoCopy, setAutoCopy] = useState(false);

  const wordCount = (text: string) =>
    text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleParaphrase = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to paraphrase");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/paraphrase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to paraphrase");
      }

      const data = await response.json();

      if (data.warning) {
        toast.warning(data.warning);
      }

      setOutputText(data.text);
      toast.success("Text paraphrased successfully");

      if (autoCopy) {
        navigator.clipboard.writeText(data.text);
        toast.success("Auto-copied to clipboard!");
      }

    } catch (error) {
      console.error("Paraphrase error:", error);
      toast.error("Failed to paraphrase text. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = useCallback(() => {
    if (!outputText) {
      toast.error("No output to copy");
      return;
    }
    navigator.clipboard.writeText(outputText);
    toast.success("Copied to clipboard");
  }, [outputText]);

  const handleClear = () => {
    setInputText("");
    setOutputText("");
  };

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-4rem)] py-6 md:py-16 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-10 left-[10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] mix-blend-screen animate-pulse-subtle" />
          <div 
            className="absolute bottom-10 right-[10%] w-[400px] h-[400px] rounded-full bg-accent/20 blur-[100px] mix-blend-screen animate-pulse-subtle" 
            style={{ animationDelay: "1s" }} 
          />
        </div>

        <div className="container relative z-10 max-w-7xl mx-auto px-4">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-extrabold tracking-tight mb-4">
              <span className="gradient-primary-text">Transform</span> Your Text
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Elevate your writing with fresh vocabulary, improved clarity, and natural phrasing using our advanced paraphrasing engine.
            </p>
          </motion.div>

          {/* Main Content Workspace */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="relative bg-card/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 rounded-2xl md:rounded-[2.5rem] p-4 md:p-10 shadow-card-lg"
          >
            <div className="flex flex-col lg:flex-row gap-6 md:gap-12 items-stretch relative">
              
              {/* Input Section */}
              <div className="flex-1 flex flex-col relative z-10 group">
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl" />
                <div className="relative h-full flex flex-col">
                  <TextAreaBox
                    label="Original Text"
                    value={inputText}
                    onChange={setInputText}
                    placeholder="Paste your text here to paraphrase..."
                    wordCount={wordCount(inputText)}
                    maxHeight="450px"
                  />
                </div>
              </div>

              {/* Center Action Button (Desktop absolute, Mobile flex) */}
              <div className="hidden lg:flex items-center justify-center absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 z-20">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleParaphrase}
                    disabled={isProcessing || !inputText.trim()}
                    className="h-16 w-16 rounded-full shadow-2xl gradient-primary p-0 border-4 border-background transition-all hover:shadow-[0_0_30px_hsla(214,85%,32%,0.4)] relative group"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <ArrowRight className="h-7 w-7 text-white transition-transform group-hover:translate-x-1" />
                    )}
                  </Button>
                </motion.div>
              </div>

              {/* Mobile Action Button */}
              <div className="flex lg:hidden justify-center items-center py-4 z-20">
                <motion.div whileTap={{ scale: 0.98 }} className="w-full max-w-sm">
                  <Button
                    onClick={handleParaphrase}
                    disabled={isProcessing || !inputText.trim()}
                    variant="gradient"
                    size="xl"
                    className="w-full rounded-2xl h-14 text-lg shadow-xl relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <span className="relative flex items-center justify-center gap-2">
                      {isProcessing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <RefreshCcw className="h-5 w-5" />
                      )}
                      Paraphrase Now
                    </span>
                  </Button>
                </motion.div>
              </div>

              {/* Output Section */}
              <div className="flex-1 flex flex-col relative z-10 group">
                <div className="absolute -inset-2 bg-gradient-to-l from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl" />
                <div className="relative h-full flex flex-col">
                  <AnimatePresence>
                    {isProcessing && (
                      <motion.div 
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="absolute inset-0 z-20 bg-background/40 rounded-[1.5rem] flex items-center justify-center border border-primary/20"
                      >
                        <div className="flex flex-col items-center gap-4 bg-card/80 p-6 rounded-2xl shadow-xl backdrop-blur-md">
                          <Loader2 className="h-10 w-10 text-primary animate-spin" />
                          <p className="text-sm font-semibold text-primary animate-pulse tracking-wide">
                            Polishing your text...
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <TextAreaBox
                    label="Paraphrased Output"
                    value={outputText}
                    readOnly
                    placeholder="Your beautifully paraphrased text will appear here..."
                    wordCount={wordCount(outputText)}
                    maxHeight="450px"
                  />
                </div>
              </div>

            </div>

            {/* Footer Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-border/40 gap-6">
              <div className="flex items-center gap-3 bg-background/50 py-2 px-4 rounded-xl border border-border/50">
                <Switch 
                  id="auto-copy" 
                  checked={autoCopy} 
                  onCheckedChange={setAutoCopy} 
                />
                <label 
                  htmlFor="auto-copy" 
                  className="text-sm font-medium text-foreground cursor-pointer select-none"
                >
                  Auto-copy results
                </label>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <Button 
                  variant="secondary" 
                  onClick={handleClear} 
                  disabled={!inputText && !outputText} 
                  className="flex-1 sm:flex-none rounded-xl bg-background/50 hover:bg-background/80"
                >
                  <Trash2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  Clear
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCopy} 
                  disabled={!outputText} 
                  className="flex-1 sm:flex-none rounded-xl border-primary/30 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Text
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
