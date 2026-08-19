import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AppLayout } from "../../layouts/layouts";
import { Button } from "../../components/ui/primitives";
import { DataTable, SectionHead, Td } from "../../components/ui/table";
import { PipelineStrip } from "../../components/workflow/Pipeline";
import { approvePartnership, listPartnerships, listSchools } from "../../lib/api/schools";
import { listServiceRequests } from "../../lib/api/requests";
import { createProject, listProjects, listPortfolio } from "../../lib/api/projects";
import { useState } from "react";
import { statusClass } from "../../ui/theme";

export function TeacherDashboardPage() {
  const queryClient = useQueryClient();
  const requests = useQuery({
    queryKey: ["service-requests", "teacher"],
    queryFn: () => listServiceRequests()
  });
  const projects = useQuery({ queryKey: ["projects"], queryFn: listProjects });
  const assigned = (requests.data?.items ?? []).filter((item) =>
    ["ASSIGNED", "IN_PROGRESS", "TESTING", "REVISION_REQUIRED", "AWAITING_CLIENT_FEEDBACK"].includes(item.status)
  );
  const projectItems = projects.data?.items ?? [];

  const start = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
    }
  });

  return (
    <AppLayout title="Projects">
      <div className="mb-5">
        <PipelineStrip items={requests.data?.items ?? []} />
      </div>
      <SectionHead title="Assigned" />
      <DataTable headers={["Client", "Problem", ""]}>
        {assigned.map((item) => {
          const project = projectItems.find((row) => row.requestId === item.id);
          return (
            <tr key={item.id} className="border-b last:border-0 hover:bg-accent/60">
              <Td className="whitespace-nowrap font-medium">{item.organization ?? "Client"}</Td>
              <Td>{item.problem}</Td>
              <Td className="text-right">
                {project ? (
                  <Link className="text-sm font-medium text-primary" to={`/app/projects/${project.id}`}>
                    Open
                  </Link>
                ) : (
                  <Button onClick={() => start.mutate(item.id)}>Start</Button>
                )}
              </Td>
            </tr>
          );
        })}
      </DataTable>
      <div className="mt-6">
        <SectionHead title="Projects" />
        <DataTable headers={["Project", "Stage", ""]}>
          {projectItems.map((item) => (
            <tr key={item.id} className="border-b last:border-0 hover:bg-accent/60">
              <Td className="font-medium">{item.title}</Td>
              <Td>
                <span className={statusClass(item.stage === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS")}>
                  {item.stage.replaceAll("_", " ")}
                </span>
              </Td>
              <Td className="text-right">
                <Link className="text-sm font-medium text-primary" to={`/app/projects/${item.id}`}>
                  Open
                </Link>
              </Td>
            </tr>
          ))}
        </DataTable>
      </div>
    </AppLayout>
  );
}

export function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const schoolsQuery = useQuery({ queryKey: ["schools"], queryFn: listSchools });
  const appsQuery = useQuery({ queryKey: ["partnerships"], queryFn: listPartnerships });
  const reqQuery = useQuery({ queryKey: ["service-requests"], queryFn: () => listServiceRequests() });

  const approve = useMutation({
    mutationFn: approvePartnership,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["partnerships"] });
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      setInviteLink(data.token ? `/invite?token=${data.token}` : null);
    }
  });

  const schools = schoolsQuery.data?.items ?? [];
  const pending = (appsQuery.data?.items ?? []).filter((item) => item.status === "SUBMITTED");
  const requests = reqQuery.data?.items ?? [];

  return (
    <AppLayout title="Platform">
      <div className="mb-5">
        <PipelineStrip items={requests} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <SectionHead title="Partnerships" />
          <DataTable headers={["School", ""]}>
            {pending.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <Td>
                  <p className="font-medium">{item.schoolName}</p>
                  <p className="text-xs text-muted-foreground">{item.location}</p>
                </Td>
                <Td className="text-right">
                  <Button onClick={() => approve.mutate(item.id)}>Approve</Button>
                </Td>
              </tr>
            ))}
          </DataTable>
        </div>
        <div>
          <SectionHead title="Schools" />
          <DataTable headers={["School", "Status"]}>
            {schools.map((school) => (
              <tr key={school.id} className="border-b last:border-0">
                <Td>
                  <p className="font-medium">{school.name}</p>
                  <p className="text-xs text-muted-foreground">{school.location}</p>
                </Td>
                <Td>
                  <span className="badge-done">{school.status}</span>
                </Td>
              </tr>
            ))}
          </DataTable>
        </div>
      </div>
      {inviteLink ? <p className="mt-3 break-all text-xs text-muted-foreground">{inviteLink}</p> : null}
    </AppLayout>
  );
}

export function PortfolioPage() {
  const query = useQuery({ queryKey: ["portfolio"], queryFn: listPortfolio });
  const items = query.data?.items ?? [];

  return (
    <AppLayout title="Portfolio">
      <DataTable headers={["Project", "Team", ""]}>
        {items.map((item) => (
          <tr key={item.id} className="border-b last:border-0 hover:bg-accent/60">
            <Td className="font-medium">{item.title}</Td>
            <Td className="text-muted-foreground">{item.team.map((member) => member.name).join(", ") || "—"}</Td>
            <Td className="text-right">
              <Link className="text-sm font-medium text-primary" to={`/app/projects/${item.id}`}>
                Open
              </Link>
            </Td>
          </tr>
        ))}
      </DataTable>
    </AppLayout>
  );
}
