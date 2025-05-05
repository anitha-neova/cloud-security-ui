import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CloudConnectionPage from "./pages/CloudConnectionPage";
import CompliancePage from "./pages/CompliancePage";
import ResourceCreationPage from "./pages/ResourceCreationPage";
import { ProgressProvider } from "@/context/ProgressContext"; // 👈 import context

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProgressProvider> {/* 👈 Wrap here */}
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cloud-connect" element={<CloudConnectionPage />} />
            <Route path="/compliance" element={<CompliancePage />} />
            <Route path="/resource-creation" element={<ResourceCreationPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ProgressProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
