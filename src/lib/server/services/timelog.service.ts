import { connectMongo } from "$lib/server/db/mongo";
import { timelogDao } from "$lib/server/dao/timelog.dao";
import { taskDao } from "$lib/server/dao/task.dao";
import { ERR } from "./errors";

export const timelogService = {
  async start(userId: string, taskId: string) {
    if (!userId) throw ERR.unauth();
    if (!taskId) throw ERR.badInput("taskId is required");

    await connectMongo();

    const task = await taskDao.findByIdForUser(userId, taskId);
    if (!task) throw ERR.notFound();

    const active = await timelogDao.activeForTask(userId, taskId);
    if (active) throw ERR.conflict("ALREADY_RUNNING");

    const startedAt = new Date();
    const log = await timelogDao.create(userId, taskId, startedAt);

    await taskDao.updateForUser(userId, taskId, { status: "IN_PROGRESS" });

    return {
      id: log._id.toString(),
      taskId,
      startedAt: log.startedAt.toISOString(),
      endedAt: null,
      durationSec: 0,
    };
  },

  async stop(userId: string, taskId: string) {
    await connectMongo();

    const active = await timelogDao.activeForTask(userId, taskId);
    if (!active) throw ERR.badInput("NO_ACTIVE_TIMER");

    const endedAt = new Date();
    const startedAt = new Date(active.startedAt);

    const diffMs = endedAt.getTime() - startedAt.getTime();
    const durationSec = Math.max(1, Math.floor(diffMs / 1000));

    active.endedAt = endedAt;
    active.durationSec = durationSec;

    await timelogDao.save(active);

    return active;
  },
};
