import { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, LogOut } from "lucide-react";
import authService from "@/api/auth";
import { Button } from "@/components/ui/button";

/**
 * DashboardPage — placeholder shown after a successful login.
 * Replace this with your real dashboard layout once the route is wired up.
 */
export default function DashboardPage(): JSX.Element {
  const navigate = useNavigate();
  const role = authService.getRole();

  const handleLogout = (): void => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Minimal top bar */}
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm font-bold tracking-tight">Pulse Dashboard</span>
        </div>

        <div className="flex items-center gap-3">
          {role && (
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800">
              {role}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </Button>
        </div>
      </header>

      {/* Placeholder body */}
      <main className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
          <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard — coming soon
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          You&apos;re authenticated{role ? ` as a ${role}` : ""}. Build your dashboard
          content here and replace this placeholder.
        </p>
      </main>
    </div>
  );
}
