import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import Home from "./pages/Home";
import Humanize from "./pages/Humanize";
import Paraphrase from "./pages/Paraphrase";
import AIDetector from "./pages/AIDetector";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";

const queryClient = new QueryClient();

function ScrollToTop() {
  useScrollToTop();
  return null;
}

const isElectron = typeof window !== 'undefined' && 
  (window.navigator.userAgent.toLowerCase().includes('electron') || (window as any).electronAPI);

const App = () => {
  const Router = isElectron ? HashRouter : BrowserRouter;
  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="pl-humanize-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Router {...(!isElectron ? { basename: import.meta.env.BASE_URL } : {})}>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/humanize" element={<Humanize />} />
              <Route path="/paraphrase" element={<Paraphrase />} />
              <Route path="/ai-detector" element={<AIDetector />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Analytics />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
