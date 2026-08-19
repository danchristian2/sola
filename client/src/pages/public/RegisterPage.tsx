import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerAccount } from "../../lib/api/auth";
import { ApiRequestError } from "../../lib/api/client";
import { useAuth } from "../../features/auth/auth-context";
import { PublicLayout } from "../../layouts/layouts";
import { Button, TextField } from "../../components/ui/primitives";

export function RegisterPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const data = await registerAccount({
        firstName: String(form.get("firstName")),
        lastName: String(form.get("lastName")),
        email: String(form.get("email")),
        password: String(form.get("password"))
      });
      setUser(data.user);
      navigate("/app/seeker");
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Unable to create account"
      );
    }
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="card">
          <h1 className="text-2xl font-semibold">Create account</h1>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <TextField label="First name" name="firstName" required />
            <TextField label="Last name" name="lastName" required />
            <TextField label="Email" name="email" type="email" required autoComplete="email" />
            <TextField
              label="Password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
            />
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <Button type="submit">Create account</Button>
          </form>
          <p className="mt-4 text-sm">
            <Link className="font-medium text-primary" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
