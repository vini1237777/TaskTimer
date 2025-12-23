import { Session } from "$lib/server/models/session.model";

export const sessionDao = {
  create: (userId: string, tokenHash: string, expiresAt: Date) =>
    Session.create({ userId, tokenHash, expiresAt }),
  findByTokenHash: (tokenHash: string) =>
    Session.findOne({ tokenHash, expiresAt: { $gt: new Date() } }).lean(),
  deleteByTokenHash: (tokenHash: string) => Session.deleteOne({ tokenHash }),
};
