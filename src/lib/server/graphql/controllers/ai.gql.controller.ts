import { suggestTaskWithAI } from "$lib/server/services/ai.task.service";

export const aiGqlController = {
  suggestTask: async (_: any, args: any, ctx: any) => {
    if (!ctx.user) throw new Error("UNAUTHORIZED");

    const input = String(args.input || "");
    const out = await suggestTaskWithAI(input);
    return out;
  },
};
