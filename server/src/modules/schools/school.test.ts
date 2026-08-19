import request from "supertest";
import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app.js";
import { loadEnv } from "../../config/env.js";
import { createLogger } from "../../config/logger.js";
import { UserModel } from "../users/user.model.js";
import { SchoolModel } from "../schools/school.model.js";
import { DepartmentModel } from "../departments/department.model.js";
import { InvitationModel } from "../invitations/invitation.model.js";
import { PartnershipApplicationModel } from "../partnerships/partnership.model.js";
import { ROLES, USER_STATUSES } from "../../common/constants/roles.js";
import { hashPassword } from "../../common/utils/password.js";

const env = loadEnv();
const app = createApp(env, createLogger(env));

async function superAdminAgent() {
  await UserModel.create({
    email: "root@sola.rw",
    passwordHash: await hashPassword("password12"),
    firstName: "Sola",
    lastName: "Admin",
    role: ROLES.SUPER_ADMIN,
    status: USER_STATUSES.ACTIVE
  });
  const agent = request.agent(app);
  await agent.post("/api/v1/auth/login").send({
    email: "root@sola.rw",
    password: "password12"
  });
  return agent;
}

async function admitSchool(suffix: string) {
  const platform = await superAdminAgent();
  const created = await platform.post("/api/v1/schools").send({
    name: `School ${suffix}`,
    location: "Kigali",
    contactEmail: `contact-${suffix}@school.rw`,
    admin: {
      firstName: "Admin",
      lastName: suffix,
      email: `admin-${suffix}@school.rw`
    }
  });
  const school = created.body.data.school;
  const token = created.body.data.token;
  const agent = request.agent(app);
  await agent.post("/api/v1/auth/accept-invitation").send({
    token,
    password: "password12"
  });
  return { agent, school, platform };
}

