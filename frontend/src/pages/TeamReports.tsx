import { type JSX, useState, useEffect } from "react";
import { getAllReports, type WeeklyReportResponse, type ReportFilters } from "@/api/reports";
import { getProjects, type Project } from "@/api/projects";
import authService, { type User as AuthUser } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Calendar, User, Briefcase, AlertCircle, CheckCircle } from "lucide-react";

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
                  {p.name || (p as any).project_name}
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

      {/* Reports Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-1/2 mb-1" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reports.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed bg-muted/30">
          <h3 className="text-xl font-semibold mb-2">No reports found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            We couldn't find any team reports matching your current filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b bg-muted/5">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      {report.user?.name || `User #${report.user_id}`}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5 mt-1.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      {report.project?.project_name || `Project #${report.project_id}`}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border-primary/20">
                      {report.submission_status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 pt-4 space-y-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground border-b pb-3">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(report.week_start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                    {" - "} 
                    {new Date(report.week_end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium flex items-center gap-1.5 text-foreground mb-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Completed
                    </h4>
                    <p className="text-muted-foreground line-clamp-3 pl-5.5">
                      {report.tasks_completed}
                    </p>
                  </div>

                  {report.blockers && report.blockers.toLowerCase() !== "none" && (
                    <div>
                      <h4 className="font-medium flex items-center gap-1.5 text-foreground mb-1">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        Blockers
                      </h4>
                      <p className="text-muted-foreground line-clamp-2 pl-5.5">
                        {report.blockers}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-3 border-t bg-muted/5 text-xs text-muted-foreground flex justify-between">
                <span>Submitted: {new Date(report.submitted_at).toLocaleDateString()}</span>
                {report.hours_worked ? <span>{report.hours_worked} hrs logged</span> : null}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
