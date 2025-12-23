import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "crypto";
import { SESSION_SECRET } from "$env/static/private";
import { connectMongo } from "$lib/server/db/mongo";
import { userDao } from "$lib/server/dao/user.dao";
import { sessionDao } from "$lib/server/dao/session.dao";

const COOKIE_NAME = "sid";
const SESSION_DAYS = 7;

function hashToken(raw: string) {
  return createHash("sha256")
    .update(raw + SESSION_SECRET)
    .digest("hex");
}

export function setSessionCookie(cookies: any, rawToken: string) {
  cookies.set(COOKIE_NAME, rawToken, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
}

export function clearSessionCookie(cookies: any) {
  cookies.delete(COOKIE_NAME, { path: "/" });
}

export async function signup(email: string, password: string) {
  await connectMongo();

  const existing = await userDao.findByEmail(email);
  if (existing) throw new Error("EMAIL_EXISTS");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userDao.create(email, passwordHash);

  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await sessionDao.create(user._id.toString(), hashToken(rawToken), expiresAt);

  return { user: { id: user._id.toString(), email: user.email }, rawToken };
}

export async function login(email: string, password: string) {
  await connectMongo();

  const user = await userDao.findByEmail(email);
  if (!user) throw new Error("INVALID_CREDENTIALS");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("INVALID_CREDENTIALS");

  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await sessionDao.create(user._id.toString(), hashToken(rawToken), expiresAt);

  return { user: { id: user._id.toString(), email: user.email }, rawToken };
}

export async function getUserFromCookies(cookies: any) {
  await connectMongo();
  const raw = cookies.get(COOKIE_NAME);
  if (!raw) return null;

  const session = await sessionDao.findByTokenHash(hashToken(raw));
  if (!session) return null;

  const user = await userDao.findById(String(session.userId));
  if (!user) return null;

  return { id: String(user._id), email: user.email };
}