describe("Schools, departments, invitations", () => {
  beforeAll(async () => {
    await mongoose.connect(env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await Promise.all([
      UserModel.deleteMany({}),
      SchoolModel.deleteMany({}),
      DepartmentModel.deleteMany({}),
      InvitationModel.deleteMany({}),
      PartnershipApplicationModel.deleteMany({})
    ]);
  });

  it("does not allow schools to self-register", async () => {
    const res = await request(app).post("/api/v1/schools/onboard").send({
      schoolName: "Open School",
      location: "Kigali",
      contactEmail: "open@school.rw",
      firstName: "Ada",
      lastName: "Min",
      email: "ada@school.rw",
      password: "password12"
    });
    expect(res.status).toBe(404);
  });

  it("accepts a partnership request without creating an account", async () => {
    const res = await request(app).post("/api/v1/partnerships").send({
      schoolName: "IPRC Kigali",
      location: "Kigali",
      contactEmail: "info@iprc.rw",
      adminFirstName: "Grace",
      adminLastName: "Uwera",
      adminEmail: "grace@iprc.rw",
      message: "We want to take community problems into our ICT department."
    });
    expect(res.status).toBe(201);
    expect(res.body.data.application.status).toBe("SUBMITTED");
    expect(await UserModel.countDocuments()).toBe(0);
  });

  it("lets a super admin approve a partnership and invite the school admin", async () => {
    const apply = await request(app).post("/api/v1/partnerships").send({
      schoolName: "IPRC Huye",
      location: "Huye",
      contactEmail: "info@huye.rw",
      adminFirstName: "Jean",
      adminLastName: "Bizimana",
      adminEmail: "jean@huye.rw"
    });
    const platform = await superAdminAgent();
    const approved = await platform
      .post(`/api/v1/partnerships/${apply.body.data.application.id}/approve`)
      .send({});
    expect(approved.status).toBe(200);
    expect(approved.body.data.token).toBeTruthy();

    const accepted = await request.agent(app).post("/api/v1/auth/accept-invitation").send({
      token: approved.body.data.token,
      password: "password12"
    });
    expect(accepted.status).toBe(200);
    expect(accepted.body.data.user.role).toBe(ROLES.SCHOOL_ADMIN);
  });

  it("lets a school admin create departments and invite a teacher", async () => {
    const { agent, school } = await admitSchool("nyarugenge");
    const dept = await agent.post(`/api/v1/schools/${school.id}/departments`).send({
      name: "ICT",
      skills: ["WEB_DEVELOPMENT"]
    });
    expect(dept.status).toBe(201);

    const invite = await agent.post(`/api/v1/schools/${school.id}/invitations`).send({
      email: "teacher@nyarugenge.rw",
      firstName: "Jean",
      lastName: "Habimana",
      role: ROLES.TEACHER,
      departmentId: dept.body.data.department.id
    });
    expect(invite.status).toBe(201);

    const accept = await request.agent(app).post("/api/v1/auth/accept-invitation").send({
      token: invite.body.data.token,
      password: "password12"
    });
    expect(accept.status).toBe(200);
    expect(accept.body.data.user.role).toBe(ROLES.TEACHER);
  });

  it("blocks invited users from signing in before acceptance", async () => {
    const { agent, school } = await admitSchool("huye");
    await agent.post(`/api/v1/schools/${school.id}/invitations`).send({
      email: "pending@huye.rw",
      firstName: "Pending",
      lastName: "Teacher",
      role: ROLES.TEACHER
    });
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "pending@huye.rw",
      password: "password12"
    });
    expect(res.status).toBe(401);
  });

  it("prevents School A from reading School B private data", async () => {
    const a = await admitSchool("a");
    const bCreated = await a.platform.post("/api/v1/schools").send({
      name: "School b",
      location: "Kigali",
      contactEmail: "contact-b@school.rw",
      admin: { firstName: "Admin", lastName: "b", email: "admin-b@school.rw" }
    });
    const b = request.agent(app);
    await b.post("/api/v1/auth/accept-invitation").send({
      token: bCreated.body.data.token,
      password: "password12"
    });

    const forbiddenSchool = await a.agent.get(`/api/v1/schools/${bCreated.body.data.school.id}`);
    expect(forbiddenSchool.status).toBe(403);
    const own = await a.agent.get(`/api/v1/schools/${a.school.id}`);
    expect(own.status).toBe(200);
  });

  it("prevents a coordinator from inviting a school admin", async () => {
    const { agent, school } = await admitSchool("musanze");
    const invite = await agent.post(`/api/v1/schools/${school.id}/invitations`).send({
      email: "coord@musanze.rw",
      firstName: "Claire",
      lastName: "Uwimana",
      role: ROLES.SCHOOL_COORDINATOR
    });
    await request.agent(app).post("/api/v1/auth/accept-invitation").send({
      token: invite.body.data.token,
      password: "password12"
    });
    const coordAgent = request.agent(app);
    await coordAgent.post("/api/v1/auth/login").send({
      email: "coord@musanze.rw",
      password: "password12"
    });
    const res = await coordAgent.post(`/api/v1/schools/${school.id}/invitations`).send({
      email: "newadmin@musanze.rw",
      firstName: "Pat",
      lastName: "Admin",
      role: ROLES.SCHOOL_ADMIN
    });
    expect(res.status).toBe(403);
  });

  it("lets a super admin list all schools", async () => {
    const { platform } = await admitSchool("one");
    const res = await platform.get("/api/v1/schools");
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
  });

  it("does not let a service seeker list school users", async () => {
    const { school } = await admitSchool("rwamagana");
    const seeker = request.agent(app);
    await seeker.post("/api/v1/auth/register").send({
      email: "seeker@example.com",
      password: "password12",
      firstName: "Aline",
      lastName: "Uwase"
    });
    const res = await seeker.get(`/api/v1/schools/${school.id}/users`);
    expect(res.status).toBe(403);
  });
});
