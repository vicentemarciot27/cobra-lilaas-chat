import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import { Navbar } from "@/components/Navbar";
import Dashboard from "./pages/Dashboard";
import Canvas from "./pages/Canvas";
import WorkflowsView from "./pages/WorkflowsView";
import Chat from "./pages/Chat";
import Knowledge from "./pages/Knowledge";
import Analytics from "./pages/Analytics";
import Dossier from "./pages/Dossier";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import { useLocation } from "react-router-dom";

const App = () => {
  // Wrap App to use react-router hooks (outside BrowserRouter is fine in v6)
  const MainContent = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const hasRulerParam = searchParams.has('ruler');
    const isCanvasEditor = location.pathname === "/canvas" && hasRulerParam;

    return (
      <div className="min-h-screen w-full bg-background">
        {!isCanvasEditor && <Navbar />}
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/canvas" element={hasRulerParam ? <Canvas /> : <WorkflowsView />} />
          <Route path="/chat/:debtorId" element={<Chat />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/dossier/:debtorId" element={<Dossier />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <MainContent />
          </BrowserRouter>
        </DataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
