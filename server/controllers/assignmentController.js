import mongoose from "mongoose";
import Assignment from "../models/Assignment.js";
const filter = (req) => ({ _id: req.params.id, owner: req.user._id });
export function validId(req, res, next) {
  if (!mongoose.isObjectIdOrHexString(req.params.id))
    return res.status(400).json({ message: "Invalid assignment ID." });
  next();
}
export async function list(req, res) {
  res.json({
    assignments: await Assignment.find({ owner: req.user._id })
      .sort({ dueDate: 1, createdAt: -1 })
      .lean(),
  });
}
export async function create(req, res) {
  res
    .status(201)
    .json({
      assignment: await Assignment.create({
        ...req.validated,
        owner: req.user._id,
      }),
    });
}
export async function read(req, res) {
  const assignment = await Assignment.findOne(filter(req));
  if (!assignment)
    return res.status(404).json({ message: "Assignment not found." });
  res.json({ assignment });
}
export async function update(req, res) {
  const assignment = await Assignment.findOneAndUpdate(
    filter(req),
    { $set: req.validated },
    { returnDocument: "after", runValidators: true },
  );
  if (!assignment)
    return res.status(404).json({ message: "Assignment not found." });
  res.json({ assignment });
}
export async function remove(req, res) {
  const assignment = await Assignment.findOneAndDelete(filter(req));
  if (!assignment)
    return res.status(404).json({ message: "Assignment not found." });
  res.status(204).end();
}
