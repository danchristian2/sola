import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../features/auth/auth-context";
import type { Role } from "../types";
import { dashboardPath } from "./dashboardPath";

export function RequireAuth({
  roles,
  children
}: {
  roles?: Role[];
  children: ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={dashboardPath(user.role)} replace />;
  }
  return children;
}
