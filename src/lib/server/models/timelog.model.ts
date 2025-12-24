import mongoose from "mongoose";

const TimeLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    startedAt: { type: Date, required: true, index: true },
    endedAt: { type: Date, default: null, index: true },
    durationSec: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

TimeLogSchema.index({ userId: 1, taskId: 1, startedAt: -1 });
TimeLogSchema.index({ userId: 1, endedAt: 1 });

export const TimeLog =
  mongoose.models.TimeLog || mongoose.model("TimeLog", TimeLogSchema);
