import { Router } from "express";
import * as controller from "../controllers/assignmentController.js";
import { requireAuth } from "../middleware/auth.js";
import {
  validate,
  assignmentSchema,
  updateSchema,
} from "../middleware/validate.js";
export default function assignmentRoutes(config) {
  const r = Router();
  r.use(requireAuth(config));
  r.route("/")
    .get(controller.list)
    .post(validate(assignmentSchema), controller.create);
  r.route("/:id")
    .all(controller.validId)
    .get(controller.read)
    .patch(validate(updateSchema), controller.update)
    .delete(controller.remove);
  return r;
}
