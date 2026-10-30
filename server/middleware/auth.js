import jwt from "jsonwebtoken";
import User from "../models/User.js";
export const cookieName = "studyline_session";
export function issueSession(res, user, config) {
  const token = jwt.sign({}, config.jwtSecret, {
    subject: String(user._id),
    expiresIn: "8h",
    algorithm: "HS256",
    issuer: "studyline",
  });
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: config.production,
    sameSite: "strict",
    maxAge: 8 * 3600 * 1000,
    path: "/",
  });
}
export function requireAuth(config) {
  return async (req, res, next) => {
    try {
      const payload = jwt.verify(
        req.cookies[cookieName] || "",
        config.jwtSecret,
        { algorithms: ["HS256"], issuer: "studyline" },
      );
      const user = await User.findById(payload.sub);
      if (!user)
        return res.status(401).json({ message: "Please sign in to continue." });
      req.user = user;
      next();
    } catch (error) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError" ||
        error.name === "NotBeforeError"
      )
        return res.status(401).json({ message: "Please sign in to continue." });
      next(error);
    }
  };
}
