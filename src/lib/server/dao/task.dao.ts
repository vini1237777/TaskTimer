import { Task } from "$lib/server/models/task.model";

export const taskDao = {
  listByUser: (userId: string) =>
    Task.find({ userId }).sort({ createdAt: -1 }).lean(),
  findByIdForUser: (userId: string, id: string) =>
    Task.findOne({ _id: id, userId }).lean(),
  findByUserAndIds: (userId: string, ids: string[]) =>
    Task.find({ userId, _id: { $in: ids } })
      .select({ _id: 1, title: 1 })
      .lean(),
  create: (userId: string, data: { title: string; description?: string }) =>
    Task.create({
      userId,
      title: data.title,
      description: data.description ?? "",
    }),
  updateForUser: (userId: string, id: string, update: any) =>
    Task.findOneAndUpdate(
      { _id: id, userId },
      { $set: update },
      { new: true }
    ).lean(),
  deleteForUser: (userId: string, id: string) =>
    Task.deleteOne({ _id: id, userId }),
};
