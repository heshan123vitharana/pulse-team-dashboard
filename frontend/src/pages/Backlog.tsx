import React, { useState, useEffect } from "react";
import { getBacklogTasks, createTask, type Task } from "@/api/agile";
import { getProjects, type Project } from "@/api/projects";
import { Button } from "@/components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";

const Backlog: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPoints, setNewTaskPoints] = useState<number | "">("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch projects");
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadBacklog(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadBacklog = async (projectId: number) => {
    setLoading(true);
    try {
      const data = await getBacklogTasks(projectId);
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!selectedProjectId || !newTaskTitle.trim()) return;
    try {
      await createTask({
        title: newTaskTitle,
        project_id: selectedProjectId,
        sprint_id: null,
        story_points: newTaskPoints === "" ? null : Number(newTaskPoints)
      });
      setNewTaskTitle("");
      setNewTaskPoints("");
      setIsCreateOpen(false);
      loadBacklog(selectedProjectId);
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Backlog</h1>
          <p className="text-muted-foreground mt-2">Manage tasks before they are added to a sprint.</p>
        </div>
        
        {projects.length > 0 && (
          <select
            className="flex h-10 w-[200px] rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background"
            value={selectedProjectId || ""}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.project_name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold">Unassigned Tasks ({tasks.length})</h2>
        <Button onClick={() => setIsCreateOpen(true)}>+ Add Task</Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-card/50 text-muted-foreground shadow-sm">
              Your backlog is empty. Add tasks to start planning your next sprint.
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col">
                  <span className="font-medium text-lg">{task.title}</span>
                  {task.description && <span className="text-sm text-muted-foreground">{task.description}</span>}
                </div>
                <div className="flex items-center gap-4">
                  {task.story_points !== null && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {task.story_points}
                    </div>
                  )}
                  <span className="text-xs bg-secondary px-2 py-1 rounded-md text-secondary-foreground font-semibold">
                    {task.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Task Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Backlog</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Title</label>
              <Input
                placeholder="What needs to be done?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Story Points (optional)</label>
              <Input
                type="number"
                placeholder="e.g. 1, 2, 3, 5, 8"
                value={newTaskPoints}
                onChange={(e) => setNewTaskPoints(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTask}>Add to Backlog</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Backlog;
