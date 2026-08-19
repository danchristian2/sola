import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { applyForPartnership } from "../../lib/api/schools";
import { ApiRequestError } from "../../lib/api/client";
import { PublicLayout } from "../../layouts/layouts";
import { Button, TextField } from "../../components/ui/primitives";

export function PartnerPage() {
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await applyForPartnership({
        schoolName: String(form.get("schoolName")),
        location: String(form.get("location")),
        contactEmail: String(form.get("contactEmail")),
        contactPhone: String(form.get("contactPhone") || "") || undefined,
        adminFirstName: String(form.get("adminFirstName")),
        adminLastName: String(form.get("adminLastName")),
        adminEmail: String(form.get("adminEmail")),
        message: String(form.get("message") || "") || undefined
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Unable to submit request");
    }
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-lg px-6 py-16">
        <div className="card">
          {submitted ? (
            <>
              <h1 className="text-2xl font-semibold">Request received</h1>
              <Link to="/" className="btn-primary mt-6">
                Home
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold">School partnership</h1>
              <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                <TextField label="School name" name="schoolName" required />
                <TextField label="Location" name="location" required />
                <TextField label="School contact email" name="contactEmail" type="email" required />
                <TextField label="Phone" name="contactPhone" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Admin first name" name="adminFirstName" required />
                  <TextField label="Admin last name" name="adminLastName" required />
                </div>
                <TextField
                  label="Admin email"
                  name="adminEmail"
                  type="email"
                  required
                />
                <label className="block space-y-1">
                  <span className="text-sm font-medium">Message</span>
                  <textarea className="input min-h-24" name="message" rows={4} />
                </label>
                {error ? <p className="text-sm text-red-700">{error}</p> : null}
                <Button type="submit">Submit</Button>
              </form>
              <p className="mt-4 text-sm">
                <Link className="font-medium text-primary" to="/invite">
                  Invite
                </Link>
                {" · "}
                <Link className="font-medium text-primary" to="/login">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
