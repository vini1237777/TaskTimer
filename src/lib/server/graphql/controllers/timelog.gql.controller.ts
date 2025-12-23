import { timelogService } from "$lib/server/services/timelog.service";
import { requireAuth, mapServiceError } from "./errors";

export const timelogGqlController = {
  startTimer: async (_: any, args: any, ctx: any) => {
    const user = requireAuth(ctx);
    try {
      return await timelogService.start(user.id, args.taskId);
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
