import { connectMongo } from "$lib/server/db/mongo";
import { timelogDao } from "$lib/server/dao/timelog.dao";
import { ERR } from "./errors";

export const timelogQueryService = {
  async list(userId: string, taskId?: string | null) {
    if (!userId) throw ERR.unauth();
    await connectMongo();
    return timelogDao.listByUserAndTask(userId, taskId ?? null);
  },

  async totals(userId: string) {
    if (!userId) throw ERR.unauth();
    await connectMongo();
    const rows = await timelogDao.totalsByTask(userId);
    const map = new Map<string, number>();
    for (const r of rows) map.set(String(r._id), Number(r.totalSec || 0));
    return map;
  },

  async active(userId: string) {
    if (!userId) throw ERR.unauth();
    await connectMongo();
    const logs = await timelogDao.activeByUser(userId);
    const map = new Map<string, string>();
    for (const l of logs)
      map.set(String(l.taskId), new Date(l.startedAt).toISOString());
    return map;
  },
};
