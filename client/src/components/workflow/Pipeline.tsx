import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ServiceRequest } from "../../lib/api/requests";
import { statusClass, statusLabel, urgencyClass } from "../../ui/theme";
import { DataTable, LoadingRows, Td } from "../ui/table";

export const PIPELINE = [
  { id: "intake", label: "New", statuses: ["SUBMITTED", "UNDER_REVIEW", "NEEDS_INFORMATION"] },
  { id: "match", label: "Match", statuses: ["ACCEPTED", "MATCHING"] },
  { id: "delivery", label: "Build", statuses: ["ASSIGNED", "IN_PROGRESS", "TESTING", "REVISION_REQUIRED"] },
  { id: "client", label: "Test", statuses: ["AWAITING_CLIENT_FEEDBACK", "READY_FOR_DELIVERY"] },
  { id: "done", label: "Done", statuses: ["DELIVERED", "COMPLETED"] }
] as const;

function matchesQuery(item: ServiceRequest, query: string) {
  if (!query) return true;
  const haystack = [item.organization, item.problem, item.category, item.status, item.location]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function RequestTable({
  items,
  href
}: {
  items: ServiceRequest[];
  href: (id: string) => string;
}) {
  const navigate = useNavigate();

  return (
    <DataTable headers={["Client", "Problem", "Skill", "Urgency", "Status"]}>
      {items.map((item) => (
        <tr
          key={item.id}
          className="cursor-pointer border-b last:border-0 hover:bg-accent/60"
          onClick={() => navigate(href(item.id))}
        >
          <Td className="whitespace-nowrap font-medium">{item.organization ?? "Client"}</Td>
          <Td className="max-w-md">
            <span className="line-clamp-2">{item.problem}</span>
          </Td>
          <Td className="whitespace-nowrap text-muted-foreground">{item.category.replaceAll("_", " ")}</Td>
          <Td>
            <span className={urgencyClass(item.urgency)}>{item.urgency}</span>
          </Td>
          <Td>
            <span className={statusClass(item.status)}>{statusLabel(item.status)}</span>
          </Td>
        </tr>
      ))}
    </DataTable>
  );
}

export function PipelineStrip({
  items,
  active = null,
  onSelect
}: {
  items: ServiceRequest[];
  active?: string | null;
  onSelect?: (id: string | null) => void;
}) {
  const tabs = [
    { id: null as string | null, label: "All", count: items.length },
    ...PIPELINE.map((stage) => ({
      id: stage.id as string | null,
      label: stage.label,
      count: items.filter((item) => (stage.statuses as readonly string[]).includes(item.status)).length
    }))
  ];

  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-muted p-1">
      {tabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <button
            key={tab.label}
            type="button"
            onClick={() => onSelect?.(tab.id)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              selected ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 tabular-nums ${selected ? "text-primary-foreground/80" : ""}`}>{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}

export function RequestBoard({
  items,
  href,
  isLoading
}: {
  items: ServiceRequest[];
  href: (id: string) => string;
  isLoading?: boolean;
}) {
  const [stage, setStage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    const bucket = PIPELINE.find((item) => item.id === stage);
    return items.filter((item) => {
      if (bucket && !(bucket.statuses as readonly string[]).includes(item.status)) return false;
      return matchesQuery(item, q);
    });
  }, [items, stage, q]);

  if (isLoading) return <LoadingRows />;

  return (
    <>
      <div className="mb-5">
        <PipelineStrip items={items} active={stage} onSelect={setStage} />
      </div>
      <div className="mb-4">
        <input
          className="input max-w-sm"
          placeholder="Search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <RequestTable items={filtered} href={href} />
    </>
  );
}
