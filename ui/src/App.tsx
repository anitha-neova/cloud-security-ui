import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Navigate } from "react-router-dom";
import CloudConnectionPage from "./pages/CloudConnectionPage";
import CompliancePage from "./pages/CompliancePage";
import ResourceCreationPage from "./pages/ResourceCreationPage";
import SupportPage from "./pages/SupportPage";
import ReportsPage from "@/pages/ReportsPage.tsx";
import LoginPage from "./pages/LoginPage";
import LogoutPage from "./pages/LogoutPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ProgressProvider } from "@/context/ProgressContext";
import AdminContactPage from "./pages/AdminContactPage";
import SignupPage from "./pages/SignupPage";
import ResetPassword from "@/pages/ResetPassword.tsx";
// import AdminProtectedRoute from "./components/AdminProtectedRoute";
import CreateUserPage from "./pages/CreateUserPage";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";

const queryClient = new QueryClient();
const role = localStorage.getItem("user_role");

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
            {/* Public Routes */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/contact_admin" element={<AdminContactPage />} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route element={<ProtectedRoute />}>
              <Route
                path="/create-user"
                element={
                  <AdminProtectedRoute allowedRoles={["admin"]}>
                    <CreateUserPage />
                  </AdminProtectedRoute>
                }
              />
              <Route path="/create-user" element={<CreateUserPage />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/cloud-connect" element={<CloudConnectionPage />} />
              <Route path="/compliance" element={<CompliancePage />} />
              <Route
                path="/resource-creation"
                element={<ResourceCreationPage />}
              />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ProgressProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;