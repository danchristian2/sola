import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolShell } from "./SchoolShell";
import { Button, TextField } from "../../components/ui/primitives";
import { DataTable, Td } from "../../components/ui/table";
import { Dialog } from "../../components/ui/dialog";
import { createInvitation, listDepartments, listSchoolUsers } from "../../lib/api/schools";
import { useAuth } from "../../features/auth/auth-context";
import { ApiRequestError } from "../../lib/api/client";

export function PeoplePage() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? "";
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: ["school-users", schoolId],
    queryFn: () => listSchoolUsers(schoolId),
    enabled: Boolean(schoolId)
  });
  const deptQuery = useQuery({
    queryKey: ["departments", schoolId],
    queryFn: () => listDepartments(schoolId),
    enabled: Boolean(schoolId)
  });

  const mutation = useMutation({
    mutationFn: (input: {
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      departmentId?: string;
    }) => createInvitation(schoolId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["school-users", schoolId] });
      setError(null);
      setInviteLink(data.token ? `/invite?token=${data.token}` : null);
      setOpen(false);
    },
    onError: (err) => {
      setError(err instanceof ApiRequestError ? err.message : "Unable to send invitation");
    }
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const departmentId = String(data.get("departmentId") || "");
    mutation.mutate({
      email: String(data.get("email")),
      firstName: String(data.get("firstName")),
      lastName: String(data.get("lastName")),
      role: String(data.get("role")),
      departmentId: departmentId || undefined
    });
    form.reset();
  }

  const people = usersQuery.data?.items ?? [];

  return (
    <SchoolShell
      title="People"
      action={<Button onClick={() => setOpen(true)}>Invite</Button>}
    >
      <DataTable headers={["Name", "Role", "Status"]}>
        {people.map((person) => (
          <tr key={person.id} className="border-b last:border-0 hover:bg-accent/60">
            <Td>
              <p className="font-medium">
                {person.firstName} {person.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{person.email}</p>
            </Td>
            <Td className="text-muted-foreground">{person.role.replaceAll("_", " ")}</Td>
            <Td>
              <span className="badge-done">{person.status}</span>
            </Td>
          </tr>
        ))}
      </DataTable>

      <Dialog open={open} title="Invite" onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="First name" name="firstName" required />
            <TextField label="Last name" name="lastName" required />
          </div>
          <TextField label="Email" name="email" type="email" required />
          <label className="block space-y-1">
            <span className="text-sm font-medium">Role</span>
            <select className="input" name="role" defaultValue="TEACHER">
              {user?.role === "SCHOOL_ADMIN" ? <option value="SCHOOL_COORDINATOR">Coordinator</option> : null}
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
              {user?.role === "SCHOOL_ADMIN" ? <option value="SCHOOL_ADMIN">School admin</option> : null}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Department</span>
            <select className="input" name="departmentId" defaultValue="">
              <option value="">None</option>
              {(deptQuery.data?.items ?? []).map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={mutation.isPending} className="w-full">
            Send invitation
          </Button>
        </form>
      </Dialog>
      {inviteLink ? <p className="mt-3 break-all text-xs text-muted-foreground">{inviteLink}</p> : null}
    </SchoolShell>
  );
}
