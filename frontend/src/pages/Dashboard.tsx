import { useEffect, useState, type JSX } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  TrendingUp,
  Users,
  ShieldCheck,
} from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type PieLabelRenderProps,
} from "recharts";

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

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface MemberStatus {
  user_id: number;
  name: string;
  status: "submitted" | "pending" | "late";
}

interface TrendPoint {
  week: string;
  reports: number;
  blockers: number;
}

interface DashboardMetrics {
  summary: {
    total_reports: number;
    open_blockers: number;
    active_projects: number;
    team_members: number;
    compliance_rate: number;
    submitted_this_week: number;
  };
  charts: {
    compliance: { status: string; count: number }[];
    project_workload: { project: string; count: number }[];
    trend: TrendPoint[];
    member_status: MemberStatus[];
  };
}

interface WeeklyReport {
  id: number;
  project_id: number;
  week_start_date: string;
  week_end_date: string;
  tasks_completed: string;
  hours_worked: number | null;
  submission_status: string;
  submitted_at: string;
  project?: { id: number; project_name: string };
}

// ─── Colour helpers ───────────────────────────────────────────────────────────

const PIE_COLORS: Record<string, string> = {
  submitted: "#22c55e",
  pending: "#f59e0b",
  late: "#ef4444",
  default: "#6366f1",
};

const MEMBER_STATUS_STYLES: Record<string, string> = {
  submitted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  pending:   "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  late:      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

// ─── Manager Dashboard ────────────────────────────────────────────────────────

function ManagerDashboard(): JSX.Element {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<DashboardMetrics>("/api/v1/reports/dashboard-metrics")
      .then((r) => setMetrics(r.data))
      .catch(() => setError("Failed to load dashboard metrics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
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

  const { summary, charts } = metrics;

  const pieData = charts.compliance.map((item) => ({
    ...item,
    color: PIE_COLORS[item.status.toLowerCase()] ?? PIE_COLORS.default,
  }));

  const TOOLTIP_STYLE = {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manager Overview</h2>
        <p className="text-muted-foreground">
          High-level view of your team's weekly reports, blockers, and compliance.
        </p>
      </div>

      {/* ── Summary Cards ───────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Total Reports */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Reports</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{summary.total_reports}</div>
            <p className="text-xs text-blue-700/70 dark:text-blue-300/70 mt-1">All time</p>
          </CardContent>
        </Card>

        {/* Submitted This Week */}
        <Card className="bg-green-50 dark:bg-green-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">This Week</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">{summary.submitted_this_week}</div>
            <p className="text-xs text-green-700/70 dark:text-green-300/70 mt-1">Submitted</p>
          </CardContent>
        </Card>

        {/* Compliance Rate */}
        <Card className="bg-violet-50 dark:bg-violet-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-violet-900 dark:text-violet-100">Compliance</CardTitle>
            <ShieldCheck className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-violet-900 dark:text-violet-100">{summary.compliance_rate}%</div>
            <p className="text-xs text-violet-700/70 dark:text-violet-300/70 mt-1">Submission rate</p>
          </CardContent>
        </Card>

        {/* Open Blockers */}
        <Card className="bg-red-50 dark:bg-red-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">Open Blockers</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900 dark:text-red-100">{summary.open_blockers}</div>
            <p className="text-xs text-red-700/70 dark:text-red-300/70 mt-1">Across all reports</p>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">{summary.active_projects}</div>
            <p className="text-xs text-amber-700/70 dark:text-amber-300/70 mt-1">Active projects</p>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card className="bg-slate-50 dark:bg-slate-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Team Members</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{summary.team_members}</div>
            <p className="text-xs text-slate-700/70 dark:text-slate-300/70 mt-1">Registered users</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Row 1: Trend line + Compliance pie ──────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Line Chart — Submission trend + blockers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Submission Trend
            </CardTitle>
            <CardDescription>Reports submitted & blockers — last 8 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            {charts.trend?.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={charts.trend} margin={{ top: 5, right: 16, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="reports"
                    name="Reports"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="blockers"
                    name="Blockers"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No data yet</div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart — Submission status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-violet-500" />
              Submission Status
            </CardTitle>
            <CardDescription>All-time report status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(props: PieLabelRenderProps) => {
                      const name = String(props.name ?? "");
                      const pct = ((Number(props.percent) || 0) * 100).toFixed(0);
                      return `${name} ${pct}%`;
                    }}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Row 2: Project bar chart + Member status matrix ─── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bar Chart — Workload by project */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-500" />
              Workload by Project
            </CardTitle>
            <CardDescription>Number of reports submitted per project</CardDescription>
          </CardHeader>
          <CardContent>
            {charts.project_workload?.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={charts.project_workload} margin={{ top: 5, right: 16, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="project"
                    tick={{ fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="count" name="Reports" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Per-member submission status this week */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-500" />
              This Week's Status
            </CardTitle>
            <CardDescription>Per-member report status for the current week</CardDescription>
          </CardHeader>
          <CardContent>
            {charts.member_status?.length > 0 ? (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {charts.member_status.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2"
                  >
                    <span className="text-sm font-medium">{member.name}</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        MEMBER_STATUS_STYLES[member.status] ?? "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No team members found</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Team Member Dashboard ────────────────────────────────────────────────────

function TeamMemberDashboard(): JSX.Element {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<WeeklyReport[]>("/api/v1/reports/my-reports")
      .then((r) => setReports(r.data.slice(0, 5)))
      .catch(() => setError("Failed to load your recent reports."))
      .finally(() => setLoading(false));
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

      {/* Recent Reports */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">Recent Reports</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/my-reports">View all</Link>
          </Button>
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
                        {new Date(report.week_start_date).toLocaleDateString()} –{" "}
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
                      <Link to={`/submit-report/${report.id}`}>Edit</Link>
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

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function DashboardPage(): JSX.Element {
  const role = authService.getRole();
  const isManager = role?.toLowerCase() === "manager";
  return <div className="w-full">{isManager ? <ManagerDashboard /> : <TeamMemberDashboard />}</div>;
}
