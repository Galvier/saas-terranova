
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import Login from "./pages/Login";
import FirstAccess from "./pages/FirstAccess";
import Dashboard from "./pages/Dashboard";
import Departments from "./pages/Departments";
import Managers from "./pages/Managers";
import ManagersCreate from "./pages/ManagersCreate";
import ManagersUpdate from "./pages/ManagersUpdate";
import Metrics from "./pages/Metrics";
import Settings from "./pages/Settings";
import Diagnostic from "./pages/Diagnostic";
import NotFound from "./pages/NotFound";
import AppLayout from "./layouts/AppLayout";
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected route component
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    // You could show a loading spinner here
    return <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>;
  }
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return <Outlet />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ThemeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/primeiro-acesso" element={<FirstAccess />} />
              
              {/* Public diagnostic routes - accessible without authentication */}
              <Route path="/diagnostico" element={<Diagnostic />} />
              <Route path="/admin/diagnostico" element={<Diagnostic />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/departments" element={<Navigate to="/setores" replace />} />
                  <Route path="/setores" element={<Departments />} />
                  <Route path="/managers" element={<Managers />} />
                  <Route path="/managers/new" element={<ManagersCreate />} />
                  <Route path="/managers/edit/:id" element={<ManagersUpdate />} />
                  <Route path="/metrics" element={<Metrics />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
