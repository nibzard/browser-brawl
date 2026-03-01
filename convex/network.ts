import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const record = mutation({
  args: {
    gameId: v.string(),
    timestamp: v.string(),
    method: v.string(),
    url: v.string(),
    status: v.optional(v.number()),
    resourceType: v.optional(v.string()),
    responseSize: v.optional(v.number()),
    stepRef: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('networkRequests', args);
  },
});

export const getForSession = query({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('networkRequests')
      .withIndex('by_gameId', (q) => q.eq('gameId', args.gameId))
      .collect();
  },
});
