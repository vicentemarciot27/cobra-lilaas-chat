import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import { Navbar } from "@/components/Navbar";
import Dashboard from "./pages/Dashboard";
import Canvas from "./pages/Canvas";
import Chat from "./pages/Chat";
import Knowledge from "./pages/Knowledge";
import Analytics from "./pages/Analytics";
import Dossier from "./pages/Dossier";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen w-full bg-background">
            <Navbar />
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/canvas" element={<Canvas />} />
              <Route path="/chat/:debtorId" element={<Chat />} />
              <Route path="/knowledge" element={<Knowledge />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/dossier/:debtorId" element={<Dossier />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
