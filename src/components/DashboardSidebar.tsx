import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, ListTodo, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const items = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/tasks", label: "My Tasks", icon: ListTodo },
    ...(isAdmin ? [{ to: "/admin", label: "Admin Panel", icon: ShieldCheck }] : []),
  ] as const;

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-gradient-soft md:block">
      <nav className="sticky top-16 flex flex-col gap-1 p-4">
        {items.map((it) => {
          const active = location.pathname === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "text-foreground hover:bg-accent",
              )}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
