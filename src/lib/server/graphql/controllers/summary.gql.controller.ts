import { summaryService } from "$lib/server/services/summary.service";
import { requireAuth, mapServiceError } from "./errors";

export const summaryGqlController = {
  todaySummary: async (_: any, __: any, ctx: any) => {
    const user = requireAuth(ctx);
    try {
      return await summaryService.today(user.id);
    } catch (e) {
      mapServiceError(e);
    }
  },
};
