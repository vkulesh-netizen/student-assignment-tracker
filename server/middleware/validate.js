import { z } from "zod";
export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z
      .email()
      .max(254)
      .transform((s) => s.toLowerCase()),
    password: z
      .string()
      .min(12)
      .max(72)
      .refine(
        (s) => Buffer.byteLength(s, "utf8") <= 72,
        "Password must be at most 72 UTF-8 bytes.",
      ),
  })
  .strict();
export const loginSchema = z
  .object({
    email: z
      .email()
      .max(254)
      .transform((s) => s.toLowerCase()),
    password: z.string().min(1).max(72),
  })
  .strict();
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((s) => {
    const d = new Date(s + "T00:00:00Z");
    return !isNaN(d) && d.toISOString().slice(0, 10) === s;
  }, "Enter a valid date.");
export const assignmentSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    course: z.string().trim().min(1).max(60),
    description: z.string().max(2000).default(""),
    dueDate: date,
    status: z.enum(["To Do", "In Progress", "Completed"]).default("To Do"),
    priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
  })
  .strict();
export const updateSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    course: z.string().trim().min(1).max(60).optional(),
    description: z.string().max(2000).optional(),
    dueDate: date.optional(),
    status: z.enum(["To Do", "In Progress", "Completed"]).optional(),
    priority: z.enum(["Low", "Medium", "High"]).optional(),
  })
  .strict()
  .refine((o) => Object.keys(o).length > 0, "Provide at least one field.");
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success)
      return res
        .status(400)
        .json({
          message: result.error.issues
            .map((i) => `${i.path.join(".") || "Request"}: ${i.message}`)
            .join(" "),
        });
    req.validated = result.data;
    next();
  };
}
