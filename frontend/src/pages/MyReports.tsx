import { type JSX, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyReports, deleteReport, type WeeklyReportResponse } from "@/api/reports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Briefcase, AlertCircle, CheckCircle, Pencil, Trash2, Plus } from "lucide-react";

export default function MyReportsPage(): JSX.Element {
  const navigate = useNavigate();
  const [reports, setReports] = useState<WeeklyReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyReports();
      setReports(data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setError("Failed to load your reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteReport(id);
      await fetchReports();
    } catch (err) {
      console.error("Failed to delete report:", err);
      setError("Failed to delete report. It may have already been deleted.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Reports</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your weekly status reports.
          </p>
        </div>
        <Button asChild>
          <Link to="/submit-report">
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Link>
        </Button>
      </div>

      {/* Global Error State */}
      {error && (
        <div className="p-4 rounded-md border border-destructive/50 bg-destructive/10 text-destructive font-medium">
          {error}
        </div>
      )}

      {/* Reports Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
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
          <h3 className="text-xl font-semibold mb-2">No reports yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            You haven't submitted any weekly reports. Create your first report to keep your manager updated.
          </p>
          <Button asChild variant="outline">
            <Link to="/submit-report">
              <Plus className="mr-2 h-4 w-4" />
              Submit First Report
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b bg-muted/5">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {new Date(report.week_start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                      {" - "} 
                      {new Date(report.week_end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
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
              <CardFooter className="pt-3 border-t bg-muted/5 text-xs text-muted-foreground flex justify-between items-center">
                <span>Submitted: {new Date(report.submitted_at).toLocaleDateString()}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/submit-report/${report.id}`)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(report.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
