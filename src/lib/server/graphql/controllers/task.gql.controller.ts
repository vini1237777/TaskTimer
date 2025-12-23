import { taskService } from "$lib/server/services/task.service";
import { requireAuth, mapServiceError } from "./errors";

export const taskGqlController = {
  tasks: async (_: any, __: any, ctx: any) => {
    const user = requireAuth(ctx);
    try {
      const tasks = await taskService.list(user.id);
      return tasks.map((t: any) => ({
        id: String(t._id),
        title: t.title,
        description: t.description ?? "",
        status: t.status,
      }));
    } catch (e) {
      mapServiceError(e);
    }
  },

  createTask: async (_: any, args: any, ctx: any) => {
    const user = requireAuth(ctx);
    try {
      const t = await taskService.create(user.id, args.input);
      return {
        id: t.id,
        title: t.title,
        description: t.description ?? "",
        status: t.status,
      };
    } catch (e) {
      mapServiceError(e);
    }
  },

  updateTask: async (_: any, args: any, ctx: any) => {
    const user = requireAuth(ctx);
    try {
      const task = await taskService.update(user.id, args.id, args);
      return {
        id: String(task.id),
        title: task.title,
        description: task.description ?? "",
        status: task.status,
      };
    } catch (e) {
      mapServiceError(e);
    }
  },

  deleteTask: async (_: any, args: any, ctx: any) => {
    const user = requireAuth(ctx);
    try {
      return await taskService.remove(user.id, args.id);
    } catch (e) {
      mapServiceError(e);
    }
  },
};
