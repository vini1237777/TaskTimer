import { taskService } from "$lib/server/services/task.service";
import { requireAuth, mapServiceError } from "./errors";
import { timelogQueryService } from "$lib/server/services/timelog.query.service";

export const taskGqlController = {
  tasks: async (_: any, __: any, ctx: any) => {
    const user = requireAuth(ctx);

    try {
      const [tasks, totalsMap, activeMap] = await Promise.all([
        taskService.list(user.id),
        timelogQueryService.totals(user.id),
        timelogQueryService.active(user.id),
      ]);

      return tasks.map((t: any) => {
        const id = String(t._id);
        return {
          id,
          title: t.title,
          description: t.description ?? "",
          status: t.status,
          totalTrackedSec: totalsMap.get(id) ?? 0,
          activeStartedAt: activeMap.get(id) ?? null,
        };
      });
    } catch (e) {
      mapServiceError(e);
    }
  },

  createTask: async (_: any, args: any, ctx: any) => {
    const user = requireAuth(ctx);
    try {
      const t = await taskService.create(user.id, args.input);
      if (!args.input.trim()) throw new Error("TASK_EMPTY");
      if (args.input.length > 200) throw new Error("TASK_TOO_LONG");
      const [totalsMap, activeMap] = await Promise.all([
        timelogQueryService.totals(user.id),
        timelogQueryService.active(user.id),
      ]);
      return {
        id: String(t.id),
        title: t.title,
        description: t.description ?? "",
        status: t.status,
        totalTrackedSec: totalsMap.get(t.id) ?? 0,
        activeStartedAt: activeMap.get(t.id) ?? null,
      };
    } catch (e) {
      mapServiceError(e);
    }
  },

  updateTask: async (_: any, args: any, ctx: any) => {
    const user = requireAuth(ctx);
    try {
      const task = await taskService.update(user.id, args.id, {
        title: args.title,
        description: args.description,
        status: args.status,
      });

      const [totalsMap, activeMap] = await Promise.all([
        timelogQueryService.totals(user.id),
        timelogQueryService.active(user.id),
      ]);

      const id = String(task.id);

      return {
        id,
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        totalTrackedSec: totalsMap.get(id) ?? 0,
        activeStartedAt: activeMap.get(id) ?? null,
      };
    } catch (e) {
      mapServiceError(e);
    }
  },

  deleteTask: async (_: any, args: any, ctx: any) => {
    const user = requireAuth(ctx);
    try {
      return await taskService.delete(user.id, args.id);
    } catch (e) {
      mapServiceError(e);
    }
  },
};
