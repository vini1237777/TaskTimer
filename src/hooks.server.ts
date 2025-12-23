import type { Handle } from "@sveltejs/kit";
import {
  COOKIE_NAME,
  getUserFromRawToken,
} from "$lib/server/services/auth.service";

export const handle: Handle = async ({ event, resolve }) => {
  try {
    const sid = event.cookies.get(COOKIE_NAME);
    event.locals.user = await getUserFromRawToken(sid ?? null);
  } catch (e) {
    event.locals.user = null;
    console.error("HOOK AUTH ERROR:", e);
  }
  return resolve(event);
};
