import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import request from "supertest";
import { createApp } from "../server/app.js";
import User from "../server/models/User.js";
import Assignment from "../server/models/Assignment.js";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
let mongo, app, dbPath;
const header = { "X-Requested-With": "Studyline" };
const account = {
  name: "Test Student",
  email: "student@example.test",
  password: "A-long-test-password-229",
};
const assignment = {
  title: "Project Part 1",
  course: "COMP229",
  dueDate: "2026-11-15",
  description: "Build backend",
  priority: "High",
};
const signup = (agent, data = account) =>
  agent.post("/api/auth/register").set(header).send(data);
before(async () => {
  await mkdir(".test-data", { recursive: true });
  dbPath = await mkdtemp(path.resolve(".test-data", "api-"));
  mongo = await MongoMemoryReplSet.create({
    instanceOpts: [{ dbPath }],
    replSet: { count: 1 },
  });
  await mongoose.connect(mongo.getUri());
  await User.init();
  await Assignment.init();
  app = createApp({
    jwtSecret: "test-only-secret-with-at-least-32-characters",
    production: false,
    appOrigin: "http://localhost:5173",
    authLimit: 1000,
    logErrors: false,
  });
});
after(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
  if (dbPath && dbPath.startsWith(path.resolve(".test-data") + path.sep))
    await rm(dbPath, { recursive: true, force: true });
});
beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Assignment.deleteMany({})]);
});
test("register creates hashed password and HttpOnly session; login and logout work", async () => {
  const agent = request.agent(app);
  const r = await signup(agent);
  assert.equal(r.status, 201);
  assert.equal(r.body.user.email, account.email);
  assert.equal(r.body.user.passwordHash, undefined);
  assert.match(r.headers["set-cookie"][0], /HttpOnly/);
  assert.match(r.headers["set-cookie"][0], /SameSite=Strict/);
  const stored = await User.findOne().select("+passwordHash");
  assert.notEqual(stored.passwordHash, account.password);
  assert.equal((await agent.get("/api/auth/me")).status, 200);
  assert.equal((await agent.post("/api/auth/logout").set(header)).status, 204);
  assert.equal((await agent.get("/api/auth/me")).status, 401);
  assert.equal(
    (
      await agent
        .post("/api/auth/login")
        .set(header)
        .send({ email: account.email, password: account.password })
    ).status,
    200,
  );
});
test("invalid registration, duplicate normalized emails, and wrong password rejected", async () => {
  const agent = request.agent(app);
  assert.equal(
    (await signup(agent, { ...account, password: "short" })).status,
    400,
  );
  assert.equal(
    (await signup(agent, { ...account, email: "not-email" })).status,
    400,
  );
  await signup(agent);
  assert.equal(
    (await signup(agent, { ...account, email: account.email.toUpperCase() }))
      .status,
    409,
  );
  assert.equal(
    (
      await request(app)
        .post("/api/auth/login")
        .set(header)
        .send({ email: account.email, password: "wrong-password" })
    ).status,
    401,
  );
});
test("complete assignment lifecycle persists fields and partial status update preserves defaults", async () => {
  const agent = request.agent(app);
  await signup(agent);
  const created = await agent
    .post("/api/assignments")
    .set(header)
    .send(assignment);
  assert.equal(created.status, 201);
  const id = created.body.assignment._id;
  assert.equal(created.body.assignment.status, "To Do");
  assert.equal(
    (await agent.get("/api/assignments")).body.assignments.length,
    1,
  );
  assert.equal(
    (await agent.get("/api/assignments/" + id)).body.assignment.title,
    assignment.title,
  );
  const patch = await agent
    .patch("/api/assignments/" + id)
    .set(header)
    .send({ status: "Completed" });
  assert.equal(patch.status, 200);
  assert.equal(patch.body.assignment.status, "Completed");
  assert.equal(patch.body.assignment.priority, "High");
  assert.equal(patch.body.assignment.description, "Build backend");
  assert.equal(
    (await agent.delete("/api/assignments/" + id).set(header)).status,
    204,
  );
  assert.equal((await agent.get("/api/assignments/" + id)).status, 404);
});
test("users cannot list, read, edit or delete another user’s records", async () => {
  const alice = request.agent(app),
    bob = request.agent(app);
  await signup(alice);
  await signup(bob, { ...account, email: "bob@example.test" });
  const r = await alice.post("/api/assignments").set(header).send(assignment);
  const id = r.body.assignment._id;
  assert.equal((await bob.get("/api/assignments")).body.assignments.length, 0);
  assert.equal((await bob.get("/api/assignments/" + id)).status, 404);
  assert.equal(
    (
      await bob
        .patch("/api/assignments/" + id)
        .set(header)
        .send({ title: "Stolen" })
    ).status,
    404,
  );
  assert.equal(
    (await bob.delete("/api/assignments/" + id).set(header)).status,
    404,
  );
  assert.equal(
    (await alice.get("/api/assignments/" + id)).body.assignment.title,
    assignment.title,
  );
});
test("unauthenticated and forged sessions are rejected", async () => {
  assert.equal((await request(app).get("/api/assignments")).status, 401);
  assert.equal(
    (
      await request(app)
        .get("/api/assignments")
        .set("Cookie", "studyline_session=forged")
    ).status,
    401,
  );
  assert.equal(
    (await request(app).post("/api/assignments").set(header).send(assignment))
      .status,
    401,
  );
});
test("validates dates, enums, object IDs and rejects ownership injection", async () => {
  const agent = request.agent(app);
  await signup(agent);
  for (const value of [
    { dueDate: "2026-02-30" },
    { status: "Unknown" },
    { title: " " },
    { owner: "507f1f77bcf86cd799439011" },
    { course: { $ne: null } },
  ])
    assert.equal(
      (
        await agent
          .post("/api/assignments")
          .set(header)
          .send({ ...assignment, ...value })
      ).status,
      400,
    );
  assert.equal((await agent.get("/api/assignments/bad-id")).status, 400);
  const created = await agent
    .post("/api/assignments")
    .set(header)
    .send(assignment);
  assert.equal(
    (
      await agent
        .patch("/api/assignments/" + created.body.assignment._id)
        .set(header)
        .send({})
    ).status,
    400,
  );
});
test("CSRF defenses reject cross-origin and simple-form writes", async () => {
  assert.equal(
    (await request(app).post("/api/auth/register").send(account)).status,
    403,
  );
  assert.equal(
    (
      await request(app)
        .post("/api/auth/register")
        .set(header)
        .set("Origin", "https://evil.example")
        .send(account)
    ).status,
    403,
  );
  assert.equal(
    (
      await request(app)
        .post("/api/auth/register")
        .set(header)
        .set("Sec-Fetch-Site", "cross-site")
        .send(account)
    ).status,
    403,
  );
});
test("rate limits authentication attempts", async () => {
  const limited = createApp({
    jwtSecret: "test-only-secret-with-at-least-32-characters",
    production: false,
    appOrigin: "http://localhost:5173",
    authLimit: 2,
    logErrors: false,
  });
  for (let i = 0; i < 2; i++)
    assert.equal(
      (
        await request(limited)
          .post("/api/auth/login")
          .set(header)
          .send({ email: account.email, password: "wrong" })
      ).status,
      401,
    );
  assert.equal(
    (
      await request(limited)
        .post("/api/auth/login")
        .set(header)
        .send({ email: account.email, password: "wrong" })
    ).status,
    429,
  );
});

