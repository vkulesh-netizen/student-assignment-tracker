import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app.js";
import User from "./models/User.js";
import Assignment from "./models/Assignment.js";
import { mkdir, mkdtemp } from "node:fs/promises";
import path from "node:path";
let memory;
try {
  let uri = process.env.MONGODB_URI;
  if (
    process.env.LOCAL_TEST_DB === "true" &&
    process.env.NODE_ENV !== "production"
  ) {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    await mkdir(".test-data", { recursive: true });
    const dbPath = await mkdtemp(path.resolve(".test-data", "preview-"));
    memory = await MongoMemoryServer.create({ instance: { dbPath } });
    uri = memory.getUri("studyline");
  }
  if (!uri) throw new Error("Set MONGODB_URI in your local .env file.");
  const production = process.env.NODE_ENV === "production";
  if (production && !process.env.APP_ORIGIN?.startsWith("https://"))
    throw new Error("Set APP_ORIGIN to your HTTPS application origin.");
  const app = createApp({
    jwtSecret: process.env.JWT_SECRET,
    production,
    appOrigin: process.env.APP_ORIGIN || "http://localhost:5173",
    trustProxy: process.env.TRUST_PROXY_HOPS
      ? Number(process.env.TRUST_PROXY_HOPS)
      : false,
  });
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  await Promise.all([User.init(), Assignment.init()]);
  const server = app.listen(
    Number(process.env.PORT) || 3001,
    process.env.HOST || (production ? "0.0.0.0" : "127.0.0.1"),
    () =>
      console.log("Studyline ready on port", Number(process.env.PORT) || 3001),
  );
  async function stop() {
    server.close(async () => {
      await mongoose.disconnect();
      await memory?.stop();
      process.exit(0);
    });
  }
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
} catch (error) {
  console.error(
    "Startup failed:",
    error.message.includes("MONGODB_URI") ||
      error.message.includes("JWT_SECRET") ||
      error.message.includes("APP_ORIGIN")
      ? error.message
      : error.name + ". Check database configuration and network access.",
  );
  await mongoose.disconnect();
  await memory?.stop();
  process.exitCode = 1;
}
