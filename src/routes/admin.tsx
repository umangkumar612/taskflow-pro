import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { adminApi } from "@/lib/mockApi";
import type { Task, User } from "@/lib/mockApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — TaskFlow Pro" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Omit<User, "password">[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [u, t] = await Promise.all([adminApi.listUsers(), adminApi.listAllTasks()]);
    setUsers(u);
    setTasks(t);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user && !isAdmin) {
      toast.error("Unauthorized — admin access only");
      navigate({ to: "/dashboard" });
      return;
    }
    if (isAdmin) load();
  }, [user, isAdmin, navigate, load]);

  const removeUser = async (id: string) => {
    if (id === user?.id) return toast.error("You cannot delete yourself");
    await adminApi.deleteUser(id);
    toast.success("User deleted");
    load();
  };

  if (!isAdmin) return null;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Manage users and view all tasks.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>All Users ({users.length})</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeUser(u.id)}
                            className="text-destructive hover:text-destructive"
                            disabled={u.id === user?.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>All Tasks ({tasks.length})</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No tasks in the system yet.
                        </TableCell>
                      </TableRow>
                    )}
                    {tasks.map((t) => {
                      const owner = users.find((u) => u.id === t.createdBy);
                      return (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{t.status}</Badge>
                          </TableCell>
                          <TableCell>{owner?.name ?? "Deleted user"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
