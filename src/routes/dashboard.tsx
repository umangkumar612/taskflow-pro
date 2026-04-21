import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListTodo, CheckCircle2, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { tasksApi } from "@/lib/mockApi";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — TaskFlow Pro" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const all = await tasksApi.list({
        userId: user.id,
        role: user.role,
        page: 1,
        pageSize: 9999,
      });
      setStats({
        total: all.total,
        completed: all.items.filter((t) => t.status === "completed").length,
        pending: all.items.filter((t) => t.status !== "completed").length,
      });
    })();
  }, [user]);

  if (!user) return null;

  const cards = [
    { label: "Total Tasks", value: stats.total, icon: ListTodo, tint: "from-violet-500 to-indigo-500" },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      tint: "from-emerald-500 to-teal-500",
    },
    { label: "In Progress", value: stats.pending, icon: Clock, tint: "from-amber-500 to-orange-500" },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-2xl bg-gradient-hero p-8 text-primary-foreground shadow-glow">
          <p className="text-sm uppercase tracking-wide opacity-80">Welcome back</p>
          <h1 className="mt-1 text-3xl md:text-4xl font-bold">{user.name}</h1>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary" className="text-foreground">
              {user.role.toUpperCase()}
            </Badge>
            <span className="text-sm opacity-80">{user.email}</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <Card key={c.label} className="shadow-card transition-all hover:-translate-y-1 hover:shadow-glow">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className="mt-1 text-3xl font-bold">{c.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.tint} text-white shadow-glow`}>
                  <c.icon className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Manage your tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Create, update, search, and complete tasks with full CRUD.
              </p>
              <Button asChild className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                <Link to="/tasks">
                  Open Tasks <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="shadow-card border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Admin Panel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Manage all users and view all tasks across the platform.
                </p>
                <Button asChild variant="outline">
                  <Link to="/admin">
                    Open Admin <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
