import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Navbar } from "./Navbar";
import { DashboardSidebar } from "./DashboardSidebar";
import { useAuth } from "@/hooks/useAuth";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate({ to: "/login" });
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-4 md:p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
