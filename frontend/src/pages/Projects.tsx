import { type JSX, useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { getProjects, createProject, updateProject, deleteProject, assignUserToProject, unassignUserFromProject, type Project } from "@/api/projects";
import authService, { type User } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";

export default function ProjectsPage(): JSX.Element {
  const isManager = authService.getRole()?.toLowerCase() === "manager";

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isManageTeamDialogOpen, setIsManageTeamDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [managingProject, setManagingProject] = useState<Project | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Failed to load projects. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await authService.getUsers();
      // Filter out managers if we only want team members, or keep all
      setAllUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Project name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      await createProject({ project_name: name, description });
      
      // Reset form & close dialog
      setName("");
      setDescription("");
      setIsDialogOpen(false);
      
      // Refresh list
      await fetchProjects();
    } catch (err) {
      console.error("Failed to create project:", err);
      setFormError("Failed to create project. Please check your inputs and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !editingProject) {
      setFormError("Project name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      await updateProject(editingProject.id, { project_name: name, description });
      
      setName("");
      setDescription("");
      setIsEditDialogOpen(false);
      setEditingProject(null);
      
      await fetchProjects();
    } catch (err) {
      console.error("Failed to update project:", err);
      setFormError("Failed to update project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    try {
      setLoading(true);
      await deleteProject(id);
      await fetchProjects();
      toast.success("Project deleted successfully");
    } catch (err) {
      console.error("Failed to delete project:", err);
      toast.error("Failed to delete project.");
      setLoading(false);
    } finally {
      setProjectToDelete(null);
    }
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setName(project.project_name || "");
    setDescription(project.description || "");
    setIsEditDialogOpen(true);
  };

  // Function to handle modal closing/resetting
  const onOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setName("");
      setDescription("");
      setFormError(null);
    }
  };

  const onEditOpenChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setName("");
      setDescription("");
      setFormError(null);
      setEditingProject(null);
    }
  };

  const openManageTeamDialog = (project: Project) => {
    setManagingProject(project);
    setIsManageTeamDialogOpen(true);
  };

  const handleToggleAssignment = async (userId: number) => {
    if (!managingProject) return;
    const isAssigned = managingProject.users?.some(u => u.id === userId);
    
    try {
      if (isAssigned) {
        await unassignUserFromProject(managingProject.id, userId);
      } else {
        await assignUserToProject(managingProject.id, userId);
      }
      // Re-fetch projects to get updated assignment list
      await fetchProjects();
      
      // Update managingProject reference to the new fetched one so the dialog UI updates instantly
      setManagingProject(prev => {
        if (!prev) return prev;
        const updated = projects.find(p => p.id === prev.id);
        if (updated) {
           // We need the NEW list of users, but we just called fetchProjects. 
           // State update will trigger re-render anyway, but let's just handle it via the projects array directly in the render
        }
        return prev;
      });
    } catch (err) {
      console.error("Failed to toggle assignment", err);
      alert("Failed to update user assignment");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team's projects and workspaces.
          </p>
        </div>

        {/* Only managers can create projects */}
        {isManager && (
          <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleCreateProject}>
                <DialogHeader>
                  <DialogTitle>Create Project</DialogTitle>
                  <DialogDescription>
                    Add a new project to your workspace. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {formError && (
                    <div className="text-sm font-medium text-destructive">{formError}</div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Q3 Marketing Campaign"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Briefly describe the project goals..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isSubmitting}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Save Project"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={onEditOpenChange}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleEditProject}>
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>Modify the project details below.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {formError && (
                  <div className="text-sm font-medium text-destructive">{formError}</div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Project Name</Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Manage Team Dialog */}
        <Dialog open={isManageTeamDialogOpen} onOpenChange={setIsManageTeamDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Manage Team — {managingProject?.project_name}</DialogTitle>
              <DialogDescription>Assign or remove team members from this project.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-4 max-h-[300px] overflow-y-auto pr-2">
              {allUsers.length === 0 && <p className="text-sm text-muted-foreground">No users found.</p>}
              {allUsers.map(user => {
                const freshProject = projects.find(p => p.id === managingProject?.id);
                const isAssigned = freshProject?.users?.some(u => u.id === user.id) || false;
                return (
                  <div key={user.id} className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Button
                      variant={isAssigned ? "destructive" : "secondary"}
                      size="sm"
                      onClick={() => handleToggleAssignment(user.id)}
                    >
                      {isAssigned ? "Remove" : "Assign"}
                    </Button>
                  </div>
                );
              })}
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => setIsManageTeamDialogOpen(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Error ─────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-md border border-destructive/50 bg-destructive/10 text-destructive font-medium">
          {error}
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────── */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-8">#</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Project Name</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden md:table-cell">Description</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground w-28">Members</th>
              {isManager && (
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground w-36">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              /* Skeleton rows */
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-4" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                  <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-64" /></td>
                  <td className="px-4 py-3 text-center"><Skeleton className="h-4 w-8 mx-auto" /></td>
                  {isManager && <td className="px-4 py-3"><Skeleton className="h-8 w-24 ml-auto" /></td>}
                </tr>
              ))
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={isManager ? 5 : 4} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="rounded-full bg-muted p-3">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium">No projects found</p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      {isManager
                        ? "Create your first project to get started."
                        : "You haven't been assigned to any projects yet."}
                    </p>
                    {isManager && (
                      <Button size="sm" onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Project
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              projects.map((project, index) => (
                <tr
                  key={project.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors group"
                >
                  {/* Row number */}
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {index + 1}
                  </td>

                  {/* Project name */}
                  <td className="px-4 py-3">
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {project.project_name}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-muted-foreground line-clamp-1 max-w-sm">
                      {project.description || (
                        <span className="italic opacity-50">No description</span>
                      )}
                    </span>
                  </td>

                  {/* Member count badge */}
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      <Users className="h-3 w-3" />
                      {project.users?.length ?? 0}
                    </span>
                  </td>

                  {/* Manager actions */}
                  {isManager && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => openManageTeamDialog(project)}
                        >
                          <Users className="h-3.5 w-3.5" />
                          Team
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEditDialog(project)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setProjectToDelete(project.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer: row count */}
        {!loading && projects.length > 0 && (
          <div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
            Showing {projects.length} project{projects.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => projectToDelete && handleDeleteProject(projectToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

