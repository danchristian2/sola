import { FormEvent, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "../../layouts/layouts";
import { Button, EmptyState } from "../../components/ui/primitives";
import { RequestBoard } from "../../components/workflow/Pipeline";
import { statusClass, statusLabel } from "../../ui/theme";
import { listDepartments, listSchoolUsers } from "../../lib/api/schools";
import {
  acceptServiceRequest,
  assignServiceRequest,
  assignTeacher,
  getServiceRequest,
  listServiceRequests,
  rejectServiceRequest,
  requestMoreInfo,
  reviewServiceRequest
} from "../../lib/api/requests";
import { useAuth } from "../../features/auth/auth-context";

export function CoordinatorInboxPage() {
  const query = useQuery({
    queryKey: ["service-requests", "inbox"],
    queryFn: () => listServiceRequests()
  });

  return (
    <AppLayout title="Inbox">
      <RequestBoard
        items={query.data?.items ?? []}
        href={(id) => `/app/coordinator/requests/${id}`}
        isLoading={query.isLoading}
      />
    </AppLayout>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 border-b py-3 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

export function CoordinatorReviewPage() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [infoNote, setInfoNote] = useState("");
  const requestQuery = useQuery({
    queryKey: ["service-request", id],
    queryFn: () => getServiceRequest(id),
    enabled: Boolean(id)
  });
  const depts = useQuery({
    queryKey: ["departments", user?.schoolId],
    queryFn: () => listDepartments(user!.schoolId!),
    enabled: Boolean(user?.schoolId)
  });
  const teachers = useQuery({
    queryKey: ["teachers", user?.schoolId],
    queryFn: () => listSchoolUsers(user!.schoolId!, "TEACHER"),
    enabled: Boolean(user?.schoolId)
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["service-request", id] });
    queryClient.invalidateQueries({ queryKey: ["service-requests"] });
  }

  const item = requestQuery.data?.request;

  if (!item) {
    return (
      <AppLayout title="Review">
        <EmptyState title="Not found" />
      </AppLayout>
    );
  }

  const headerAction =
    item.status === "SUBMITTED" ? (
      <Button onClick={() => reviewServiceRequest(id).then(refresh)}>Start review</Button>
    ) : item.status === "UNDER_REVIEW" ? (
      <Button onClick={() => acceptServiceRequest(id).then(refresh)}>Accept</Button>
    ) : undefined;

  const showAside =
    item.status === "UNDER_REVIEW" ||
    item.status === "MATCHING" ||
    (item.status === "ASSIGNED" && !item.teacherName);

  return (
    <AppLayout title={item.organization ?? "Review"} action={headerAction}>
      <div className={`grid gap-5 ${showAside ? "lg:grid-cols-[1fr_280px]" : ""}`}>
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-2">
            <span className={statusClass(item.status)}>{statusLabel(item.status)}</span>
          </div>
          <dl>
            <Row label="Client" value={item.organization ?? item.posterType.replaceAll("_", " ")} />
            <Row label="Problem" value={item.problem} />
            <Row label="Result" value={item.outcome} />
            <Row label="Affected" value={item.whoIsAffected} />
            <Row label="Notes" value={item.extraInfo} />
            <Row label="Match" value={item.matchReason} />
            <Row label="Department" value={item.departmentName} />
            <Row label="Teacher" value={item.teacherName} />
          </dl>
        </section>

        {showAside ? (
          <aside className="h-fit space-y-3 rounded-xl border bg-card p-5 shadow-sm">
          {item.status === "UNDER_REVIEW" ? (
            <>
              <Button
                variant="secondary"
                onClick={() => rejectServiceRequest(id).then(refresh)}
                className="w-full"
              >
                Reject
              </Button>
              <form
                className="space-y-2"
                onSubmit={(event: FormEvent) => {
                  event.preventDefault();
                  requestMoreInfo(id, infoNote).then(refresh);
                }}
              >
                <textarea
                  className="input"
                  placeholder="Need more info"
                  value={infoNote}
                  onChange={(event) => setInfoNote(event.target.value)}
                />
                <Button type="submit" variant="secondary" className="w-full">
                  Ask
                </Button>
              </form>
            </>
          ) : null}

          {item.status === "MATCHING" ? (
            <form
              className="space-y-2"
              onSubmit={(event: FormEvent) => {
                event.preventDefault();
                const departmentId = String(new FormData(event.currentTarget).get("departmentId"));
                assignServiceRequest(id, departmentId).then(refresh);
              }}
            >
              <select className="input" name="departmentId" required defaultValue={item.departmentId ?? ""}>
                <option value="" disabled>
                  Department
                </option>
                {(depts.data?.items ?? []).map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <Button type="submit" className="w-full">
                Assign
              </Button>
            </form>
          ) : null}

          {item.status === "ASSIGNED" && !item.teacherName ? (
            <form
              className="space-y-2"
              onSubmit={(event: FormEvent) => {
                event.preventDefault();
                const teacherId = String(new FormData(event.currentTarget).get("teacherId"));
                assignTeacher(id, teacherId).then(refresh);
              }}
            >
              <select className="input" name="teacherId" required defaultValue="">
                <option value="" disabled>
                  Teacher
                </option>
                {(teachers.data?.items ?? []).map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.firstName} {person.lastName}
                  </option>
                ))}
              </select>
              <Button type="submit" className="w-full">
                Assign
              </Button>
            </form>
          ) : null}
          </aside>
        ) : null}
      </div>
    </AppLayout>
  );
}
