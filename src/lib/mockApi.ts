// Mock API simulating the Express/MongoDB backend.
// Persists to localStorage. Replace with Axios calls to your real backend later.

export type Role = "user" | "admin";
export type TaskStatus = "pending" | "in-progress" | "completed";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // mock only — real backend uses bcrypt
  role: Role;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdBy: string; // user id
  createdAt: string;
  updatedAt: string;
}

const USERS_KEY = "tf_users";
const TASKS_KEY = "tf_tasks";
const TOKEN_KEY = "tf_token";
const CURRENT_USER_KEY = "tf_current_user";

const isBrowser = typeof window !== "undefined" && typeof localStorage !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, val: T) {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(val));
}
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
function delay<T>(val: T, ms = 350): Promise<T> {
  return new Promise((r) => setTimeout(() => r(val), ms));
}

// Seed an admin user on first load (browser only)
function seed() {
  if (!isBrowser) return;
  const users = read<User[]>(USERS_KEY, []);
  if (users.length === 0) {
    const admin: User = {
      id: uid(),
      name: "Admin",
      email: "admin@taskflow.dev",
      password: "admin123",
      role: "admin",
      createdAt: new Date().toISOString(),
    };
    write(USERS_KEY, [admin]);
  }
}
seed();

function makeToken(user: User) {
  // Mock JWT: base64(header).base64(payload).sig
  const payload = btoa(JSON.stringify({ sub: user.id, role: user.role, email: user.email }));
  return `mock.${payload}.sig`;
}

export const auth = {
  async register(input: { name: string; email: string; password: string; role: Role }) {
    const users = read<User[]>(USERS_KEY, []);
    if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error("Email already registered");
    }
    const user: User = {
      id: uid(),
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    write(USERS_KEY, users);
    return delay({ user: stripPwd(user) });
  },
  async login(email: string, password: string) {
    const users = read<User[]>(USERS_KEY, []);
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!user) throw new Error("Invalid credentials");
    const token = makeToken(user);
    if (isBrowser) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(stripPwd(user)));
    }
    return delay({ token, user: stripPwd(user) });
  },
  logout() {
    if (!isBrowser) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  },
  current(): Omit<User, "password"> | null {
    return read<Omit<User, "password"> | null>(CURRENT_USER_KEY, null);
  },
  token(): string | null {
    return isBrowser ? localStorage.getItem(TOKEN_KEY) : null;
  },
};

function stripPwd(u: User): Omit<User, "password"> {
  const { password: _p, ...rest } = u;
  return rest;
}

export const tasksApi = {
  async list(opts: {
    userId: string;
    role: Role;
    search?: string;
    status?: TaskStatus | "all";
    page?: number;
    pageSize?: number;
  }) {
    const all = read<Task[]>(TASKS_KEY, []);
    const scoped = opts.role === "admin" ? all : all.filter((t) => t.createdBy === opts.userId);
    const filtered = scoped.filter((t) => {
      const matchesSearch = opts.search
        ? (t.title + " " + t.description).toLowerCase().includes(opts.search.toLowerCase())
        : true;
      const matchesStatus = opts.status && opts.status !== "all" ? t.status === opts.status : true;
      return matchesSearch && matchesStatus;
    });
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 6;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return delay({ items, total: filtered.length, page, pageSize });
  },
  async create(input: { title: string; description: string; status: TaskStatus; userId: string }) {
    const all = read<Task[]>(TASKS_KEY, []);
    const t: Task = {
      id: uid(),
      title: input.title,
      description: input.description,
      status: input.status,
      createdBy: input.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.unshift(t);
    write(TASKS_KEY, all);
    return delay(t);
  },
  async update(id: string, patch: Partial<Pick<Task, "title" | "description" | "status">>) {
    const all = read<Task[]>(TASKS_KEY, []);
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Task not found");
    all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
    write(TASKS_KEY, all);
    return delay(all[idx]);
  },
  async remove(id: string) {
    const all = read<Task[]>(TASKS_KEY, []);
    write(
      TASKS_KEY,
      all.filter((t) => t.id !== id),
    );
    return delay({ ok: true });
  },
};

export const adminApi = {
  async listUsers() {
    const users = read<User[]>(USERS_KEY, []);
    return delay(users.map(stripPwd));
  },
  async deleteUser(id: string) {
    const users = read<User[]>(USERS_KEY, []);
    write(
      USERS_KEY,
      users.filter((u) => u.id !== id),
    );
    // also remove their tasks
    const tasks = read<Task[]>(TASKS_KEY, []);
    write(
      TASKS_KEY,
      tasks.filter((t) => t.createdBy !== id),
    );
    return delay({ ok: true });
  },
  async listAllTasks() {
    return delay(read<Task[]>(TASKS_KEY, []));
  },
};
