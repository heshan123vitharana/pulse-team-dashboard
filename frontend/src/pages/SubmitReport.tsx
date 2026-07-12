import { type JSX, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProjects, type Project } from "@/api/projects";
import { submitReport, updateReport, getReport, type WeeklyReportCreate } from "@/api/reports";
import { getActiveSprint, autoGenerateReport } from "@/api/agile";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function SubmitReportPage(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  // State for projects dropdown
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingReport, setLoadingReport] = useState(isEditMode);
  
  // Form State
  const [formData, setFormData] = useState<Partial<WeeklyReportCreate>>({
    blockers: "None", // default per requirements
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const handleAutoFill = async () => {
    if (!formData.project_id) {
      toast.error("Please select a project first.");
      return;
    }
    
    try {
      setIsAutoFilling(true);
      const sprint = await getActiveSprint(formData.project_id);
      if (!sprint) {
        toast.error("No active sprint found for this project.");
        return;
      }
      
      const reportData = await autoGenerateReport(sprint.id);
      setFormData(prev => ({
        ...prev,
        tasks_completed: reportData.tasks_completed,
        tasks_planned: reportData.tasks_planned,
        week_start_date: sprint.start_date,
        week_end_date: sprint.end_date,
      }));
      toast.success("Report auto-filled from Active Sprint!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to auto-fill report.");
    } finally {
      setIsAutoFilling(false);
    }
  };

  // Fetch projects and (if editing) the report
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingProjects(true);
        const data = await getProjects();
        setProjects(data);

        if (isEditMode && id) {
          try {
            setLoadingReport(true);
            const report = await getReport(Number(id));
            setFormData({
              project_id: report.project_id,
              week_start_date: report.week_start_date,
              week_end_date: report.week_end_date,
              tasks_completed: report.tasks_completed,
              tasks_planned: report.tasks_planned,
              blockers: report.blockers,
              hours_worked: report.hours_worked,
              notes: report.notes,
            });
          } catch (reportErr) {
            console.error("Failed to fetch report:", reportErr);
            setError("Could not load the report you are trying to edit.");
          } finally {
            setLoadingReport(false);
          }
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Could not load projects for the dropdown. Please try refreshing.");
      } finally {
        setLoadingProjects(false);
      }
    };
    
    fetchInitialData();
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "project_id" || name === "hours_worked" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.project_id || !formData.week_start_date || !formData.week_end_date || !formData.tasks_completed || !formData.tasks_planned) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      if (isEditMode && id) {
        await updateReport(Number(id), formData);
        navigate("/my-reports");
      } else {
        await submitReport(formData as WeeklyReportCreate);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Failed to save report:", err);
      setError("Failed to save your report. Please check your inputs and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingReport) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded-md"></div>
        <div className="h-96 w-full bg-muted animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? "Edit Weekly Report" : "Submit Weekly Report"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEditMode ? "Update your report details below." : "Provide an update on your progress, plans, and any blockers."}
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <CardTitle>Report Details</CardTitle>
                <CardDescription>All fields marked with an asterisk (*) are required.</CardDescription>
              </div>
              <Button 
                type="button" 
                variant="secondary" 
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                onClick={handleAutoFill}
                disabled={isAutoFilling || isSubmitting || !formData.project_id}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isAutoFilling ? "Auto-Filling..." : "Auto-Fill from Active Sprint"}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm font-medium rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="project_id">Project *</Label>
              <select
                id="project_id"
                name="project_id"
                value={formData.project_id || ""}
                onChange={handleChange}
                disabled={loadingProjects || isSubmitting}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                  !formData.project_id && "text-muted-foreground"
                )}
                required
              >
                <option value="" disabled>
                  {loadingProjects ? "Loading projects..." : "Select a project"}
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="text-foreground">
                    {p.project_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="week_start_date">Week Start Date *</Label>
                <Input
                  id="week_start_date"
                  name="week_start_date"
                  type="date"
                  value={formData.week_start_date || ""}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="week_end_date">Week End Date *</Label>
                <Input
                  id="week_end_date"
                  name="week_end_date"
                  type="date"
                  value={formData.week_end_date || ""}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tasks_completed">Tasks Completed *</Label>
              <Textarea
                id="tasks_completed"
                name="tasks_completed"
                placeholder="What did you accomplish this week?"
                value={formData.tasks_completed || ""}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tasks_planned">Tasks Planned *</Label>
              <Textarea
                id="tasks_planned"
                name="tasks_planned"
                placeholder="What are your goals for next week?"
                value={formData.tasks_planned || ""}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="blockers">Blockers</Label>
              <Textarea
                id="blockers"
                name="blockers"
                placeholder="Any issues blocking your progress?"
                value={formData.blockers || ""}
                onChange={handleChange}
                disabled={isSubmitting}
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hours_worked">Hours Worked (Optional)</Label>
              <Input
                id="hours_worked"
                name="hours_worked"
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g., 40"
                value={formData.hours_worked || ""}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes / Links (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Any additional context, links to PRs, docs, or references…"
                value={formData.notes || ""}
                onChange={handleChange}
                disabled={isSubmitting}
                rows={2}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2 border-t pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(isEditMode ? "/my-reports" : "/dashboard")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : (isEditMode ? "Update Report" : "Submit Report")}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
