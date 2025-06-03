
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Metrics from "./pages/Metrics";
import Departments from "./pages/Departments";
import Managers from "./pages/Managers";
import ManagersCreate from "./pages/ManagersCreate";
import ManagersUpdate from "./pages/ManagersUpdate";
import Settings from "./pages/Settings";
import Diagnostic from "./pages/Diagnostic";
import FirstAccess from "./pages/FirstAccess";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import AppLayout from "./layouts/AppLayout";

import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/first-access" element={<FirstAccess />} />
                
                {/* Protected routes with layout */}
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/metrics" element={<Metrics />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/departments" element={<Departments />} />
                  <Route path="/managers" element={<Managers />} />
                  <Route path="/managers/create" element={<ManagersCreate />} />
                  <Route path="/managers/:id/edit" element={<ManagersUpdate />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/diagnostic" element={<Diagnostic />} />
                </Route>
                
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
