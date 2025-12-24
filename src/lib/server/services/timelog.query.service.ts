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
    await connectMongo();

    const rows = await timelogDao.totalsByTask(userId);

    const map = new Map<string, number>();
    for (const r of rows) map.set(String(r._id), Number(r.total || 0));
    return map;
  },
  async active(userId: string) {
    if (!userId) throw ERR.unauth();
    await connectMongo();
    const rows = await timelogDao.active(userId);
    const map = new Map<string, string>();
    for (const r of rows)
      map.set(String(r._id), new Date(r.startedAt).toISOString());
    return map;
  },
};
