import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SeekerShell } from "./SeekerShell";
import { Button, TextField } from "../../components/ui/primitives";
import { createServiceRequest } from "../../lib/api/requests";
import { ApiRequestError } from "../../lib/api/client";

export function NewRequestPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const data = await createServiceRequest({
        posterType: String(form.get("posterType")),
        organization: String(form.get("organization") || "") || undefined,
        location: String(form.get("location") || "") || undefined,
        problem: String(form.get("problem")),
        outcome: String(form.get("outcome")),
        whoIsAffected: String(form.get("whoIsAffected") || "") || undefined,
        extraInfo: String(form.get("extraInfo") || "") || undefined,
        category: String(form.get("category")),
        urgency: String(form.get("urgency")),
        preferredContact: String(form.get("preferredContact") || "") || undefined,
        submit: true
      });
      navigate(`/app/seeker/requests/${data.request.id}`);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Unable to submit request");
    }
  }

  return (
    <SeekerShell
      title="Post"
      action={
        <Button type="submit" form="post-problem">
          Submit
        </Button>
      }
    >
      <form id="post-problem" className="card max-w-2xl space-y-4" onSubmit={onSubmit}>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Posted by</span>
          <select className="input" name="posterType" defaultValue="BUSINESS">
            <option value="PERSON">A person</option>
            <option value="BUSINESS">A business</option>
            <option value="INSTITUTION">An institution / school</option>
            <option value="ORGANIZATION">An organization</option>
            <option value="COMMUNITY">A community</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Problem</span>
          <textarea
            className="input min-h-24"
            name="problem"
            required
            rows={4}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Result wanted</span>
          <textarea
            className="input min-h-20"
            name="outcome"
            required
            rows={3}
          />
        </label>
        <TextField label="Who is affected" name="whoIsAffected" />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Organisation" name="organization" />
          <TextField label="Location" name="location" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Skill</span>
            <select className="input" name="category" defaultValue="SOFTWARE">
              <option value="SOFTWARE">Software</option>
              <option value="WEB_DEVELOPMENT">Website</option>
              <option value="MOBILE_DEVELOPMENT">Mobile app</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="ELECTRONICS">Electronics</option>
              <option value="MECHANICAL">Mechanical</option>
              <option value="ENERGY">Energy / solar</option>
              <option value="AGRICULTURE">Agriculture</option>
              <option value="CONSTRUCTION">Construction</option>
              <option value="OTHER">Not sure</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Urgency</span>
            <select className="input" name="urgency" defaultValue="NORMAL">
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </label>
        </div>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Notes</span>
          <textarea className="input min-h-20" name="extraInfo" rows={3} />
        </label>
        <TextField label="Contact" name="preferredContact" />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </form>
    </SeekerShell>
  );
}
