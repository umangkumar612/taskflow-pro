import { useEffect, useState, useCallback } from "react";
import { auth } from "@/lib/mockApi";
import type { User } from "@/lib/mockApi";

type SafeUser = Omit<User, "password">;

const EVENT = "tf_auth_changed";

export function useAuth() {
  const [user, setUser] = useState<SafeUser | null>(() => auth.current());

  useEffect(() => {
    const sync = () => setUser(auth.current());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const refresh = useCallback(() => {
    setUser(auth.current());
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const logout = useCallback(() => {
    auth.logout();
    refresh();
  }, [refresh]);

  return { user, refresh, logout, isAuthenticated: !!user, isAdmin: user?.role === "admin" };
}

export function notifyAuthChange() {
  window.dispatchEvent(new Event(EVENT));
}
