import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    course: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, default: "", maxlength: 2000 },
    dueDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Completed"],
      default: "To Do",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
  },
  { timestamps: true },
);
schema.index({ owner: 1, dueDate: 1 });
export default mongoose.model("Assignment", schema);
