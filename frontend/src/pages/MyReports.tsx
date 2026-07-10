import { type JSX, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyReports, deleteReport, type WeeklyReportResponse } from "@/api/reports";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Briefcase, AlertCircle, CheckCircle, Pencil, Trash2, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function MyReportsPage(): JSX.Element {
  const navigate = useNavigate();
  const [reports, setReports] = useState<WeeklyReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);

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
    try {
      setLoading(true);
      await deleteReport(id);
      await fetchReports();
      toast.success("Report deleted successfully");
    } catch (err) {
      console.error("Failed to delete report:", err);
      toast.error("Failed to delete report. It may have already been deleted.");
      setLoading(false);
    } finally {
      setReportToDelete(null);
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

      {/* Reports Table */}
      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground border-b">
            <tr>
              <th className="h-10 px-4 align-middle font-medium">Week</th>
              <th className="h-10 px-4 align-middle font-medium">Project</th>
              <th className="h-10 px-4 align-middle font-medium">Status</th>
              <th className="h-10 px-4 align-middle font-medium hidden md:table-cell">Summary</th>
              <th className="h-10 px-4 align-middle font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading State (Skeleton Rows)
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b transition-colors">
                  <td className="p-4 align-middle"><Skeleton className="h-4 w-24" /></td>
                  <td className="p-4 align-middle"><Skeleton className="h-4 w-32" /></td>
                  <td className="p-4 align-middle"><Skeleton className="h-4 w-20" /></td>
                  <td className="p-4 align-middle hidden md:table-cell"><Skeleton className="h-4 w-full max-w-[200px]" /></td>
                  <td className="p-4 align-middle text-right"><Skeleton className="h-8 w-16 ml-auto" /></td>
                </tr>
              ))
            ) : reports.length === 0 && !error ? (
              // Empty State
              <tr>
                <td colSpan={5} className="h-48 text-center align-middle">
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <h3 className="text-lg font-semibold mb-1">No reports yet</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
                      You haven't submitted any weekly reports. Create your first report to keep your manager updated.
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/submit-report">
                        <Plus className="mr-2 h-4 w-4" />
                        Submit First Report
                      </Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              reports.map((report) => (
                <tr key={report.id} className="border-b transition-colors hover:bg-muted/30">
                  <td className="p-4 align-middle font-medium whitespace-nowrap">
                    {new Date(report.week_start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(report.week_end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Briefcase className="h-3.5 w-3.5" />
                      {report.project?.project_name || `Project #${report.project_id}`}
                    </div>
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
                  <td className="p-4 align-middle text-right whitespace-nowrap">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/submit-report/${report.id}`)} title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setReportToDelete(report.id)} title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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

      <AlertDialog open={!!reportToDelete} onOpenChange={(open) => !open && setReportToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => reportToDelete && handleDelete(reportToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
