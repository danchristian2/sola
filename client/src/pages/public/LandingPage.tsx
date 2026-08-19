import { Link } from "react-router-dom";
import { PublicLayout } from "../../layouts/layouts";

export function LandingPage() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-blue-50 to-transparent" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-24">
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            Real Problems. Real Skills. Real Solutions.
          </h1>
          <div className="mt-8 flex flex-wrap items-center gap-2 text-sm">
            {["New", "Match", "Build", "Test", "Done"].map((step, index) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">{step}</span>
                {index < 4 ? <span className="text-primary/40">→</span> : null}
              </span>
            ))}
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link
              to="/register"
              className="card block border-transparent shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/20"
            >
              <p className="text-sm font-medium text-primary">Client</p>
              <p className="mt-1 text-xl font-semibold">Post a problem</p>
            </Link>
            <Link
              to="/login"
              className="card block border-transparent shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/20"
            >
              <p className="text-sm font-medium text-primary">TVET school</p>
              <p className="mt-1 text-xl font-semibold">Open workspace</p>
            </Link>
          </div>
          <div className="mt-8">
            <Link to="/register" className="btn-primary h-11 px-6">
              Submit a Problem
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
