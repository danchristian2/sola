import { useQuery } from "@tanstack/react-query";
import { SchoolShell } from "./SchoolShell";
import { EmptyState } from "../../components/ui/primitives";
import { DataTable, Td } from "../../components/ui/table";
import { RequestBoard } from "../../components/workflow/Pipeline";
import { getMySchool, listDepartments, listSchoolUsers } from "../../lib/api/schools";
import { listServiceRequests } from "../../lib/api/requests";
import { useAuth } from "../../features/auth/auth-context";

export function SchoolHomePage() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? "";

  const schoolQuery = useQuery({ queryKey: ["school", "me"], queryFn: getMySchool });
  const deptQuery = useQuery({
    queryKey: ["departments", schoolId],
    queryFn: () => listDepartments(schoolId),
    enabled: Boolean(schoolId)
  });
  const usersQuery = useQuery({
    queryKey: ["school-users", schoolId],
    queryFn: () => listSchoolUsers(schoolId),
    enabled: Boolean(schoolId)
  });
  const reqQuery = useQuery({
    queryKey: ["service-requests", "school"],
    queryFn: () => listServiceRequests()
  });

  const school = schoolQuery.data?.school;
  const depts = deptQuery.data?.items ?? [];
  const people = usersQuery.data?.items ?? [];
  const requests = reqQuery.data?.items ?? [];

  if (!school) {
    return (
      <SchoolShell title="School">
        <EmptyState title="No school linked" />
      </SchoolShell>
    );
  }

  return (
    <SchoolShell title={school.name}>
      <RequestBoard
        items={requests}
        href={(id) => `/app/coordinator/requests/${id}`}
        isLoading={reqQuery.isLoading}
      />
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <DataTable headers={["Department"]}>
          {depts.map((dept) => (
            <tr key={dept.id} className="border-b last:border-0">
              <Td>
                <p className="font-medium">{dept.name}</p>
                <p className="text-xs text-muted-foreground">{dept.skills.join(", ") || dept.description}</p>
              </Td>
            </tr>
          ))}
        </DataTable>
        <DataTable headers={["People"]}>
          {people.map((person) => (
            <tr key={person.id} className="border-b last:border-0">
              <Td>
                <span className="font-medium">
                  {person.firstName} {person.lastName}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">{person.role.replaceAll("_", " ")}</span>
              </Td>
            </tr>
          ))}
        </DataTable>
      </div>
    </SchoolShell>
  );
}
