import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const record = mutation({
  args: {
    gameId: v.string(),
    timestamp: v.string(),
    health: v.number(),
    delta: v.number(),
    cause: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('healthTimeline', args);
  },
});

export const getTimeline = query({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('healthTimeline')
      .withIndex('by_gameId', (q) => q.eq('gameId', args.gameId))
      .collect();
  },
});
