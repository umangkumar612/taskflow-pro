import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { tasksApi } from "@/lib/mockApi";
import type { Task, TaskStatus } from "@/lib/mockApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Tasks — TaskFlow Pro" }] }),
  component: TasksPage,
});

const statusColors: Record<TaskStatus, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  "in-progress": "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
};

function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending" as TaskStatus,
  });

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const res = await tasksApi.list({
      userId: user.id,
      role: user.role,
      search,
      status,
      page,
      pageSize,
    });
    setTasks(res.items);
    setTotal(res.total);
    setLoading(false);
  }, [user, search, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", status: "pending" });
    setOpen(true);
  };
  const openEdit = (t: Task) => {
    setEditing(t);
    setForm({ title: t.title, description: t.description, status: t.status });
    setOpen(true);
  };

  const submit = async () => {
    if (!user) return;
    if (!form.title.trim()) return toast.error("Title is required");
    try {
      if (editing) {
        await tasksApi.update(editing.id, form);
        toast.success("Task updated");
      } else {
        await tasksApi.create({ ...form, userId: user.id });
        toast.success("Task created");
      }
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const remove = async (id: string) => {
    await tasksApi.remove(id);
    toast.success("Task deleted");
    load();
  };
  const complete = async (t: Task) => {
    await tasksApi.update(t.id, { status: "completed" });
    toast.success("Marked complete");
    load();
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">My Tasks</h1>
            <p className="text-sm text-muted-foreground">
              Create, search, filter, and manage your tasks.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openCreate}
                className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
              >
                <Plus className="mr-1 h-4 w-4" /> New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Task" : "New Task"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    maxLength={120}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    maxLength={500}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v as TaskStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={submit}
                  className="bg-gradient-primary text-primary-foreground"
                >
                  {editing ? "Save changes" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="shadow-card">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tasks.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-16 text-center text-muted-foreground">
              No tasks yet. Click <span className="font-medium text-foreground">New Task</span> to
              create one.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((t) => (
              <Card
                key={t.id}
                className="shadow-card transition-all hover:-translate-y-1 hover:shadow-glow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">{t.title}</CardTitle>
                    <Badge variant="outline" className={statusColors[t.status]}>
                      {t.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3rem]">
                    {t.description || "No description"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {t.status !== "completed" && (
                      <Button size="sm" variant="outline" onClick={() => complete(t)}>
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Complete
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => openEdit(t)}>
                      <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => remove(t.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > pageSize && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
