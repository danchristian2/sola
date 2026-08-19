import { FormEvent, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { acceptInvitation } from "../../lib/api/schools";
import { ApiRequestError } from "../../lib/api/client";
import { useAuth } from "../../features/auth/auth-context";
import { PublicLayout } from "../../layouts/layouts";
import { Button, TextField } from "../../components/ui/primitives";
import { dashboardPath } from "../../routes/dashboardPath";

export function AcceptInvitePage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") ?? "", [params]);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const inviteToken = token || String(form.get("token"));
    try {
      const data = await acceptInvitation({
        token: inviteToken,
        password: String(form.get("password"))
      });
      setUser(data.user);
      navigate(dashboardPath(data.user.role));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Unable to accept invitation");
    }
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="card">
          <h1 className="text-2xl font-semibold">Join school</h1>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            {token ? null : <TextField label="Invitation token" name="token" required />}
            <TextField
              label="Password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
            />
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <Button type="submit">Activate account</Button>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
}
