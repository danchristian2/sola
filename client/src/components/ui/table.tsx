import type { ReactNode } from "react";

function isEmptyChildren(children?: ReactNode) {
  if (children == null || children === false) return true;
  if (Array.isArray(children) && children.length === 0) return true;
  return false;
}

export function DataTable({
  headers,
  children,
  empty = "None"
}: {
  headers: string[];
  children?: ReactNode;
  empty?: string;
}) {
  const emptyRows = isEmptyChildren(children);

  return (
    <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            {headers.map((header, index) => (
              <th
                key={`${header}-${index}`}
                className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {emptyRows ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-10 text-center text-muted-foreground">
                {empty}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

export function LoadingRows({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2 rounded-xl border bg-card p-4 shadow-sm">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton h-11 rounded-lg" />
      ))}
    </div>
  );
}

export function SectionHead({
  title,
  children
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </div>
  );
}
