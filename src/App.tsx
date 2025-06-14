
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/ThemeProvider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/useAuth';

import AppLayout from '@/layouts/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Metrics from '@/pages/Metrics';
import Departments from '@/pages/Departments';
import Managers from '@/pages/Managers';
import ManagersCreate from '@/pages/ManagersCreate';
import ManagersUpdate from '@/pages/ManagersUpdate';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import FirstAccess from '@/pages/FirstAccess';
import Notifications from '@/pages/Notifications';
import Diagnostic from '@/pages/Diagnostic';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Toaster />
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/first-access" element={<FirstAccess />} />
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="metrics" element={<Metrics />} />
                <Route path="departments" element={<Departments />} />
                <Route path="managers" element={<Managers />} />
                <Route path="managers/create" element={<ManagersCreate />} />
                <Route path="managers/update/:id" element={<ManagersUpdate />} />
                <Route path="settings" element={<Settings />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="diagnostico" element={<Diagnostic />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
