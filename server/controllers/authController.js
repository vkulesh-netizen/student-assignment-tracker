import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Assignment from "../models/Assignment.js";
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
export async function updateProfile(req, res) {
  const user = await User.findByIdAndUpdate(req.user._id, req.validated, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!user)
    return res.status(401).json({ message: "Please sign in to continue." });
  res.json({ user: publicUser(user) });
}

export const deleteAccount = (config) => async (req, res) => {
  const user = await User.findById(req.user._id).select("+passwordHash");
  if (
    !user ||
    !(await bcrypt.compare(req.validated.password, user.passwordHash))
  ) {
    return res.status(401).json({ message: "Password is incorrect." });
  }

  // Keep the account and its assignments consistent if either delete fails.
  await User.db.transaction(async (session) => {
    await User.deleteOne({ _id: user._id }, { session });
    await Assignment.deleteMany({ owner: user._id }, { session });
  });
  logout(config)(req, res);
};

export const logout = (config) => (req, res) => {
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: config.production,
    sameSite: "strict",
    path: "/",
  });
  res.status(204).end();
};
