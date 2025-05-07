import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// @ts-ignore
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CloudConnectionPage from "./pages/CloudConnectionPage";
import CompliancePage from "./pages/CompliancePage";
import ResourceCreationPage from "./pages/ResourceCreationPage";
import SupportPage from "./pages/SupportPage";
import { ProgressProvider } from "@/context/ProgressContext";
import ReportsPage from "@/pages/ReportsPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProgressProvider>
        <Toaster
          toastOptions={{
            className:
              "bg-blue-500 text-white rounded-lg shadow-md border-blue-200 dark:bg-blue-600 dark:border-gray-700 transition-all duration-200",
          }}
        />
        <Sonner
          toastOptions={{
            className:
              "bg-blue-500 text-white rounded-lg shadow-md border-blue-200 dark:bg-blue-600 dark:border-gray-700 transition-all duration-200",
          }}
        />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cloud-connect" element={<CloudConnectionPage />} />
            <Route path="/resource-creation" element={<ResourceCreationPage />} />
            <Route path="/compliance" element={<CompliancePage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/login" element={<div className="min-h-screen bg-blue-50 dark:bg-gray-800 flex items-center justify-center text-gray-800 dark:text-white">Login Page</div>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ProgressProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;