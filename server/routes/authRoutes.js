import { Router } from "express";
import {
  register,
  login,
  me,
  logout,
  updateProfile,
  deleteAccount,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import {
  validate,
  registerSchema,
  loginSchema,
  profileSchema,
  deleteAccountSchema,
} from "../middleware/validate.js";
export default function authRoutes(config, limiter) {
  const r = Router();
  r.post("/register", limiter, validate(registerSchema), register(config));
  r.post("/login", limiter, validate(loginSchema), login(config));
  r.get("/me", requireAuth(config), me);
  r.patch("/me", requireAuth(config), validate(profileSchema), updateProfile);
  r.delete(
    "/me",
    limiter,
    requireAuth(config),
    validate(deleteAccountSchema),
    deleteAccount(config),
  );
  r.post("/logout", logout(config));
  return r;
}
