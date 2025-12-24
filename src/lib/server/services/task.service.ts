import { connectMongo } from "$lib/server/db/mongo";
import { taskDao } from "$lib/server/dao/task.dao";
import { ERR } from "./errors";
import { timelogDao } from "../dao/timelog.dao";

type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export const taskService = {
  async list(userId: string) {
    if (!userId) throw ERR.unauth();
    await connectMongo();
    return taskDao.listByUser(userId);
  },

  delete: async (userId: string, taskId: string) => {
    await timelogDao.deleteByUserAndTask(userId, taskId);

    const res = await taskDao.deleteForUser(userId, taskId);

    return res.deletedCount === 1;
  },

  async create(userId: string, input: string) {
    if (!userId) throw ERR.unauth();
    const title = (input || "").trim();
    if (!title) throw ERR.badInput("title is required");

    await connectMongo();
    const task = await taskDao.create(userId, { title, description: "" });

    return {
      id: task._id.toString(),
      title: task.title,
      description: task.description ?? "",
      status: task.status as TaskStatus,
    };
  },

  async update(
    userId: string,
    id: string,
    patch: { title?: string; description?: string; status?: string }
  ) {
    if (!userId) throw ERR.unauth();
    await connectMongo();

    const update: any = {};
    if (patch.title !== undefined) {
      const t = patch.title.trim();
      if (!t) throw ERR.badInput("TITLE_EMPTY");
      update.title = t;
    }
    if (patch.description !== undefined) {
      update.description = patch.description.trim();
    }
    if (patch.status !== undefined) update.status = patch.status;

    if (Object.keys(update).length === 0) throw ERR.badInput("NO_FIELDS");

    const updated = await taskDao.updateForUser(userId, id, update);
    if (!updated) throw ERR.notFound();
    return updated;
  },
  async remove(userId: string, id: string) {
    if (!userId) throw ERR.unauth();
    if (!id) throw ERR.badInput("id is required");

    await connectMongo();
    const res = await taskDao.deleteForUser(userId, id);
    if (res.deletedCount === 0) throw ERR.notFound();
    return true;
  },
};
