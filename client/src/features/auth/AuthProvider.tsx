import { useEffect, useState, type ReactNode } from "react";
import { getMe } from "../../lib/api/auth";
import { ApiRequestError } from "../../lib/api/client";
import type { AuthUser } from "../../types";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((data) => setUser(data.user))
      .catch((err) => {
        if (
          !(
            err instanceof ApiRequestError &&
            (err.status === 401 || err.status === 0 || err.code === "NETWORK_ERROR")
          )
        ) {
          console.error(err);
        }
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
