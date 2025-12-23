import { json } from "@sveltejs/kit";
import { connectMongo } from "$lib/server/db/mongo";
import { Task } from "$lib/server/models/task.model";

function requireUser(locals: any) {
  if (!locals.user) throw new Response("Unauthorized", { status: 401 });
  return locals.user as { id: string; email: string };
}

export async function GET({ locals }: { locals: any }) {
  const user = requireUser(locals);
  await connectMongo();

  const tasks = await Task.find({ userId: user.id })
    .sort({ createdAt: -1 })
    .lean();

  return json({ tasks });
}

export async function POST({
  request,
  locals,
}: {
  request: Request;
  locals: any;
}) {
  const user = requireUser(locals);
  const body = await request.json().catch(() => null);

  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) return json({ error: "INVALID_INPUT" }, { status: 400 });

  await connectMongo();
  const task = await Task.create({ userId: user.id, title });

  return json({
    task: { id: task._id.toString(), title: task.title, status: task.status },
  });
}
