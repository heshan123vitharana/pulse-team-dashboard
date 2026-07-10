import { type JSX, useState, useEffect } from "react";
import { getAllReports, type WeeklyReportResponse, type ReportFilters } from "@/api/reports";
import { getProjects, type Project } from "@/api/projects";
import authService, { type User as AuthUser } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { User, Briefcase } from "lucide-react";

export default function TeamReportsPage(): JSX.Element {
  const [reports, setReports] = useState<WeeklyReportResponse[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState<ReportFilters & { user_id?: number }>({
    user_id: undefined,
    project_id: undefined,
    start_date: "",
    end_date: "",
  });

  const fetchProjectsAndUsers = async () => {
    try {
      setLoadingProjects(true);
      setLoadingUsers(true);
      const [projectsData, usersData] = await Promise.all([
        getProjects(),
        authService.getUsers()
      ]);
      setProjects(projectsData);
      setUsers(usersData);
    } catch (err) {
      console.error("Failed to load filter data:", err);
    } finally {
      setLoadingProjects(false);
      setLoadingUsers(false);
    }
  };

  const fetchReports = async (currentFilters?: ReportFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllReports(currentFilters);
      setReports(data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setError("Failed to load team reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsAndUsers();
    fetchReports();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: (name === "project_id" || name === "user_id") ? (value ? Number(value) : undefined) : value,
    }));
  };

  const applyFilters = () => {
    fetchReports(filters as ReportFilters);
  };

  const clearFilters = () => {
    const emptyFilters = { user_id: undefined, project_id: undefined, start_date: "", end_date: "" };
    setFilters(emptyFilters);
    fetchReports(emptyFilters);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Reports</h1>
        <p className="text-muted-foreground mt-1">
          Review weekly reports submitted by your team members.
        </p>
      </div>

      {/* Filters Section */}
      <Card className="bg-muted/10 border-dashed">
        <CardContent className="p-4 sm:p-6 grid gap-4 md:grid-cols-5 items-end">
          <div className="grid gap-2">
            <Label htmlFor="user_id">Team Member</Label>
            <select
              id="user_id"
              name="user_id"
              value={filters.user_id || ""}
              onChange={handleFilterChange}
              disabled={loadingUsers}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                !filters.user_id && "text-muted-foreground"
              )}
            >
              <option value="">All Members</option>
              {users.map((u) => (
                <option key={u.id} value={u.id} className="text-foreground">
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project_id">Project</Label>
            <select
              id="project_id"
              name="project_id"
              value={filters.project_id || ""}
              onChange={handleFilterChange}
              disabled={loadingProjects}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                !filters.project_id && "text-muted-foreground"
              )}
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="text-foreground">
                  {p.project_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              value={filters.start_date || ""}
              onChange={handleFilterChange}
              className="bg-background"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              name="end_date"
              type="date"
              value={filters.end_date || ""}
              onChange={handleFilterChange}
              className="bg-background"
            />
          </div>

          <div className="flex gap-2 w-full">
            <Button onClick={applyFilters} className="flex-1">
              Apply
            </Button>
            <Button onClick={clearFilters} variant="outline" className="flex-1">
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Global Error State */}
      {error && (
        <div className="p-4 rounded-md border border-destructive/50 bg-destructive/10 text-destructive font-medium">
          {error}
        </div>
      )}

      {/* Reports Table */}
      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden mt-6">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground border-b">
            <tr>
              <th className="h-10 px-4 align-middle font-medium">Team Member</th>
              <th className="h-10 px-4 align-middle font-medium">Project</th>
              <th className="h-10 px-4 align-middle font-medium">Week</th>
              <th className="h-10 px-4 align-middle font-medium">Status</th>
              <th className="h-10 px-4 align-middle font-medium hidden md:table-cell">Summary</th>
              <th className="h-10 px-4 align-middle font-medium text-right">Hours</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading State (Skeleton Rows)
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b transition-colors">
                  <td className="p-4 align-middle"><Skeleton className="h-4 w-24" /></td>
                  <td className="p-4 align-middle"><Skeleton className="h-4 w-32" /></td>
                  <td className="p-4 align-middle"><Skeleton className="h-4 w-28" /></td>
                  <td className="p-4 align-middle"><Skeleton className="h-4 w-20" /></td>
                  <td className="p-4 align-middle hidden md:table-cell"><Skeleton className="h-4 w-full max-w-[200px]" /></td>
                  <td className="p-4 align-middle text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                </tr>
              ))
            ) : reports.length === 0 && !error ? (
              // Empty State
              <tr>
                <td colSpan={6} className="h-48 text-center align-middle">
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <h3 className="text-lg font-semibold mb-1">No reports found</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                      We couldn't find any team reports matching your current filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              reports.map((report) => (
                <tr key={report.id} className="border-b transition-colors hover:bg-muted/30">
                  <td className="p-4 align-middle font-medium whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      {report.user?.name || `User #${report.user_id}`}
                    </div>
                  </td>
                  <td className="p-4 align-middle text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      {report.project?.project_name || `Project #${report.project_id}`}
                    </div>
                  </td>
                  <td className="p-4 align-middle whitespace-nowrap text-muted-foreground">
                    {new Date(report.week_start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(report.week_end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-4 align-middle">
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary border-primary/20 whitespace-nowrap">
                      {report.submission_status}
                    </span>
                  </td>
                  <td className="p-4 align-middle hidden md:table-cell max-w-[300px]">
                    <div className="truncate text-muted-foreground" title={report.tasks_completed}>
                      <span className="text-foreground font-medium">✅ </span>
                      {report.tasks_completed.length > 6 ? report.tasks_completed.substring(0, 6) + "..." : report.tasks_completed}
                    </div>
                    {report.blockers && report.blockers.toLowerCase() !== "none" && (
                      <div className="truncate text-muted-foreground mt-1" title={report.blockers}>
                        <span className="text-destructive font-medium">⚠️ </span>
                        {report.blockers.length > 6 ? report.blockers.substring(0, 6) + "..." : report.blockers}
                      </div>
                    )}
                  </td>
                  <td className="p-4 align-middle text-right text-muted-foreground whitespace-nowrap">
                    {report.hours_worked ? `${report.hours_worked} hrs` : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer: row count */}
        {!loading && reports.length > 0 && (
          <div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
            Showing {reports.length} report{reports.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
