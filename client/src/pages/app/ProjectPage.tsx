import { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "../../layouts/layouts";
import { Button, EmptyState, TextField } from "../../components/ui/primitives";
import { DataTable, SectionHead, Td } from "../../components/ui/table";
import { useAuth } from "../../features/auth/auth-context";
import { listSchoolUsers } from "../../lib/api/schools";
import {
  addProjectEvidence,
  addProjectFeedback,
  addProjectMember,
  addProjectTask,
  advanceProject,
  getProject,
  setProjectImpact,
  updateProjectTask
} from "../../lib/api/projects";
import { statusClass } from "../../ui/theme";

const STAGES = ["INVESTIGATE", "DESIGN", "BUILD", "TEST", "IMPROVE", "DELIVERED", "COMPLETED"];

export function ProjectPage() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProject(id),
    enabled: Boolean(id)
  });
  const students = useQuery({
    queryKey: ["students", user?.schoolId],
    queryFn: () => listSchoolUsers(user!.schoolId!, "STUDENT"),
    enabled:
      Boolean(user?.schoolId) &&
      (user?.role === "TEACHER" || user?.role === "SCHOOL_COORDINATOR" || user?.role === "SCHOOL_ADMIN")
  });

  const project = query.data?.project;
  const canStaff = user?.role === "TEACHER" || user?.role === "SCHOOL_COORDINATOR" || user?.role === "SCHOOL_ADMIN";
  const isClient = user?.role === "SERVICE_SEEKER";

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["project", id] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["service-requests"] });
  }

  if (!project) {
    return (
      <AppLayout title="Project">
        <EmptyState title="Not found" />
      </AppLayout>
    );
  }

  const stageIndex = STAGES.indexOf(project.stage);

  return (
    <AppLayout
      title={project.title}
      action={
        canStaff && project.stage !== "COMPLETED" ? (
          <Button onClick={() => advanceProject(id).then(refresh)}>Next stage</Button>
        ) : undefined
      }
    >
      <ol className="mb-6 flex flex-wrap items-center gap-0">
        {STAGES.map((stage, index) => (
          <li key={stage} className="flex items-center">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                index <= stageIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {stage.replaceAll("_", " ")}
            </span>
            {index < STAGES.length - 1 ? (
              <span className={`mx-1 h-0.5 w-4 sm:w-6 ${index < stageIndex ? "bg-primary" : "bg-border"}`} />
            ) : null}
          </li>
        ))}
      </ol>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <SectionHead title="Team" />
          <DataTable headers={["Name", "Role"]}>
            {project.team.map((member) => (
              <tr key={member.userId} className="border-b last:border-0">
                <Td className="font-medium">{member.name}</Td>
                <Td className="text-muted-foreground">{member.teamRole.replaceAll("_", " ")}</Td>
              </tr>
            ))}
          </DataTable>
          {canStaff ? (
            <form
              className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                addProjectMember(id, String(data.get("userId")), String(data.get("teamRole"))).then(refresh);
                event.currentTarget.reset();
              }}
            >
              <select className="input" name="userId" required defaultValue="">
                <option value="" disabled>
                  Student
                </option>
                {(students.data?.items ?? []).map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.firstName} {person.lastName}
                  </option>
                ))}
              </select>
              <select className="input" name="teamRole" defaultValue="GENERAL">
                <option value="BACKEND">Backend</option>
                <option value="FRONTEND">Frontend</option>
                <option value="DATABASE">Database</option>
                <option value="UI_UX">UI/UX</option>
                <option value="TESTING">Testing</option>
                <option value="GENERAL">General</option>
              </select>
              <Button type="submit" variant="secondary">
                Add
              </Button>
            </form>
          ) : null}
        </section>

        <section>
          <SectionHead title="Tasks" />
          <DataTable headers={["Task", ""]}>
            {project.tasks.map((task) => (
              <tr key={task.id} className="border-b last:border-0">
                <Td className={task.status === "DONE" ? "text-muted-foreground line-through" : ""}>{task.title}</Td>
                <Td className="text-right">
                  {task.status !== "DONE" ? (
                    <button
                      className="text-sm font-medium text-primary"
                      type="button"
                      onClick={() => updateProjectTask(id, task.id, "DONE").then(refresh)}
                    >
                      Done
                    </button>
                  ) : (
                    <span className={statusClass("COMPLETED")}>Done</span>
                  )}
                </Td>
              </tr>
            ))}
          </DataTable>
          {canStaff ? (
            <form
              className="mt-3 flex gap-2"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const title = String(new FormData(event.currentTarget).get("title"));
                addProjectTask(id, { title, milestone: project.stage }).then(refresh);
                event.currentTarget.reset();
              }}
            >
              <input className="input" name="title" placeholder="New task" required />
              <Button type="submit" variant="secondary">
                Add
              </Button>
            </form>
          ) : null}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section>
          <SectionHead title="Evidence" />
          <DataTable headers={["Note"]}>
            {project.evidence.map((item, index) => (
              <tr key={index} className="border-b last:border-0">
                <Td>{item.note}</Td>
              </tr>
            ))}
          </DataTable>
          {user?.role !== "SERVICE_SEEKER" ? (
            <form
              className="mt-3 flex gap-2"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                addProjectEvidence(id, String(new FormData(event.currentTarget).get("note"))).then(refresh);
                event.currentTarget.reset();
              }}
            >
              <input className="input" name="note" placeholder="Note" required />
              <Button type="submit" variant="secondary">
                Save
              </Button>
            </form>
          ) : null}
        </section>

        <section>
          <SectionHead title="Client feedback" />
          <DataTable headers={["Comment", "Change"]}>
            {project.feedback.map((item, index) => (
              <tr key={index} className="border-b last:border-0">
                <Td>{item.comment}</Td>
                <Td className="text-muted-foreground">{item.needsChange || "—"}</Td>
              </tr>
            ))}
          </DataTable>
          {isClient ? (
            <form
              className="mt-3 space-y-2"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                addProjectFeedback(id, {
                  comment: String(data.get("comment")),
                  works: String(data.get("works") || "") || undefined,
                  needsChange: String(data.get("needsChange") || "") || undefined
                }).then(refresh);
                event.currentTarget.reset();
              }}
            >
              <textarea className="input" name="comment" required rows={3} placeholder="Feedback" />
              <div className="grid gap-2 sm:grid-cols-2">
                <TextField label="Works" name="works" />
                <TextField label="Change needed" name="needsChange" />
              </div>
              <Button type="submit">Send</Button>
            </form>
          ) : null}
        </section>
      </div>

      <section className="mt-6">
        <SectionHead title="Impact" />
        {project.impact ? (
          <DataTable headers={["", ""]}>
            <tr className="border-b">
              <Td className="w-32 text-muted-foreground">Before</Td>
              <Td>{project.impact.before}</Td>
            </tr>
            <tr className="border-b">
              <Td className="text-muted-foreground">After</Td>
              <Td>{project.impact.after}</Td>
            </tr>
            {project.impact.timeSaved ? (
              <tr className="border-b">
                <Td className="text-muted-foreground">Time saved</Td>
                <Td>{project.impact.timeSaved}</Td>
              </tr>
            ) : null}
            {project.impact.peopleHelped ? (
              <tr>
                <Td className="text-muted-foreground">People helped</Td>
                <Td>{project.impact.peopleHelped}</Td>
              </tr>
            ) : null}
          </DataTable>
        ) : (isClient || canStaff) ? (
          <form
            className="card max-w-2xl space-y-3"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              setProjectImpact(id, {
                before: String(data.get("before")),
                after: String(data.get("after")),
                timeSaved: String(data.get("timeSaved") || "") || undefined,
                peopleHelped: String(data.get("peopleHelped") || "") || undefined
              }).then(refresh);
            }}
          >
            <label className="block space-y-1">
              <span className="text-sm font-medium">Before</span>
              <textarea className="input" name="before" required rows={2} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">After</span>
              <textarea className="input" name="after" required rows={2} />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Time saved" name="timeSaved" />
              <TextField label="People helped" name="peopleHelped" />
            </div>
            <Button type="submit">Save</Button>
          </form>
        ) : (
          <DataTable headers={["Impact"]} empty="None" />
        )}
      </section>

      <p className="mt-6 text-sm">
        <Link className="text-primary" to={user?.role === "SERVICE_SEEKER" ? "/app/seeker" : "/app/teacher"}>
          Back
        </Link>
      </p>
    </AppLayout>
  );
}
