import {
  COOKIE_NAME,
  SESSION_DAYS,
  signupUser,
  loginUser,
  revokeSession,
  getUserFromRawToken,
} from "$lib/server/services/auth.service";

export const authGqlController = {
  me: async (_: any, __: any, ctx: any) => ctx.user,

  signup: async (_: any, args: any, ctx: any) => {
    const email = String(args.email || "")
      .trim()
      .toLowerCase();
    const password = String(args.password || "");

    if (!email || password.length < 6) throw new Error("INVALID_INPUT");

    const { user, rawToken } = await signupUser(email, password);

    await ctx.cookieStore?.set({
      name: COOKIE_NAME,
      value: rawToken,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * SESSION_DAYS,
    });

    return { user };
  },

  login: async (_: any, args: any, ctx: any) => {
    const email = String(args.email || "")
      .trim()
      .toLowerCase();
    const password = String(args.password || "");

    if (!email || password.length < 6) throw new Error("INVALID_INPUT");

    const { user, rawToken } = await loginUser(email, password);

    await ctx.cookieStore?.set({
      name: COOKIE_NAME,
      value: rawToken,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * SESSION_DAYS,
    });

    return { user };
  },

  logout: async (_: any, __: any, ctx: any) => {
    const sid = await ctx.cookieStore?.get(COOKIE_NAME);
    const rawToken = sid?.value ?? null;

    await revokeSession(rawToken);
    await ctx.cookieStore?.delete({ name: COOKIE_NAME, path: "/" });

    return true;
  },
};
