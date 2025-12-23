import { TimeLog } from "$lib/server/models/timelog.model";

export const timelogDao = {
  activeForTask: (userId: string, taskId: string) =>
    TimeLog.findOne({ userId, taskId, endedAt: null }),
  create: (userId: string, taskId: string, startedAt: Date) =>
    TimeLog.create({
      userId,
      taskId,
      startedAt,
      endedAt: null,
      durationSec: 0,
    }),
  save: (doc: any) => doc.save(),
  listByUserAndDayUTC: (userId: string, start: Date, end: Date) =>
    TimeLog.find({ userId, startedAt: { $gte: start, $lt: end } }).lean(),
};
