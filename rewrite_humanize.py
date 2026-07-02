import re

filepath = r'f:\Project\PL_Humanize_New\src\pages\Humanize.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
content = content.replace(
    'import { Copy, Trash2, Wand2, Loader2, RefreshCw, Sparkles, Zap, Upload, History as HistoryIcon } from "lucide-react";',
    'import { Copy, Trash2, Wand2, Loader2, RefreshCw, Sparkles, Zap, Upload, History as HistoryIcon, FileText, CheckCircle2, AlertCircle, Settings, Clock } from "lucide-react";'
)

if 'CircularGauge' not in content:
    content = content.replace(
        'import { Layout } from "@/components/layout/Layout";',
        'import { Layout } from "@/components/layout/Layout";\nimport { CircularGauge } from "@/components/ui/CircularGauge";'
    )

new_return = """  return (
    <Layout>
      <div className="container py-8 md:py-16 relative">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-10 mt-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Advanced AI Bypass Technology</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Humanize AI Content <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text gradient-primary-lr">
                Instantly & Naturally
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform robotic AI text into natural human writing that flawlessly bypasses all major AI detectors.
            </p>
          </div>

          {/* Main Two-Panel Layout */}
          <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-2xl overflow-hidden animate-slide-up relative z-10">
            {/* Ambient Glow */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            
            <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
              {/* Input Panel */}
              <div className="p-5 md:p-8 flex flex-col relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tl-3xl lg:rounded-l-3xl"></div>
                
                <div className="flex flex-wrap items-center justify-between mb-4 relative z-10 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">AI Text Input</span>
                  </div>
                  {/* Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setHistoryOpen(true)}
                      className="text-xs h-8 bg-background/50 hover:bg-background border border-border/50 shadow-sm transition-all"
                    >
                      <HistoryIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
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
                      <Upload className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      Upload
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handlePaste}
                      className="text-xs h-8 bg-background/50 hover:bg-background border border-border/50 shadow-sm transition-all"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      Paste
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleTrySample}
                      className="text-xs h-8 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 shadow-sm transition-all"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
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
                    className="w-full h-72 md:h-80 p-5 bg-transparent resize-none focus:outline-none text-sm leading-relaxed scrollbar-thin z-10 relative text-foreground/90 placeholder:text-muted-foreground/60"
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
              <div className="p-5 md:p-8 flex flex-col relative group bg-muted/10">
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
                    className="w-full h-72 md:h-80 p-5 bg-transparent resize-none focus:outline-none text-sm leading-relaxed scrollbar-thin text-foreground/90 placeholder:text-muted-foreground/50"
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
                  
                  <div className="flex gap-2 relative z-10">
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
            <div className="border-t border-border/50 bg-background/80 backdrop-blur-xl p-5 md:px-8 relative z-20">
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
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => handleHumanize("rehumanize")}
                    disabled={isProcessing || isSmartHumanizing || !outputText.trim()}
                    className="flex-1 sm:flex-none h-11 border-border/50 shadow-sm hover:bg-muted/50 font-medium transition-all"
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
                    className="flex-1 sm:flex-none h-11 px-8 bg-foreground text-background hover:bg-foreground/90 font-medium shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
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
                    className="flex-1 sm:flex-none h-11 px-6 shadow-md shadow-primary/20 font-medium transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 group w-full sm:w-auto"
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
                    <p className="text-xl font-bold text-foreground capitalize relative z-10">{mode}</p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize relative z-10">{strength} strength</p>
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
  );"""

start_idx = content.find('  return (\n    <Layout>')
if start_idx == -1:
    start_idx = content.find('  return (')

end_idx = content.rfind('}')

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_return + '\n}\n'
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully rewrote Humanize.tsx")
else:
    print("Failed to find return block boundaries")
