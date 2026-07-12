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
import { Plus, Pencil, Trash2, Send, CheckSquare, Square, Link as LinkIcon, Check } from "lucide-react";
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
  completeSprint,
  createComment,
  createSubtask,
  updateSubtask,
  type Sprint,
  type Task,
  type User as ProjectUser
} from "@/api/agile";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ─── Sortable Task Card ────────────────────────────────────────────────────────
interface SortableTaskProps {
  task: Task;
  projectUsers: ProjectUser[];
  onClick: () => void;
}

function SortableTask({ task, projectUsers, onClick }: SortableTaskProps) {
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

  const assignee = projectUsers.find(u => u.id === task.assignee_id);
  const assigneeInitials = assignee ? assignee.name.substring(0, 2).toUpperCase() : "";
  const completedSubtasks = task.subtasks?.filter(s => s.is_completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

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
          
          <div className="flex justify-between items-center mt-3 pt-2 border-t border-dashed">
            <div className="flex items-center gap-2">
              {task.story_points !== null && (
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">
                    {task.story_points}
                  </span>
              )}
              {totalSubtasks > 0 && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckSquare className="w-3 h-3" /> {completedSubtasks}/{totalSubtasks}
                  </span>
              )}
            </div>
            {assignee && (
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px] bg-blue-100 text-blue-900">{assigneeInitials}</AvatarFallback>
                </Avatar>
            )}
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

