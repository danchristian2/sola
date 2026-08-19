export type Role =
  | "SUPER_ADMIN"
  | "SCHOOL_ADMIN"
  | "SCHOOL_COORDINATOR"
  | "TEACHER"
  | "STUDENT"
  | "SERVICE_SEEKER";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  schoolId: string | null;
  status: string;
  permissions: string[];
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details: unknown[];
  };
}
