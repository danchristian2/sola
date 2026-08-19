import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolShell } from "./SchoolShell";
import { Button, TextField } from "../../components/ui/primitives";
import { DataTable, Td } from "../../components/ui/table";
import { Dialog } from "../../components/ui/dialog";
import { createDepartment, listDepartments } from "../../lib/api/schools";
import { useAuth } from "../../features/auth/auth-context";
import { ApiRequestError } from "../../lib/api/client";

export function DepartmentsPage() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? "";
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["departments", schoolId],
    queryFn: () => listDepartments(schoolId),
    enabled: Boolean(schoolId)
  });

  const mutation = useMutation({
    mutationFn: (input: { name: string; description?: string; skills?: string[] }) =>
      createDepartment(schoolId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments", schoolId] });
      setError(null);
      setOpen(false);
    },
    onError: (err) => {
      setError(err instanceof ApiRequestError ? err.message : "Unable to create department");
    }
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const skills = String(data.get("skills") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    mutation.mutate({
      name: String(data.get("name")),
      description: String(data.get("description") || "") || undefined,
      skills
    });
    form.reset();
  }

  const items = query.data?.items ?? [];

  return (
    <SchoolShell
      title="Departments"
      action={<Button onClick={() => setOpen(true)}>Add</Button>}
    >
      <DataTable headers={["Department", "Skills"]}>
        {items.map((dept) => (
          <tr key={dept.id} className="border-b last:border-0 hover:bg-accent/60">
            <Td>
              <p className="font-medium">{dept.name}</p>
              {dept.description ? <p className="text-xs text-muted-foreground">{dept.description}</p> : null}
            </Td>
            <Td>
              <div className="flex flex-wrap gap-1.5">
                {dept.skills.length ? (
                  dept.skills.map((skill) => (
                    <span key={skill} className="rounded bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">
                      {skill.replaceAll("_", " ")}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
            </Td>
          </tr>
        ))}
      </DataTable>

      <Dialog open={open} title="Add department" onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <TextField label="Name" name="name" required />
          <TextField label="Description" name="description" />
          <TextField label="Skills (comma separated)" name="skills" />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={mutation.isPending} className="w-full">
            Save
          </Button>
        </form>
      </Dialog>
    </SchoolShell>
  );
}