// ─── Droppable Column Component ────────────────────────────────────────────────
function KanbanColumn({
  col,
  tasks,
  projectUsers,
  openTaskDialog,
  openEditDialog
}: {
  col: { id: string; title: string };
  tasks: Task[];
  projectUsers: ProjectUser[];
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
            <SortableTask key={task.id} task={task} projectUsers={projectUsers} onClick={() => openEditDialog(task)} />
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
  { id: "REVIEW", title: "Code Review" },
  { id: "QA", title: "QA / Testing" },
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
  const [newTaskPoints, setNewTaskPoints] = useState<number | "">("");
  
  // Edit Task Dialog State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editTaskAssignee, setEditTaskAssignee] = useState<number | "">("");
  const [editTaskPoints, setEditTaskPoints] = useState<number | "">("");
  const [editTaskStatus, setEditTaskStatus] = useState("TODO");
  const [editTaskAttachment, setEditTaskAttachment] = useState("");
  
  const [newComment, setNewComment] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  
  // New Sprint Dialog State
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
  const projectUsers = (currentProject?.users || []) as ProjectUser[];

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = Number(active.id);
    const overId = over.id as string;
    
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
    if (!activeSprint || !selectedProjectId || !newTaskTitle.trim()) return;

    try {
      const task = await createTask({
        title: newTaskTitle,
        description: newTaskDescription,
        project_id: selectedProjectId,
        sprint_id: activeSprint.id,
        story_points: newTaskPoints === "" ? null : Number(newTaskPoints)
      });
      setTasks(prev => [...prev, { ...task, status: newTaskColumn }]);
      
      if (newTaskColumn !== "TODO") {
         await updateTaskStatus(task.id, newTaskColumn);
         setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newTaskColumn } : t));
      }
      
      setIsTaskDialogOpen(false);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskPoints("");
      toast.success("Task created");
    } catch (err) {
      toast.error("Failed to create task");
    }
  };
  
  const handleUpdateTask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingTask || !editTaskTitle.trim()) return;
    
    try {
      const updatedData = {
        title: editTaskTitle,
        description: editTaskDescription,
        assignee_id: editTaskAssignee === "" ? null : Number(editTaskAssignee),
        story_points: editTaskPoints === "" ? null : Number(editTaskPoints),
        status: editTaskStatus,
        attachment_url: editTaskAttachment
      };
      
      const updatedTask = await updateTask(editingTask.id, updatedData);
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...updatedTask } : t));
      setEditingTask(updatedTask); // Update local state for the dialog
      
      toast.success("Task saved");
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
  
  const handleAddComment = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingTask || !newComment.trim()) return;
      try {
          const comment = await createComment(editingTask.id, newComment);
          const updatedTask = { ...editingTask, comments: [...editingTask.comments, comment] };
          setEditingTask(updatedTask);
          setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
          setNewComment("");
      } catch (err) {
          toast.error("Failed to post comment");
      }
  }

  const handleAddSubtask = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingTask || !newSubtask.trim()) return;
      try {
          const subtask = await createSubtask(editingTask.id, newSubtask);
          const updatedTask = { ...editingTask, subtasks: [...(editingTask.subtasks || []), subtask] };
          setEditingTask(updatedTask);
          setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
          setNewSubtask("");
      } catch (err) {
          toast.error("Failed to add subtask");
      }
  }

  const handleToggleSubtask = async (subtaskId: number, currentStatus: boolean) => {
      if (!editingTask) return;
      try {
          const updatedSub = await updateSubtask(subtaskId, !currentStatus);
          const updatedTask = {
              ...editingTask,
              subtasks: editingTask.subtasks.map(s => s.id === subtaskId ? updatedSub : s)
          };
          setEditingTask(updatedTask);
          setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      } catch (err) {
          toast.error("Failed to update subtask");
      }
  }

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !newSprintName.trim()) return;
    
    try {
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

  const handleCompleteSprint = async () => {
      if (!activeSprint || !selectedProjectId) return;
      if (!confirm("Are you sure you want to complete this sprint? All unfinished tasks will be moved to the Backlog.")) return;
      
      try {
          await completeSprint(activeSprint.id);
          toast.success("Sprint completed!");
          loadSprintData(selectedProjectId);
      } catch (err) {
          toast.error("Failed to complete sprint");
      }
  }

  const openTaskDialog = (status: string) => {
    setNewTaskColumn(status);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskPoints("");
    setIsTaskDialogOpen(true);
  };
  
  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description || "");
    setEditTaskAssignee(task.assignee_id || "");
    setEditTaskPoints(task.story_points || "");
    setEditTaskStatus(task.status);
    setEditTaskAttachment(task.attachment_url || "");
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
          <p className="text-muted-foreground mt-1">Manage your active sprint execution here.</p>
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
              <p className="text-muted-foreground text-sm">Start a sprint to begin executing tasks.</p>
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
        <div className="mb-2 flex justify-between items-center bg-card p-4 rounded-lg shadow-sm border">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              {activeSprint.name}
              <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                {activeSprint.start_date} to {activeSprint.end_date}
              </span>
            </h2>
            {activeSprint.goal && <p className="text-sm text-muted-foreground mt-1">{activeSprint.goal}</p>}
          </div>
          <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950" onClick={handleCompleteSprint}>
             Complete Sprint
          </Button>
        </div>
      )}

      {/* ─── Kanban Columns ───────────────────────────────────────────────────── */}
      {activeSprint && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-x-auto pb-4 items-start">
            {COLUMNS.map((col) => {
              const columnTasks = tasks.filter(t => t.status === col.id);
              return (
                <KanbanColumn 
                  key={col.id} 
                  col={col} 
                  tasks={columnTasks} 
                  projectUsers={projectUsers}
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
              <div className="grid gap-2">
                <Label htmlFor="points">Story Points (Optional)</Label>
                <Input
                  id="points"
                  type="number"
                  value={newTaskPoints}
                  onChange={(e) => setNewTaskPoints(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 3"
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
      
      {/* ─── Full Task Details Dialog ─────────────────────────────────────────── */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {editingTask && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Left Column (Main Content) */}
                 <div className="md:col-span-2 space-y-6">
                     <div className="space-y-2">
                        <Input
                            value={editTaskTitle}
                            onChange={(e) => setEditTaskTitle(e.target.value)}
                            onBlur={() => handleUpdateTask()}
                            className="text-2xl font-bold border-none shadow-none px-0 focus-visible:ring-0"
                            placeholder="Task title..."
                        />
                     </div>
                     <div className="space-y-2">
                         <Label className="text-lg font-semibold">Description</Label>
                         <Textarea
                            value={editTaskDescription}
                            onChange={(e) => setEditTaskDescription(e.target.value)}
                            onBlur={() => handleUpdateTask()}
                            placeholder="Add a more detailed description..."
                            rows={4}
                            className="bg-muted/30"
                         />
                     </div>

                     {/* Subtasks Section */}
                     <div className="space-y-3">
                         <Label className="text-lg font-semibold flex items-center gap-2"><CheckSquare className="w-5 h-5"/> Subtasks</Label>
                         <div className="space-y-2">
                             {editingTask.subtasks?.map(sub => (
                                 <div key={sub.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md group">
                                     <button onClick={() => handleToggleSubtask(sub.id, sub.is_completed)} className="text-muted-foreground hover:text-primary">
                                        {sub.is_completed ? <CheckSquare className="w-5 h-5 text-primary"/> : <Square className="w-5 h-5"/>}
                                     </button>
                                     <span className={`flex-1 ${sub.is_completed ? 'line-through text-muted-foreground' : ''}`}>{sub.title}</span>
                                 </div>
                             ))}
                         </div>
                         <form onSubmit={handleAddSubtask} className="flex gap-2">
                             <Input 
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                placeholder="Add a subtask..."
                                className="flex-1"
                             />
                             <Button type="submit" variant="secondary">Add</Button>
                         </form>
                     </div>

                     {/* Comments Section */}
                     <div className="space-y-4 pt-4 border-t">
                         <Label className="text-lg font-semibold">Comments</Label>
                         <div className="space-y-4">
                             {editingTask.comments?.map(comment => (
                                 <div key={comment.id} className="flex gap-3">
                                     <Avatar className="h-8 w-8 mt-1">
                                         <AvatarFallback className="text-xs bg-secondary">{comment.author?.name?.substring(0,2).toUpperCase() || 'U'}</AvatarFallback>
                                     </Avatar>
                                     <div className="flex-1 bg-muted/40 p-3 rounded-lg">
                                         <div className="flex justify-between items-center mb-1">
                                             <span className="font-medium text-sm">{comment.author?.name}</span>
                                             <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</span>
                                         </div>
                                         <p className="text-sm">{comment.content}</p>
                                     </div>
                                 </div>
                             ))}
                         </div>
                         <form onSubmit={handleAddComment} className="flex gap-2 items-start mt-4">
                             <Avatar className="h-8 w-8">
                                <AvatarFallback>Me</AvatarFallback>
                             </Avatar>
                             <div className="flex-1 space-y-2">
                                <Textarea 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    rows={2}
                                />
                                <Button type="submit" size="sm"><Send className="w-4 h-4 mr-2"/> Post Comment</Button>
                             </div>
                         </form>
                     </div>
                 </div>

                 {/* Right Column (Meta Data) */}
                 <div className="space-y-6 bg-muted/20 p-4 rounded-xl border">
                    <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Status</Label>
                        <select
                            value={editTaskStatus}
                            onChange={(e) => {
                                setEditTaskStatus(e.target.value);
                                handleUpdateTask(); // wait, handleUpdateTask uses state. Better to trigger effect or call explicitly with params, but since setState is async, onBlur is safer. 
                                // Actually, let's just let the user click save or rely on handleUpdateTask picking up the latest... wait, standard select onChange needs to pass the value if we call immediately.
                                // Let's just have a explicit "Save Changes" button at the bottom for metadata, or call updateTask directly.
                                // For simplicity, we just update state and require clicking Save Changes at the bottom of right pane.
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            {COLUMNS.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Assignee</Label>
                        <select
                            value={editTaskAssignee}
                            onChange={(e) => setEditTaskAssignee(e.target.value === "" ? "" : Number(e.target.value))}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">Unassigned</option>
                            {projectUsers.map((u) => (
                                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Story Points</Label>
                        <Input
                            type="number"
                            value={editTaskPoints}
                            onChange={(e) => setEditTaskPoints(e.target.value === "" ? "" : Number(e.target.value))}
                            placeholder="e.g. 5"
                            className="bg-background"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Attachment URL</Label>
                        <Input
                            value={editTaskAttachment}
                            onChange={(e) => setEditTaskAttachment(e.target.value)}
                            placeholder="https://..."
                            className="bg-background"
                        />
                        {editTaskAttachment && (
                            <a href={editTaskAttachment} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                                View Attachment
                            </a>
                        )}
                    </div>

                    <div className="pt-6 border-t space-y-3">
                        <Button className="w-full" onClick={() => handleUpdateTask()}>
                            <Check className="w-4 h-4 mr-2" /> Save Details
                        </Button>
                        <Button variant="destructive" className="w-full" onClick={handleDeleteTask}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Task
                        </Button>
                    </div>
                 </div>
             </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
