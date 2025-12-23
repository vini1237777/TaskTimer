import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "crypto";

import { connectMongo } from "$lib/server/db/mongo";
import { userDao } from "$lib/server/dao/user.dao";
import { sessionDao } from "$lib/server/dao/session.dao";

export const COOKIE_NAME = "sid";
export const SESSION_DAYS = 7;

const SESSION_SECRET = process.env.SESSION_SECRET || "";

function tokenHash(raw: string) {
  return createHash("sha256")
    .update(raw + SESSION_SECRET)
    .digest("hex");
}

export async function signupUser(email: string, password: string) {
  await connectMongo();

  const existing = await userDao.findByEmail(email);
  if (existing) throw new Error("EMAIL_EXISTS");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userDao.create(email, passwordHash);

  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await sessionDao.create(user._id.toString(), tokenHash(rawToken), expiresAt);

  return { user: { id: user._id.toString(), email: user.email }, rawToken };
}

export async function loginUser(email: string, password: string) {
  await connectMongo();

  const user = await userDao.findByEmail(email);
  if (!user) throw new Error("INVALID_CREDENTIALS");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("INVALID_CREDENTIALS");

  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await sessionDao.create(user._id.toString(), tokenHash(rawToken), expiresAt);

  return { user: { id: user._id.toString(), email: user.email }, rawToken };
}

export async function getUserFromRawToken(rawToken: string | null) {
  if (!rawToken) return null;
  await connectMongo();

  const session = await sessionDao.findByTokenHash(tokenHash(rawToken));
  if (!session) return null;

  const user = await userDao.findById(String(session.userId));
  if (!user) return null;

  return { id: String(user._id), email: user.email };
}

export async function revokeSession(rawToken: string | null) {
  if (!rawToken) return;
  await connectMongo();
  await sessionDao.deleteByTokenHash(tokenHash(rawToken));
}
