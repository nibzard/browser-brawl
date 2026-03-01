import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const record = mutation({
  args: {
    gameId: v.string(),
    eventType: v.string(),
    payloadJson: v.string(),
    timestamp: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('eventsLog', args);
  },
});

export const getForSession = query({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('eventsLog')
      .withIndex('by_gameId', (q) => q.eq('gameId', args.gameId))
      .collect();
  },
});