test("account owner can edit and delete their profile and assignments", async () => {
  const agent = request.agent(app);
  const other = request.agent(app);
  assert.equal((await signup(agent)).status, 201);
  assert.equal(
    (await signup(other, { ...account, email: "other@example.test" })).status,
    201,
  );
  assert.equal(
    (await agent.post("/api/assignments").set(header).send(assignment)).status,
    201,
  );
  assert.equal(
    (await other.post("/api/assignments").set(header).send(assignment)).status,
    201,
  );

  const profile = { name: "Updated Student", email: "updated@example.test" };
  const updated = await agent.patch("/api/auth/me").set(header).send(profile);
  assert.equal(updated.status, 200);
  assert.equal(updated.body.user.name, profile.name);
  assert.equal(
    (await agent.get("/api/auth/me")).body.user.email,
    profile.email,
  );
  assert.equal(
    (
      await agent
        .patch("/api/auth/me")
        .set(header)
        .send({ ...profile, email: "other@example.test" })
    ).status,
    409,
  );

  assert.equal(
    (
      await agent
        .delete("/api/auth/me")
        .set(header)
        .send({ password: "incorrect-password" })
    ).status,
    401,
  );
  assert.equal((await agent.get("/api/auth/me")).status, 200);
  assert.equal(
    (
      await agent
        .delete("/api/auth/me")
        .set(header)
        .send({ password: account.password })
    ).status,
    204,
  );
  assert.equal((await agent.get("/api/auth/me")).status, 401);
  assert.equal(await User.exists({ email: profile.email }), null);
  assert.equal(
    await Assignment.countDocuments({ owner: updated.body.user.id }),
    0,
  );
  assert.equal(
    (await other.get("/api/assignments")).body.assignments.length,
    1,
  );
});
