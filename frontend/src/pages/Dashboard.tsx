import { useEffect, useState, type JSX } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  BarChart,
  CheckCircle2,
  Clock,
  PieChart,
  Plus,
} from "lucide-react";

import apiClient from "@/api/client";
import authService from "@/api/auth";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface DashboardMetrics {
  summary: {
    total_reports: number;
    open_blockers: number;
    active_projects: number;
    team_members: number;
  };
  charts: {
    compliance: { status: string; count: number }[];
    project_workload: { project: string; count: number }[];
  };
}

interface Project {
  id: number;
  project_name: string;
  description: string | null;
}

interface WeeklyReport {
  id: number;
  project_id: number;
  week_start_date: string;
  week_end_date: string;
  tasks_completed: string;
  tasks_planned: string;
  blockers: string;
  hours_worked: number | null;
  notes: string | null;
  user_id: number;
  submission_status: string;
  submitted_at: string;
  project?: Project;
}

// ─── Manager Dashboard View ──────────────────────────────────────────────────

function ManagerDashboard(): JSX.Element {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await apiClient.get<DashboardMetrics>(
          "/api/v1/reports/dashboard-metrics"
        );
        setMetrics(response.data);
      } catch (err: unknown) {
        console.error(err);
        setError("Failed to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!metrics) return <></>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">
          A high-level view of your team's weekly reports and blockers.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{metrics.summary.total_reports}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Blockers</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{metrics.summary.open_blockers}</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <BarChart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{metrics.summary.active_projects}</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{metrics.summary.team_members}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-500" />
              Compliance
            </CardTitle>
            <CardDescription>
              Report submission status breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.charts.compliance.length > 0 ? (
              <div className="space-y-4">
                {metrics.charts.compliance.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.status}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.count} report(s)
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-indigo-500" />
              Project Workload
            </CardTitle>
            <CardDescription>
              Reports submitted per project
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.charts.project_workload.length > 0 ? (
              <div className="space-y-4">
                {metrics.charts.project_workload.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.project}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.count} report(s)
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Team Member Dashboard View ──────────────────────────────────────────────

function TeamMemberDashboard(): JSX.Element {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await apiClient.get<WeeklyReport[]>(
          "/api/v1/reports/my-reports"
        );
        setReports(response.data.slice(0, 5)); // Just show recent 5 on dashboard
      } catch (err: unknown) {
        console.error(err);
        setError("Failed to load your recent reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:from-blue-950/40 dark:to-indigo-950/40 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-blue-950 dark:text-blue-50">
            Welcome back!
          </h2>
          <p className="mt-1 text-sm text-blue-800/80 dark:text-blue-200/80">
            Keep your team in the loop. Submit your weekly progress report.
          </p>
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link to="/submit-report" className="gap-2">
            <Plus className="h-4 w-4" />
            Submit Weekly Report
          </Link>
        </Button>
      </div>

      {/* Recent Reports List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">Recent Reports</h3>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : reports.length > 0 ? (
          <div className="grid gap-3">
            {reports.map((report) => (
              <Card key={report.id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center p-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {report.project?.project_name || "Unknown Project"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {new Date(report.week_start_date).toLocaleDateString()} -{" "}
                        {new Date(report.week_end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {report.submission_status}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {report.hours_worked || 0} hrs
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex shrink-0 sm:mt-0">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/reports/${report.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center py-10 text-center">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No reports yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You haven't submitted any weekly reports.
            </p>
            <Button variant="outline" className="mt-4 gap-2" asChild>
              <Link to="/submit-report">
                <Plus className="h-4 w-4" />
                Create your first report
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ─────────────────────────────────────────────────────

export default function DashboardPage(): JSX.Element {
  const role = authService.getRole();
  const isManager = role?.toLowerCase() === "manager";

  return (
    <div className="w-full">
      {isManager ? <ManagerDashboard /> : <TeamMemberDashboard />}
    </div>
  );
}
