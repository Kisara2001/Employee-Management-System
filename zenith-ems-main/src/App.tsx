import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { initTheme } from "./store/theme";
import { isAuthenticated, clearAuth } from "./lib/auth";
import api from "./lib/api";
import { AppShell } from "./app/AppShell";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import NewEmployee from "./pages/Employees/New";
import EmployeeDetail from "./pages/Employees/Detail";
import EditEmployee from "./pages/Employees/Edit";
import DepartmentsPage from "./pages/Departments";
import DesignationsPage from "./pages/Designations";
import ShiftsPage from "./pages/Shifts";
import ShiftAssignmentsPage from "./pages/ShiftAssignments";
import AttendancePage from "./pages/Attendance";
import SalaryTemplatesPage from "./pages/SalaryTemplates";
import PayrollPage from "./pages/Payroll";
import ReportsPage from "./pages/Reports";
import NotFound from "./pages/NotFound";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  return !isAuthenticated() ? <>{children}</> : <Navigate to="/" replace />;
}

const App = () => {
  useEffect(() => {
    initTheme();
    // Validate token with backend; if invalid, clear and force login
    (async () => {
      try {
        if (isAuthenticated()) {
          await api.get('/auth/me');
        }
      } catch {
        clearAuth();
      }
    })();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="employees/new" element={<NewEmployee />} />
              <Route path="employees/:id" element={<EmployeeDetail />} />
              <Route path="employees/:id/edit" element={<EditEmployee />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="designations" element={<DesignationsPage />} />
              <Route path="shifts" element={<ShiftsPage />} />
              <Route path="shift-assignments" element={<ShiftAssignmentsPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="salary-templates" element={<SalaryTemplatesPage />} />
              <Route path="payroll" element={<PayrollPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="profile" element={<div className="p-6">Profile - Coming Soon</div>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
