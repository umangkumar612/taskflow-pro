import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, LayoutDashboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="bg-gradient-primary bg-clip-text text-transparent">TaskFlow Pro</span>
        </Link>
        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Badge variant={isAdmin ? "default" : "secondary"} className="hidden sm:inline-flex">
                {user?.role}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: "/dashboard" })}
                className="gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  navigate({ to: "/" });
                }}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/login" })}>
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => navigate({ to: "/register" })}
                className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
              >
                Get Started
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
