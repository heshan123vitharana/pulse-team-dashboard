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

// ─── App ──────────────────────────────────────────────────────────────────────

/**
 * Root application component.
 *
 * Route map:
 *  /login       → LoginPage     (public)
 *  /dashboard   → DashboardPage (protected — requires valid token)
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
          </Route>
        </Route>

        {/* ── Redirects ─────────────────────────────── */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
