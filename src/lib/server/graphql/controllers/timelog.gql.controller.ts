import { timelogService } from "$lib/server/services/timelog.service";
import { requireAuth, mapServiceError } from "./errors";
import { timelogQueryService } from "$lib/server/services/timelog.query.service";

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
      return logs.map((l: any) => ({
        id: String(l._id),
        taskId: String(l.taskId),
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
