import { timelogService } from "$lib/server/services/timelog.service";
import { requireAuth, mapServiceError } from "./errors";
import { timelogQueryService } from "$lib/server/services/timelog.query.service";
import { taskDao } from "$lib/server/dao/task.dao";

export const timelogGqlController = {
  startTimer: async (_: any, args: any, ctx: any) => {
    const user = requireAuth(ctx);
    try {
      return await timelogService.start(user.id, args.taskId);
    } catch (e) {
      mapServiceError(e);
    }
  },
  timeLogs: async (_: any, args: any, ctx: any) => {
    const user = requireAuth(ctx);

    try {
      const logs = await timelogQueryService.list(user.id, args.taskId ?? null);

      const ids = Array.from(new Set(logs.map((l: any) => String(l.taskId))));
      const tasks = await taskDao.findByUserAndIds(user.id, ids);
      const titleMap = new Map<string, string>(
        tasks.map((t: any) => [String(t._id), String(t.title)])
      );

      return logs.map((l: any) => ({
        id: String(l._id),
        taskId: String(l.taskId),
        taskTitle: titleMap.get(String(l.taskId)) ?? "Unknown task",
        startedAt: new Date(l.startedAt).toISOString(),
        endedAt: l.endedAt ? new Date(l.endedAt).toISOString() : null,
        durationSec: Number(l.durationSec || 0),
      }));
    } catch (e) {
      mapServiceError(e);
    }
  },
  stopTimer: async (_: any, args: any, ctx: any) => {
    const user = requireAuth(ctx);
    try {
      return await timelogService.stop(user.id, args.taskId);
    } catch (e) {
      mapServiceError(e);
    }
  },
};
