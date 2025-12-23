export function requireAuth(ctx: any) {
  if (!ctx?.user) throw new Error("UNAUTHENTICATED");
  return ctx.user as { id: string; email: string };
}

export function mapServiceError(e: any) {
  const msg = e?.message || "SERVER_ERROR";
  throw new Error(msg);
}
