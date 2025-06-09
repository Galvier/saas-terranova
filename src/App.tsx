import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { QueryClient } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"

import AppLayout from '@/components/AppLayout';
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

function App() {
  return (
    <QueryClient>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
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
              <Route path="diagnostic" element={<Diagnostic />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClient>
  );
}

export default App;
