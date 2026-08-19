import { api } from "./client";
import type { AuthUser } from "../../types";

export interface School {
  id: string;
  name: string;
  location: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: string;
  createdAt: string;
}

export interface Department {
  id: string;
  schoolId: string;
  name: string;
  description: string | null;
  skills: string[];
  isActive: boolean;
}

export interface SchoolUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  schoolId: string | null;
  departmentId: string | null;
  status: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
}

export interface PartnershipApplication {
  id: string;
  schoolName: string;
  location: string;
  contactEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  message: string | null;
  status: string;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function applyForPartnership(input: {
  schoolName: string;
  location: string;
  contactEmail: string;
  contactPhone?: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  message?: string;
}) {
  return api<{ application: PartnershipApplication }>("/api/v1/partnerships", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function listPartnerships() {
  return api<Paginated<PartnershipApplication>>("/api/v1/partnerships");
}

export function approvePartnership(id: string) {
  return api<{
    application: PartnershipApplication;
    school: School;
    token?: string;
  }>(`/api/v1/partnerships/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({})
  });
}

export function rejectPartnership(id: string, note?: string) {
  return api<{ application: PartnershipApplication }>(`/api/v1/partnerships/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ note })
  });
}

export function getMySchool() {
  return api<{ school: School | null }>("/api/v1/schools/me");
}

export function listSchools() {
  return api<Paginated<School>>("/api/v1/schools");
}

export function updateSchool(
  id: string,
  input: { name?: string; location?: string; contactEmail?: string; contactPhone?: string }
) {
  return api<{ school: School }>(`/api/v1/schools/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function listDepartments(schoolId: string) {
  return api<{ items: Department[] }>(`/api/v1/schools/${schoolId}/departments`);
}

export function createDepartment(
  schoolId: string,
  input: { name: string; description?: string; skills?: string[] }
) {
  return api<{ department: Department }>(`/api/v1/schools/${schoolId}/departments`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function listSchoolUsers(schoolId: string, role?: string) {
  const query = role ? `?role=${encodeURIComponent(role)}&limit=50` : "";
  return api<Paginated<SchoolUser>>(`/api/v1/schools/${schoolId}/users${query}`);
}

export function createInvitation(
  schoolId: string,
  input: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    departmentId?: string;
  }
) {
  return api<{ invitation: Invitation; token?: string }>(
    `/api/v1/schools/${schoolId}/invitations`,
    { method: "POST", body: JSON.stringify(input) }
  );
}

export function acceptInvitation(input: { token: string; password: string }) {
  return api<{ user: AuthUser }>("/api/v1/auth/accept-invitation", {
    method: "POST",
    body: JSON.stringify(input)
  });
}
