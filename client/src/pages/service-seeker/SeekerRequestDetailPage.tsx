import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { SeekerShell } from "./SeekerShell";
import { Button, EmptyState } from "../../components/ui/primitives";
import { getServiceRequest, submitServiceRequest } from "../../lib/api/requests";
import { getProjectByRequest } from "../../lib/api/projects";
import { statusClass, statusLabel } from "../../ui/theme";

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 border-b py-3 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

export function SeekerRequestDetailPage() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["service-request", id],
    queryFn: () => getServiceRequest(id),
    enabled: Boolean(id)
  });
  const projectQuery = useQuery({
    queryKey: ["project-by-request", id],
    queryFn: () => getProjectByRequest(id),
    enabled: Boolean(id)
  });
  const submit = useMutation({
    mutationFn: () => submitServiceRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["service-request", id] })
  });

  const item = query.data?.request;
  const project = projectQuery.data?.project;
  if (!item) {
    return (
      <SeekerShell title="Problem">
        <EmptyState title="Not found" />
      </SeekerShell>
    );
  }

  const action =
    item.status === "DRAFT" || item.status === "NEEDS_INFORMATION" ? (
      <Button type="button" disabled={submit.isPending} onClick={() => submit.mutate()}>
        Submit
      </Button>
    ) : project ? (
      <Link className="btn-primary" to={`/app/projects/${project.id}`}>
        Open project
      </Link>
    ) : undefined;

  return (
    <SeekerShell title={item.organization ?? "Problem"} action={action}>
      <section className="max-w-3xl rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-2">
          <span className={statusClass(item.status)}>{statusLabel(item.status)}</span>
        </div>
        <dl>
          <Row label="Problem" value={item.problem} />
          <Row label="Result" value={item.outcome} />
          <Row label="School" value={item.schoolName} />
          <Row label="Department" value={item.departmentName} />
          <Row label="Teacher" value={item.teacherName} />
          <Row label="Match" value={item.matchReason} />
          <Row label="Note" value={item.reviewNote} />
        </dl>
      </section>
    </SeekerShell>
  );
}
