import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolShell } from "./SchoolShell";
import { Button, EmptyState, TextField } from "../../components/ui/primitives";
import { getMySchool, updateSchool } from "../../lib/api/schools";
import { ApiRequestError } from "../../lib/api/client";

export function SchoolSettingsPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const query = useQuery({
    queryKey: ["school", "me"],
    queryFn: getMySchool
  });

  const school = query.data?.school;

  const mutation = useMutation({
    mutationFn: (input: {
      name: string;
      location: string;
      contactEmail: string;
      contactPhone?: string;
    }) => updateSchool(school!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", "me"] });
      setError(null);
      setSaved(true);
    },
    onError: (err) => {
      setError(err instanceof ApiRequestError ? err.message : "Unable to update school");
    }
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    mutation.mutate({
      name: String(data.get("name")),
      location: String(data.get("location")),
      contactEmail: String(data.get("contactEmail")),
      contactPhone: String(data.get("contactPhone") || "") || undefined
    });
  }

  if (!school) {
    return (
      <SchoolShell title="School profile">
        <EmptyState title="Not found" />
      </SchoolShell>
    );
  }

  return (
    <SchoolShell title="School profile">
      <form className="card max-w-lg space-y-4" onSubmit={onSubmit}>
        <TextField label="School name" name="name" required defaultValue={school.name} />
        <TextField label="Location" name="location" required defaultValue={school.location ?? ""} />
        <TextField
          label="Contact email"
          name="contactEmail"
          type="email"
          required
          defaultValue={school.contactEmail ?? ""}
        />
        <TextField label="Phone" name="contactPhone" defaultValue={school.contactPhone ?? ""} />
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {saved ? <p className="text-sm text-primary">Saved.</p> : null}
        <Button type="submit" disabled={mutation.isPending}>
          Save
        </Button>
      </form>
    </SchoolShell>
  );
}
