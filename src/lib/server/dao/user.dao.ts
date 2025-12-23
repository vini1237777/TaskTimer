import { User } from "$lib/server/models/user.model";

export const userDao = {
  findByEmail: (email: string) => User.findOne({ email }),
  create: (email: string, passwordHash: string) =>
    User.create({ email, passwordHash }),
  findById: (id: string) => User.findById(id).lean(),
};
