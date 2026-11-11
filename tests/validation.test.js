import { test } from "node:test";
import assert from "node:assert/strict";
import { profileSchema, updateSchema } from "../server/middleware/validate.js";

test("profile validation trims names and normalizes email addresses", () => {
  assert.deepEqual(
    profileSchema.parse({
      name: "  Demo Student  ",
      email: "DEMO@example.test",
    }),
    { name: "Demo Student", email: "demo@example.test" },
  );
});

test("profile validation rejects unsupported properties", () => {
  const profile = {
    name: "Demo Student",
    email: "demo@example.test",
    role: "admin",
  };
  assert.equal(profileSchema.safeParse(profile).success, false);
});

test("assignment updates reject nonexistent dates and empty changes", () => {
  assert.equal(
    updateSchema.safeParse({ dueDate: "2026-02-29" }).success,
    false,
  );
  assert.equal(updateSchema.safeParse({}).success, false);
  assert.deepEqual(updateSchema.parse({ status: "Completed" }), {
    status: "Completed",
  });
});
