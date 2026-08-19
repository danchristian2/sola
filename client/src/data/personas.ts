import type { Role } from "../types";

export const DEMO_PERSONAS: Array<{
  email: string;
  role: Role;
  name: string;
  title: string;
  blurb: string;
}> = [
  {
    email: "demo.seeker@sola.local",
    role: "SERVICE_SEEKER",
    name: "Patrick Bizimana",
    title: "Client",
    blurb: "Post a real problem. SOLA sends it to a TVET school with matching skills."
  },
  {
    email: "demo.coordinator@sola.local",
    role: "SCHOOL_COORDINATOR",
    name: "Eric Niyonzima",
    title: "Coordinator",
    blurb: "Review incoming problems, accept or reject, assign a department."
  },
  {
    email: "demo.schooladmin@sola.local",
    role: "SCHOOL_ADMIN",
    name: "Grace Uwera",
    title: "School admin",
    blurb: "The school as solution provider: departments, people, request pipeline."
  },
  {
    email: "demo.teacher@sola.local",
    role: "TEACHER",
    name: "Jean Habimana",
    title: "Teacher",
    blurb: "Supervise the team on an accepted request."
  },
  {
    email: "demo.admin@sola.local",
    role: "SUPER_ADMIN",
    name: "Solange Mugabo",
    title: "Admin",
    blurb: "Decide which TVET schools may join SOLA."
  }
];
