import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getProjects, type Project } from "@/api/projects";
import {
  getActiveSprint,
  getTasksForSprint,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  createSprint,
  type Sprint,
  type Task,
} from "@/api/agile";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ─── Sortable Task Card ────────────────────────────────────────────────────────
interface SortableTaskProps {
  task: Task;
  onClick: () => void;
}

function SortableTask({ task, onClick }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-2 cursor-grab active:cursor-grabbing touch-none group">
      <Card className="hover:shadow-md transition-shadow relative">
        <CardHeader className="p-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-sm font-semibold pr-6">{task.title}</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onPointerDown={(e) => e.stopPropagation()} // Prevent dragging when clicking button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
          {task.description && (
            <CardDescription className="text-xs line-clamp-2 mt-1">
              {task.description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    </div>
  );
}

// ─── Droppable Column Component ────────────────────────────────────────────────
function KanbanColumn({
  col,
  tasks,
  openTaskDialog,
  openEditDialog
}: {
  col: { id: string; title: string };
  tasks: Task[];
  openTaskDialog: (status: string) => void;
  openEditDialog: (task: Task) => void;
}) {
  const { setNodeRef } = useDroppable({ id: col.id });
  return (
    <div className="flex-1 min-w-[300px] flex flex-col bg-muted/40 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{col.title}</h3>
        <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      <SortableContext
        id={col.id}
        items={tasks.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="flex-1 min-h-[200px]">
          {tasks.map(task => (
            <SortableTask key={task.id} task={task} onClick={() => openEditDialog(task)} />
          ))}
        </div>
      </SortableContext>
      
      <Button
        variant="ghost"
        className="w-full mt-2 text-muted-foreground hover:text-foreground justify-start"
        onClick={() => openTaskDialog(col.id)}
      >
        <Plus className="mr-2 h-4 w-4" /> Add Task
      </Button>
    </div>
  );
}

// ─── Main Kanban Board Component ──────────────────────────────────────────────
const COLUMNS = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "DONE", title: "Done" },
];

export default function KanbanBoard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // New Task Dialog State
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [newTaskColumn, setNewTaskColumn] = useState("TODO");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  
  // Edit Task Dialog State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editTaskAssignee, setEditTaskAssignee] = useState<number | "">("");
  
  // New Sprint Dialog State (if no sprint exists)
  const [isSprintDialogOpen, setIsSprintDialogOpen] = useState(false);
  const [newSprintName, setNewSprintName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const projs = await getProjects();
      setProjects(projs);
      if (projs.length > 0) {
        setSelectedProjectId(projs[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      toast.error("Failed to load projects");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      loadSprintData(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadSprintData = async (projectId: number) => {
    setLoading(true);
    try {
      const sprint = await getActiveSprint(projectId);
      setActiveSprint(sprint);
      
      if (sprint) {
        const sprintTasks = await getTasksForSprint(sprint.id);
        setTasks(sprintTasks);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sprint data");
    } finally {
      setLoading(false);
    }
  };

  const currentProject = projects.find(p => p.id === selectedProjectId);
  const projectUsers = currentProject?.users || [];

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = Number(active.id);
    const overId = over.id as string;
    
    // Find the new status. If dropped over a column, overId is column id. 
    // If dropped over another task, overId is task id.
    let newStatus = overId;
    if (!COLUMNS.find(c => c.id === overId)) {
      const overTask = tasks.find(t => t.id === Number(overId));
      if (overTask) {
        newStatus = overTask.status;
      } else {
        return;
      }
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      toast.error("Failed to update task status");
      // Revert on error
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: task.status } : t));
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSprint || !newTaskTitle.trim()) return;

    try {
      const task = await createTask({
        title: newTaskTitle,
        description: newTaskDescription,
        sprint_id: activeSprint.id,
      });
      setTasks(prev => [...prev, { ...task, status: newTaskColumn }]);
      
      // We also need to update the status to the column we created it in, 
      // since the default is "TODO" in backend, but user might click Add in "DONE" column.
      if (newTaskColumn !== "TODO") {
         await updateTaskStatus(task.id, newTaskColumn);
         setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newTaskColumn } : t));
      }
      
      setIsTaskDialogOpen(false);
      setNewTaskTitle("");
      setNewTaskDescription("");
      toast.success("Task created");
    } catch (err) {
      toast.error("Failed to create task");
    }
  };
  
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTaskTitle.trim()) return;
    
    try {
      const updatedData = {
        title: editTaskTitle,
        description: editTaskDescription,
        assignee_id: editTaskAssignee === "" ? null : Number(editTaskAssignee)
      };
      
      const updatedTask = await updateTask(editingTask.id, updatedData);
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...updatedTask } : t));
      
      setIsEditDialogOpen(false);
      setEditingTask(null);
      toast.success("Task updated");
    } catch (err) {
      toast.error("Failed to update task");
    }
  };
  
  const handleDeleteTask = async () => {
    if (!editingTask) return;
    
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await deleteTask(editingTask.id);
      setTasks(prev => prev.filter(t => t.id !== editingTask.id));
      setIsEditDialogOpen(false);
      setEditingTask(null);
      toast.success("Task deleted");
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };
  
  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !newSprintName.trim()) return;
    
    try {
      // Basic 2 week sprint
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 14);
      
      await createSprint({
        name: newSprintName,
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        project_id: selectedProjectId,
        goal: "",
        is_active: true
      });
      
      setIsSprintDialogOpen(false);
      setNewSprintName("");
      toast.success("Sprint created!");
      loadSprintData(selectedProjectId);
    } catch (err) {
       toast.error("Failed to create sprint");
    }
  }

  const openTaskDialog = (status: string) => {
    setNewTaskColumn(status);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setIsTaskDialogOpen(true);
  };
  
  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description || "");
    setEditTaskAssignee(task.assignee_id || "");
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading board...</div>;
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* ─── Header area ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kanban Board</h1>
          <p className="text-muted-foreground mt-1">Manage your sprint tasks here.</p>
        </div>
        
        <select
          value={selectedProjectId || ""}
          onChange={(e) => setSelectedProjectId(Number(e.target.value))}
          className="flex h-10 w-[200px] rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.project_name}</option>
          ))}
        </select>
      </div>

      {/* ─── Sprint Info ──────────────────────────────────────────────────────── */}
      {!activeSprint ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-10 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">No Active Sprint</h3>
              <p className="text-muted-foreground text-sm">Create a sprint to start managing tasks.</p>
            </div>
            
            <Dialog open={isSprintDialogOpen} onOpenChange={setIsSprintDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Start Sprint</Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateSprint}>
                  <DialogHeader>
                    <DialogTitle>Start New Sprint</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="sprintName">Sprint Name</Label>
                      <Input
                        id="sprintName"
                        value={newSprintName}
                        onChange={(e) => setNewSprintName(e.target.value)}
                        placeholder="e.g. Sprint 1"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsSprintDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Create Sprint</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            
          </CardContent>
        </Card>
      ) : (
        <div className="mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {activeSprint.name}
            <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
              {activeSprint.start_date} to {activeSprint.end_date}
            </span>
          </h2>
          {activeSprint.goal && <p className="text-sm text-muted-foreground mt-1">{activeSprint.goal}</p>}
        </div>
      )}

      {/* ─── Kanban Columns ───────────────────────────────────────────────────── */}
      {activeSprint && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-x-auto pb-4">
            {COLUMNS.map((col) => {
              const columnTasks = tasks.filter(t => t.status === col.id);
              return (
                <KanbanColumn 
                  key={col.id} 
                  col={col} 
                  tasks={columnTasks} 
                  openTaskDialog={openTaskDialog}
                  openEditDialog={openEditDialog}
                />
              );
            })}
          </div>
        </DndContext>
      )}

      {/* ─── Add Task Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCreateTask}>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title..."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Details..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* ─── Edit Task Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <form onSubmit={handleUpdateTask}>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  placeholder="Task title..."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  value={editTaskDescription}
                  onChange={(e) => setEditTaskDescription(e.target.value)}
                  placeholder="Details..."
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-assignee">Assignee</Label>
                <select
                  id="edit-assignee"
                  value={editTaskAssignee}
                  onChange={(e) => setEditTaskAssignee(e.target.value === "" ? "" : Number(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Unassigned</option>
                  {projectUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter className="flex justify-between items-center sm:justify-between">
              <Button type="button" variant="destructive" onClick={handleDeleteTask}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
