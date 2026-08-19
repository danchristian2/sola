import type { ReactNode } from "react";
import { AppLayout } from "../../layouts/layouts";

export function SchoolShell({
  title,
  action,
  children
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <AppLayout title={title} action={action}>
      {children}
    </AppLayout>
  );
}
