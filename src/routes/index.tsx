import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck,
  KeyRound,
  Database,
  FileCode2,
  Lock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TaskFlow Pro — Scalable REST API with Auth & RBAC" },
      {
        name: "description",
        content:
          "Production-ready full-stack project: JWT auth, role-based access, task CRUD, Swagger docs.",
      },
      { property: "og:title", content: "TaskFlow Pro" },
      {
        property: "og:description",
        content: "Scalable REST API with Authentication & Role-Based Access.",
      },
    ],
  }),
  component: Home,
});

const features = [
  {
    icon: KeyRound,
    title: "JWT Authentication",
    desc: "Stateless tokens with secure bcrypt-hashed passwords and refresh-ready flow.",
  },
  {
    icon: ShieldCheck,
    title: "Role Based Access",
    desc: "Fine-grained user & admin permissions enforced at the middleware layer.",
  },
  {
    icon: Database,
    title: "CRUD APIs",
    desc: "RESTful task endpoints with search, status filters, and pagination.",
  },
  {
    icon: FileCode2,
    title: "Swagger Docs",
    desc: "Interactive API explorer at /api-docs for every endpoint and schema.",
  },
  {
    icon: Lock,
    title: "Secure Backend",
    desc: "Helmet, CORS, rate limiting, mongo-sanitize, and express-validator built in.",
  },
  {
    icon: Sparkles,
    title: "Scalable Design",
    desc: "Modular folder structure with controllers, routes, middleware & utils.",
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--primary-glow),_transparent_50%)] opacity-30" />
        <div className="relative container mx-auto px-4 py-24 md:py-36 text-center text-primary-foreground animate-slide-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Backend Internship Showcase
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight">
            TaskFlow Pro
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg md:text-xl text-white/90">
            Scalable REST API with Authentication & Role-Based Access. Built with Node.js,
            Express, MongoDB, and React.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="shadow-card">
              <Link to="/register">
                Get Started <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
            >
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Production-grade features</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Everything an internship reviewer expects — and more.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card
              key={f.title}
              className="group border-border/60 shadow-card transition-all hover:-translate-y-1 hover:shadow-glow"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow transition-transform group-hover:scale-110">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-24">
        <div className="rounded-3xl bg-gradient-primary p-10 md:p-16 text-center text-primary-foreground shadow-glow">
          <h3 className="text-2xl md:text-3xl font-bold">Ready to manage tasks securely?</h3>
          <p className="mt-3 text-white/90">
            Spin up an account and explore the full RBAC workflow.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link to="/register">
              Create your account <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Built with React, TypeScript & Tailwind. Backend: Node.js + Express + MongoDB.
      </footer>
    </div>
  );
}
