import { api } from "./client";

export interface Project {
  id: string;
  requestId: string;
  schoolId: string;
  departmentId: string | null;
  teacherId: string;
  title: string;
  stage: string;
  team: Array<{ userId: string; name: string; teamRole: string }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    assigneeId: string | null;
    milestone: string;
  }>;
  evidence: Array<{ note: string; at: string }>;
  feedback: Array<{
    comment: string;
    works: string | null;
    needsChange: string | null;
    at: string;
  }>;
  impact: {
    before: string;
    after: string;
    timeSaved?: string;
    moneySaved?: string;
    peopleHelped?: string;
    satisfaction?: string;
  } | null;
}

export function listProjects() {
  return api<{ items: Project[] }>("/api/v1/projects");
}

export function listPortfolio() {
  return api<{ items: Project[] }>("/api/v1/projects/portfolio");
}

export function getProject(id: string) {
  return api<{ project: Project }>(`/api/v1/projects/${id}`);
}

export function getProjectByRequest(requestId: string) {
  return api<{ project: Project | null }>(`/api/v1/projects/by-request/${requestId}`);
}

export function createProject(requestId: string) {
  return api<{ project: Project }>("/api/v1/projects", {
    method: "POST",
    body: JSON.stringify({ requestId })
  });
}

export function addProjectMember(id: string, userId: string, teamRole: string) {
  return api<{ project: Project }>(`/api/v1/projects/${id}/team`, {
    method: "POST",
    body: JSON.stringify({ userId, teamRole })
  });
}

export function addProjectTask(id: string, input: { title: string; assigneeId?: string; milestone?: string }) {
  return api<{ project: Project }>(`/api/v1/projects/${id}/tasks`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateProjectTask(id: string, taskId: string, status: string) {
  return api<{ project: Project }>(`/api/v1/projects/${id}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export function addProjectEvidence(id: string, note: string) {
  return api<{ project: Project }>(`/api/v1/projects/${id}/evidence`, {
    method: "POST",
    body: JSON.stringify({ note })
  });
}

export function addProjectFeedback(
  id: string,
  input: { comment: string; works?: string; needsChange?: string }
) {
  return api<{ project: Project }>(`/api/v1/projects/${id}/feedback`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function setProjectImpact(
  id: string,
  input: {
    before: string;
    after: string;
    timeSaved?: string;
    peopleHelped?: string;
    moneySaved?: string;
    satisfaction?: string;
  }
) {
  return api<{ project: Project }>(`/api/v1/projects/${id}/impact`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function advanceProject(id: string) {
  return api<{ project: Project }>(`/api/v1/projects/${id}/advance`, {
    method: "POST"
  });
}
