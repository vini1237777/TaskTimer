import { connectMongo } from "$lib/server/db/mongo";
import { timelogDao } from "$lib/server/dao/timelog.dao";
import { taskDao } from "$lib/server/dao/task.dao";
import { ERR } from "./errors";

function startOfTodayUTC() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)
  );
}
function endOfTodayUTC() {
  const s = startOfTodayUTC();
  return new Date(s.getTime() + 24 * 60 * 60 * 1000);
}

export const summaryService = {
  async today(userId: string) {
    if (!userId) throw ERR.unauth();
    await connectMongo();

    const start = startOfTodayUTC();
    const end = endOfTodayUTC();

    const logs = await timelogDao.listByUserAndDayUTC(userId, start, end);
    const totalSec = logs.reduce(
      (sum: number, l: any) => sum + (l.durationSec || 0),
      0
    );

    const tasks = await taskDao.listByUser(userId);
    const completed = tasks.filter((t: any) => t.status === "COMPLETED").length;
    const inProgress = tasks.filter(
      (t: any) => t.status === "IN_PROGRESS"
    ).length;
    const pending = tasks.filter((t: any) => t.status === "PENDING").length;

    const workedTaskIds = new Set(logs.map((l: any) => String(l.taskId)));
    const tasksWorkedOn = tasks
      .filter((t: any) => workedTaskIds.has(String(t._id)))
      .map((t: any) => ({
        id: String(t._id),
        title: t.title,
        description: t.description ?? "",
        status: t.status,
      }));

    return { totalSec, completed, inProgress, pending, tasksWorkedOn };
  },
};
