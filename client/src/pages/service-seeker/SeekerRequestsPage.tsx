import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SeekerShell } from "./SeekerShell";
import { RequestBoard } from "../../components/workflow/Pipeline";
import { listServiceRequests } from "../../lib/api/requests";

export function SeekerRequestsPage() {
  const query = useQuery({
    queryKey: ["service-requests"],
    queryFn: () => listServiceRequests()
  });

  return (
    <SeekerShell
      title="Problems"
      action={
        <Link to="/app/seeker/new" className="btn-primary">
          Post
        </Link>
      }
    >
      <RequestBoard items={query.data?.items ?? []} href={(id) => `/app/seeker/requests/${id}`} isLoading={query.isLoading} />
    </SeekerShell>
  );
}
