import { type JSX, useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { getProjects, createProject, updateProject, deleteProject, assignUserToProject, unassignUserFromProject, type Project } from "@/api/projects";
import authService, { type User } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";

export default function ProjectsPage(): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isManageTeamDialogOpen, setIsManageTeamDialogOpen] = useState(false);
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
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      setLoading(true);
      await deleteProject(id);
      await fetchProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);
      setError("Failed to delete project.");
      setLoading(false);
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
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team's projects and workspaces.
          </p>
        </div>

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
                  <div className="text-sm font-medium text-destructive">
                    {formError}
                  </div>
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
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)} 
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Save Project"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={onEditOpenChange}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleEditProject}>
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>
                  Modify the project details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {formError && (
                  <div className="text-sm font-medium text-destructive">
                    {formError}
                  </div>
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
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)} 
                  disabled={isSubmitting}
                >
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
              <DialogTitle>Manage Team for {managingProject?.project_name}</DialogTitle>
              <DialogDescription>
                Assign or remove team members from this project.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-4 max-h-[300px] overflow-y-auto pr-2">
              {allUsers.length === 0 && <p className="text-sm text-muted-foreground">No users found.</p>}
              {allUsers.map(user => {
                // Find the fresh project object from state to check assignments
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
                )
              })}
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => setIsManageTeamDialogOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Global Error State */}
      {error && (
        <div className="p-4 rounded-md border border-destructive/50 bg-destructive/10 text-destructive font-medium">
          {error}
        </div>
      )}

      {/* Project Grid / Empty State */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex flex-col justify-between">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed bg-muted/30">
          <h3 className="text-xl font-semibold mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Get started by creating your first project. All your tasks will be organized under projects.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">{project.project_name}</CardTitle>
                {project.createdAt && (
                  <CardDescription>
                    Created on {new Date(project.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {project.description || "No description provided."}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2 border-t mt-auto">
                <Button variant="outline" size="sm" onClick={() => openManageTeamDialog(project)} className="mr-auto">
                  <Users className="mr-2 h-4 w-4" />
                  Team ({project.users?.length || 0})
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(project)} className="text-muted-foreground hover:text-foreground">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteProject(project.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
