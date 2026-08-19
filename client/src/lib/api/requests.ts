import { api } from "./client";
import type { Paginated } from "./schools";

export interface ServiceRequest {
  id: string;
  seekerId: string;
  schoolId: string | null;
  departmentId: string | null;
  teacherId: string | null;
  schoolName: string | null;
  departmentName: string | null;
  teacherName: string | null;
  posterType: string;
  organization: string | null;
  location: string | null;
  problem: string;
  outcome: string;
  whoIsAffected: string | null;
  extraInfo: string | null;
  matchReason: string | null;
  category: string;
  urgency: string;
  preferredContact: string | null;
  status: string;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolDirectoryItem {
  id: string;
  name: string;
  location: string | null;
}

export function listSchoolDirectory() {
  return api<{ items: SchoolDirectoryItem[] }>("/api/v1/schools/directory");
}

export function listServiceRequests(params?: { status?: string }) {
  const query = params?.status ? `?status=${encodeURIComponent(params.status)}` : "";
  return api<Paginated<ServiceRequest>>(`/api/v1/service-requests${query}`);
}

export function getServiceRequest(id: string) {
  return api<{ request: ServiceRequest }>(`/api/v1/service-requests/${id}`);
}

export function createServiceRequest(input: Record<string, unknown>) {
  return api<{ request: ServiceRequest }>("/api/v1/service-requests", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function submitServiceRequest(id: string) {
  return api<{ request: ServiceRequest }>(`/api/v1/service-requests/${id}/submit`, {
    method: "POST"
  });
}

export function reviewServiceRequest(id: string) {
  return api<{ request: ServiceRequest }>(`/api/v1/service-requests/${id}/review`, {
    method: "POST"
  });
}

export function acceptServiceRequest(id: string, note?: string) {
  return api<{ request: ServiceRequest }>(`/api/v1/service-requests/${id}/accept`, {
    method: "POST",
    body: JSON.stringify({ note })
  });
}

export function rejectServiceRequest(id: string, note?: string) {
  return api<{ request: ServiceRequest }>(`/api/v1/service-requests/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ note })
  });
}

export function requestMoreInfo(id: string, note: string) {
  return api<{ request: ServiceRequest }>(`/api/v1/service-requests/${id}/needs-information`, {
    method: "POST",
    body: JSON.stringify({ note })
  });
}

export function assignServiceRequest(id: string, departmentId: string) {
  return api<{ request: ServiceRequest }>(`/api/v1/service-requests/${id}/assign`, {
    method: "POST",
    body: JSON.stringify({ departmentId })
  });
}

export function assignTeacher(id: string, teacherId: string) {
  return api<{ request: ServiceRequest }>(`/api/v1/service-requests/${id}/assign-teacher`, {
    method: "POST",
    body: JSON.stringify({ teacherId })
  });
}
