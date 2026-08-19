import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { enterDemo } from "../../lib/api/auth";
import { ApiRequestError } from "../../lib/api/client";
import { useAuth } from "../../features/auth/auth-context";
import { dashboardPath } from "../../routes/dashboardPath";
import { DEMO_PERSONAS } from "../../data/personas";
import { Logo } from "../../components/Logo";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export function LoginPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function pick(email: string) {
    setBusy(email);
    setError(null);
    try {
      const data = await enterDemo(email);
      setUser(data.user);
      navigate(dashboardPath(data.user.role));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Unable to sign in");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-10 text-white lg:flex lg:w-[46%] xl:p-12">
        <Logo size={56} />
        <div>
          <h1 className="text-3xl font-bold tracking-tight xl:text-4xl">SOLA</h1>
          <p className="mt-3 text-lg text-blue-100">Real Problems. Real Skills. Real Solutions.</p>
        </div>
        <p className="text-sm text-blue-100/80">Community and TVET, working together</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="mb-5 flex items-center gap-3 lg:hidden">
            <Logo size={44} />
            <p className="font-bold">SOLA</p>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-lg">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
            <div className="mt-5 space-y-2">
              {DEMO_PERSONAS.map((persona) => (
                <button
                  key={persona.email}
                  type="button"
                  disabled={Boolean(busy)}
                  onClick={() => pick(persona.email)}
                  className="flex w-full items-center gap-3 rounded-xl border bg-background px-3 py-3 text-left transition-colors hover:border-primary/40 hover:bg-accent disabled:opacity-60"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {initials(persona.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{persona.name}</p>
                    <p className="text-xs text-muted-foreground">{persona.title}</p>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {busy === persona.email ? "…" : "Open"}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm">
            <Link className="font-medium text-primary" to="/">
              Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
