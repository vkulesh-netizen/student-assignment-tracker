import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import authRoutes from "./routes/authRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
export function createApp(config) {
  if (!config.jwtSecret || config.jwtSecret.length < 32)
    throw new Error("JWT_SECRET must contain at least 32 characters.");
  const app = express();
  app.disable("x-powered-by");
  if (config.trustProxy) app.set("trust proxy", config.trustProxy);
  app.use(helmet());
  app.use(express.json({ limit: "16kb" }));
  app.use(cookieParser());
  app.use("/api", (req, res, next) => {
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      const origin = req.get("origin");
      if (
        (origin && origin !== config.appOrigin) ||
        req.get("sec-fetch-site") === "cross-site"
      )
        return res
          .status(403)
          .json({ message: "Request origin is not allowed." });
      // A custom header prevents cross-site simple form requests when cookies authenticate APIs.
      if (req.get("x-requested-with") !== "Studyline")
        return res.status(403).json({ message: "Missing request header." });
    }
    next();
  });
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: config.authLimit || 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many sign-in attempts. Try again later." },
  });
  app.get("/api/health", (req, res) =>
    res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
      status: mongoose.connection.readyState === 1 ? "ok" : "unavailable",
    }),
  );
  app.use("/api/auth", authRoutes(config, limiter));
  app.use("/api/assignments", assignmentRoutes(config));
  app.use("/api", (req, res) =>
    res.status(404).json({ message: "API endpoint not found." }),
  );
  const dist = fileURLToPath(new URL("../dist", import.meta.url));
  if (fs.existsSync(dist)) {
    app.use(
      "/assets",
      express.static(path.join(dist, "assets"), {
        immutable: true,
        maxAge: "1y",
      }),
    );
    app.use(
      express.static(dist, {
        setHeaders: (res, file) => {
          if (path.extname(file) === ".html")
            res.set("Cache-Control", "no-cache");
        },
      }),
    );
    app.get("/{*path}", (req, res) =>
      res.set("Cache-Control", "no-cache").sendFile(path.join(dist, "index.html")),
    );
  }
  app.use((error, req, res, next) => {
    if (error.code === 11000)
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    if (error.type === "entity.too.large")
      return res.status(413).json({ message: "Request is too large." });
    if (error instanceof SyntaxError && error.status === 400)
      return res.status(400).json({ message: "Invalid JSON body." });
    if (error.name === "ValidationError" || error.name === "CastError")
      return res.status(400).json({ message: "Please check your input." });
    if (config.logErrors !== false) console.error(error.name, "Request failed");
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  });
  return app;
}

