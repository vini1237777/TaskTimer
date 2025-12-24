import { TimeLog } from "$lib/server/models/timelog.model";
import mongoose from "mongoose";

function oid(id: string) {
  return new mongoose.Types.ObjectId(id);
}

export const timelogDao = {
  activeForTask: (userId: string, taskId: string) =>
    TimeLog.findOne({ userId, taskId, endedAt: null }),

  activeByUser: (userId: string) =>
    TimeLog.find({ userId, endedAt: null }).lean(),

  active: (userId: string) =>
    TimeLog.aggregate([
      {
        $match: {
          userId: oid(userId),
          endedAt: null,
        },
      },
      { $group: { _id: "$taskId", startedAt: { $min: "$startedAt" } } },
    ]),

  create: (userId: string, taskId: string, startedAt: Date) =>
    TimeLog.create({
      userId,
      taskId,
      startedAt,
      endedAt: null,
      durationSec: 0,
    }),

  deleteByUserAndTask: (userId: string, taskId: string) =>
    TimeLog.deleteMany({ userId, taskId }),

  save: (doc: any) => doc.save(),
  listByUserAndTask: (userId: string, taskId?: string | null) => {
    const q: any = { userId };
    if (taskId) q.taskId = taskId;
    return TimeLog.find(q).sort({ startedAt: -1 }).limit(200).lean();
  },

  listByUserAndDayUTC: (userId: string, start: Date, end: Date) =>
    TimeLog.find({ userId, startedAt: { $gte: start, $lt: end } })
      .sort({ startedAt: -1 })
      .lean(),

  totalsByTask: (userId: string) =>
    TimeLog.aggregate([
      {
        $match: {
          userId: oid(userId),
          endedAt: { $ne: null },
          durationSec: { $gt: 0 },
        },
      },
      { $group: { _id: "$taskId", total: { $sum: "$durationSec" } } },
    ]),
};
