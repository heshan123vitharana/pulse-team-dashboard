import { type JSX } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import authService from "@/api/auth";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProjectsPage from "@/pages/Projects";
import SubmitReportPage from "@/pages/SubmitReport";
import TeamReportsPage from "@/pages/TeamReports";

// ─── Protected Route ──────────────────────────────────────────────────────────

/**
 * Guards every child route behind authentication.
 *
 * If the user is not authenticated (no token in localStorage) they are
 * redirected to `/login`. Using <Outlet /> keeps this guard layout-agnostic.
 */
function ProtectedRoute(): JSX.Element {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// ─── Manager Route ────────────────────────────────────────────────────────────

/**
 * Guards child routes so only Managers can access them.
 * Redirects to dashboard if the user does not have the 'manager' role.
 */
function ManagerRoute(): JSX.Element {
  const role = authService.getRole();
  
  if (role !== "manager") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

// ─── App ──────────────────────────────────────────────────────────────────────

/**
 * Root application component.
 *
 * Route map:
 *  /login       → LoginPage     (public)
 *  /dashboard   → DashboardPage (protected — requires valid token)
 *  /projects    → ProjectsPage  (protected)
 *  /submit-report → SubmitReportPage (protected)
 *  /team-reports → TeamReportsPage (protected, manager only)
 *  /            → redirect to /dashboard
 *  *            → redirect to /dashboard (catch-all)
 */
export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ─────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />

        {/* ── Protected routes ──────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/submit-report" element={<SubmitReportPage />} />
            
            {/* Manager-only routes */}
            <Route element={<ManagerRoute />}>
              <Route path="/team-reports" element={<TeamReportsPage />} />
            </Route>
          </Route>
        </Route>

        {/* ── Redirects ─────────────────────────────── */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
