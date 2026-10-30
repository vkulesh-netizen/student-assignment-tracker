import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { cookieName, issueSession } from "../middleware/auth.js";
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });
export const register = (config) => async (req, res) => {
  const { name, email, password } = req.validated;
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  issueSession(res, user, config);
  res.status(201).json({ user: publicUser(user) });
};
export const login = (config) => async (req, res) => {
  const { email, password } = req.validated;
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(401).json({ message: "Email or password is incorrect." });
  issueSession(res, user, config);
  res.json({ user: publicUser(user) });
};
export function me(req, res) {
  res.json({ user: publicUser(req.user) });
}
export const logout = (config) => (req, res) => {
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: config.production,
    sameSite: "strict",
    path: "/",
  });
  res.status(204).end();
};
