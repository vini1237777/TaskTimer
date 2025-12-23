import { redirect } from "@sveltejs/kit";

export function load({ locals }: { locals: any }) {
  if (locals.user) throw redirect(302, "/app/tasks");
  throw redirect(302, "/auth/login");
}
