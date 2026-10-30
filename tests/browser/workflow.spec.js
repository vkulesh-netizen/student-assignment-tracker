import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
test("register, create, edit, complete, filter, delete and sign out", async ({
  page,
}) => {
  await fs.mkdir("docs/screenshots", { recursive: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.screenshot({ path: "docs/screenshots/login.png", fullPage: true });
  await page.getByRole("button", { name: "Create an account" }).click();
  await page.getByLabel("Full name").fill("Demo Student");
  await page
    .getByLabel("Email address")
    .fill(`demo-${Date.now()}@example.test`);
  await page
    .getByLabel("Password", { exact: true })
    .fill("Studyline-test-password-229");
  await page.getByRole("button", { name: "Create account →" }).click();
  await expect(
    page.getByRole("heading", { name: "Your work, in focus." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "New assignment" }).click();
  await page.getByLabel("Assignment title").fill("API demonstration");
  await page.getByLabel("Course", { exact: true }).fill("COMP229");
  await page.getByLabel("Due date", { exact: true }).fill("2026-12-01");
  await page.screenshot({
    path: "docs/screenshots/editor.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Add assignment", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "API demonstration", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/dashboard.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "docs/screenshots/mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page
    .getByRole("button", { name: "Edit API demonstration", exact: true })
    .click();
  await page.getByLabel("Assignment title").fill("API testing complete");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("heading", { name: "API testing complete" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Complete API testing complete", exact: true })
    .click();
  await page
    .getByRole("button", { name: /Completed/ })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "API testing complete" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete API testing complete" })
    .click();
  await page
    .getByRole("button", { name: "Delete assignment", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "API testing complete" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
});
