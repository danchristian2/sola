import request from "supertest";
import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app.js";
import { loadEnv } from "../../config/env.js";
import { createLogger } from "../../config/logger.js";
import { UserModel } from "../users/user.model.js";
import { ROLES } from "../../common/constants/roles.js";
import { hashPassword } from "../../common/utils/password.js";

describe("Auth API", () => {
  const env = loadEnv();
  const app = createApp(env, createLogger(env));

  beforeAll(async () => {
    await mongoose.connect(env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  it("registers a service seeker and returns the session user", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "seeker@example.com",
      password: "password12",
      firstName: "Aline",
      lastName: "Uwase"
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe(ROLES.SERVICE_SEEKER);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects duplicate registration", async () => {
    const payload = {
      email: "seeker@example.com",
      password: "password12",
      firstName: "Aline",
      lastName: "Uwase"
    };
    await request(app).post("/api/v1/auth/register").send(payload);
    const res = await request(app).post("/api/v1/auth/register").send(payload);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("logs in an existing user", async () => {
    await UserModel.create({
      email: "teacher@school.rw",
      passwordHash: await hashPassword("password12"),
      firstName: "Jean",
      lastName: "Habimana",
      role: ROLES.TEACHER
    });

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "teacher@school.rw",
      password: "password12"
    });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe(ROLES.TEACHER);
  });

  it("rejects invalid credentials", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "nobody@example.com",
      password: "wrongpass"
    });
    expect(res.status).toBe(401);
  });

  it("requires auth for /me", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns the current user with a valid cookie", async () => {
    const agent = request.agent(app);
    await agent.post("/api/v1/auth/register").send({
      email: "seeker2@example.com",
      password: "password12",
      firstName: "Marie",
      lastName: "Mukamana"
    });
    const res = await agent.get("/api/v1/auth/me");
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe("seeker2@example.com");
  });
});
