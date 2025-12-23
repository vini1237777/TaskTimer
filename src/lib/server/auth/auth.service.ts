import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "crypto";
import { SESSION_SECRET } from "$env/static/private";
import { connectMongo } from "$lib/server/db/mongo";
import { User } from "$lib/server/models/user.model";
import { Session } from "$lib/server/models/session.model";

const COOKIE_NAME = "sid";
const SESSION_DAYS = 7;

function tokenHash(raw: string) {
  return createHash("sha256")
    .update(raw + SESSION_SECRET)
    .digest("hex");
}

export function setSidCookie(cookies: any, raw: string) {
  cookies.set(COOKIE_NAME, raw, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
}

export function clearSidCookie(cookies: any) {
  cookies.delete(COOKIE_NAME, { path: "/" });
}

export async function signupUser(email: string, password: string) {
  await connectMongo();
  const existing = await User.findOne({ email }).lean();
  if (existing) throw new Error("EMAIL_EXISTS");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });

  return { id: user._id.toString(), email: user.email };
}

export async function loginUser(email: string, password: string) {
  await connectMongo();
  const user = await User.findOne({ email });
  if (!user) throw new Error("INVALID_CREDENTIALS");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("INVALID_CREDENTIALS");

  return { id: user._id.toString(), email: user.email };
}

export async function createSession(userId: string) {
  await connectMongo();
  const raw = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await Session.create({
    userId,
    tokenHash: tokenHash(raw),
    expiresAt,
  });

  return raw;
}

export async function revokeSession(cookies: any) {
  await connectMongo();
  const raw = cookies.get(COOKIE_NAME);
  if (!raw) return;

  await Session.deleteOne({ tokenHash: tokenHash(raw) });
  clearSidCookie(cookies);
}
