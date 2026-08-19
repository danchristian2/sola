import request from "supertest";
import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app.js";
import { loadEnv } from "../../config/env.js";
import { createLogger } from "../../config/logger.js";
import { UserModel } from "../users/user.model.js";
import { SchoolModel } from "../schools/school.model.js";
import { DepartmentModel } from "../departments/department.model.js";
import { ServiceRequestModel } from "./serviceRequest.model.js";
import { ROLES, USER_STATUSES } from "../../common/constants/roles.js";
import { REQUEST_STATUSES } from "../../common/constants/requestStatus.js";
import { hashPassword } from "../../common/utils/password.js";

const env = loadEnv();
const app = createApp(env, createLogger(env));

async function setupActors() {
  const passwordHash = await hashPassword("password12");
  const schoolA = await SchoolModel.create({
    name: "School A",
    location: "Kigali",
    contactEmail: "a@school.rw",
    status: "ACTIVE"
  });
  const schoolB = await SchoolModel.create({
    name: "School B",
    location: "Huye",
    contactEmail: "b@school.rw",
    status: "ACTIVE"
  });
  const dept = await DepartmentModel.create({
    schoolId: schoolA._id,
    name: "ICT",
    skills: ["WEB_DEVELOPMENT"]
  });

  await UserModel.create({
    email: "seeker@example.com",
    passwordHash,
    firstName: "Pat",
    lastName: "Seeker",
    role: ROLES.SERVICE_SEEKER,
    status: USER_STATUSES.ACTIVE
  });
  await UserModel.create({
    email: "coord-a@school.rw",
    passwordHash,
    firstName: "Coord",
    lastName: "A",
    role: ROLES.SCHOOL_COORDINATOR,
    schoolId: schoolA._id,
    status: USER_STATUSES.ACTIVE
  });
  await UserModel.create({
    email: "coord-b@school.rw",
    passwordHash,
    firstName: "Coord",
    lastName: "B",
    role: ROLES.SCHOOL_COORDINATOR,
    schoolId: schoolB._id,
    status: USER_STATUSES.ACTIVE
  });

  const seeker = request.agent(app);
  await seeker.post("/api/v1/auth/login").send({
    email: "seeker@example.com",
    password: "password12"
  });
  const coordA = request.agent(app);
  await coordA.post("/api/v1/auth/login").send({
    email: "coord-a@school.rw",
    password: "password12"
  });
  const coordB = request.agent(app);
  await coordB.post("/api/v1/auth/login").send({
    email: "coord-b@school.rw",
    password: "password12"
  });

  return { schoolA, schoolB, dept, seeker, coordA, coordB };
}

describe("Service requests", () => {
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
      ServiceRequestModel.deleteMany({})
    ]);
  });

  it("lets a service seeker submit a problem to a school", async () => {
    const { seeker, schoolA } = await setupActors();
    const res = await seeker.post("/api/v1/service-requests").send({
      schoolId: schoolA._id.toString(),
      problem: "Stock is counted by hand every evening.",
      outcome: "A simple inventory record that staff can update.",
      whoIsAffected: "Shop attendants",
      category: "SOFTWARE",
      urgency: "HIGH",
      submit: true
    });
    expect(res.status).toBe(201);
    expect(res.body.data.request.status).toBe(REQUEST_STATUSES.SUBMITTED);
  });

  it("rejects an illegal status jump", async () => {
    const { seeker, coordA, schoolA } = await setupActors();
    const created = await seeker.post("/api/v1/service-requests").send({
      schoolId: schoolA._id.toString(),
      problem: "The workshop generator fails during evening classes.",
      outcome: "A reliable power setup for evening training.",
      submit: true
    });
    const id = created.body.data.request.id;
    const res = await coordA.post(`/api/v1/service-requests/${id}/accept`).send({});
    expect(res.status).toBe(422);
  });

  it("lets a coordinator review and accept a request", async () => {
    const { seeker, coordA, schoolA, dept } = await setupActors();
    const created = await seeker.post("/api/v1/service-requests").send({
      schoolId: schoolA._id.toString(),
      problem: "Customer orders are written in a notebook and get lost.",
      outcome: "Orders recorded and easy to find.",
      submit: true
    });
    const id = created.body.data.request.id;
    await coordA.post(`/api/v1/service-requests/${id}/review`);
    const accepted = await coordA.post(`/api/v1/service-requests/${id}/accept`).send({});
    expect(accepted.body.data.request.status).toBe(REQUEST_STATUSES.MATCHING);
    const assigned = await coordA.post(`/api/v1/service-requests/${id}/assign`).send({
      departmentId: dept._id.toString()
    });
    expect(assigned.body.data.request.status).toBe(REQUEST_STATUSES.ASSIGNED);
  });

  it("blocks School B from reading School A's request", async () => {
    const { seeker, coordB, schoolA } = await setupActors();
    const created = await seeker.post("/api/v1/service-requests").send({
      schoolId: schoolA._id.toString(),
      problem: "Irrigation pipes leak in the school garden.",
      outcome: "Water reaches the crops without waste.",
      submit: true
    });
    const id = created.body.data.request.id;
    const res = await coordB.get(`/api/v1/service-requests/${id}`);
    expect(res.status).toBe(403);
  });
});
