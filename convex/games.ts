import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Helper to get image URL
const getImageUrl = async (ctx: any, storageId?: string) => {
  if (!storageId) return null;
  // If it's already a URL or local path, return it
  if (storageId.startsWith("http") || storageId.startsWith("/")) return storageId;
  
  try {
    // Otherwise try to get from storage
    return await ctx.storage.getUrl(storageId);
  } catch (error) {
    // Fallback if ID is invalid
    return null;
  }
};

// Get game by ID
export const getGame = query({
  args: { id: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.id);
    if (!game) return null;

    // Get creator and studio info
    let creator = game.creatorId ? await ctx.db.get(game.creatorId) : null;
    let studio = game.studioId ? await ctx.db.get(game.studioId) : null;

    // Resolve avatars if they exist
    if (creator && creator.avatar) {
      const avatarUrl = await getImageUrl(ctx, creator.avatar);
      creator = { ...creator, avatar: avatarUrl || creator.avatar };
    }

    if (studio && studio.avatar) {
      const avatarUrl = await getImageUrl(ctx, studio.avatar);
      studio = { ...studio, avatar: avatarUrl || studio.avatar };
    }

    // Get signed URLs for images
    const coverImageUrl = await getImageUrl(ctx, game.coverImage);
    const logoImageUrl = await getImageUrl(ctx, game.logoImage);
    const snapshotUrls = game.snapshots 
      ? await Promise.all(game.snapshots.map(id => getImageUrl(ctx, id)))
      : [];

    return {
      ...game,
      creator,
      studio,
      coverImage: coverImageUrl || game.coverImage,
      logoImage: logoImageUrl || game.logoImage,
      snapshots: snapshotUrls.filter((url): url is string => url !== null)
    };
  },
});

// Get featured games
export const getFeaturedGames = query({
  handler: async (ctx) => {
    const games = await ctx.db
      .query("games")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .take(10);

    // Enrich with creator/studio info and URLs
    return Promise.all(
      games.map(async (game) => {
        const creator = game.creatorId ? await ctx.db.get(game.creatorId) : null;
        const studio = game.studioId ? await ctx.db.get(game.studioId) : null;
        const coverImageUrl = await getImageUrl(ctx, game.coverImage);
        
        return { 
          ...game, 
          creator, 
          studio,
          coverImage: coverImageUrl || game.coverImage
        };
      })
    );
  },
});

// Get games by upvotes (top games)
export const getTopGames = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const games = await ctx.db
      .query("games")
      .withIndex("by_upvotes")
      .order("desc")
      .take(limit);

    return Promise.all(
      games.map(async (game) => {
        const coverImageUrl = await getImageUrl(ctx, game.coverImage);
        return { 
          ...game, 
          coverImage: coverImageUrl || game.coverImage
        };
      })
    );
  },
});

// Create game
export const createGame = mutation({
  args: {
    title: v.string(),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    logoImage: v.optional(v.string()),
    trailerUrl: v.optional(v.string()),
    creatorId: v.id("users"),
    studioId: v.optional(v.id("users")),
    location: v.optional(v.string()),
    locationFlag: v.optional(v.string()),
    socials: v.optional(v.object({
      tiktok: v.optional(v.string()),
      youtube: v.optional(v.string()),
      twitter: v.optional(v.string()),
      instagram: v.optional(v.string()),
      twitch: v.optional(v.string()),
    })),
    snapshots: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const gameId = await ctx.db.insert("games", {
      ...args,
      upvotes: 0,
      upvotedBy: [],
      featured: false,
      createdAt: Date.now(),
    });

    // Notify creator of successful upload
    await ctx.scheduler.runAfter(0, internal.notifications.triggerNotification, {
      recipientId: args.creatorId,
      type: "upload",
      relatedId: gameId,
    });

    return gameId;
  },
});

// Upvote game
export const upvoteGame = mutation({
  args: { 
    gameId: v.id("games"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    // Check if already upvoted
    if (game.upvotedBy.includes(args.userId)) {
      // Remove upvote
      await ctx.db.patch(args.gameId, {
        upvotes: game.upvotes - 1,
        upvotedBy: game.upvotedBy.filter((id) => id !== args.userId),
      });
    } else {
      // Add upvote
      await ctx.db.patch(args.gameId, {
        upvotes: game.upvotes + 1,
        upvotedBy: [...game.upvotedBy, args.userId],
      });

      // Notify creator (if not self)
      if (game.creatorId !== args.userId) {
        await ctx.scheduler.runAfter(0, internal.notifications.triggerNotification, {
          recipientId: game.creatorId,
          senderId: args.userId,
          type: "upvote",
          relatedId: game._id,
        });
      }
    }
  },
});

// Update game
export const updateGame = mutation({
  args: {
    id: v.id("games"),
    title: v.optional(v.string()),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    logoImage: v.optional(v.string()), // Added
    trailerUrl: v.optional(v.string()), // Added
    location: v.optional(v.string()), // Added
    locationFlag: v.optional(v.string()), // Added
    socials: v.optional(v.object({ // Added
      tiktok: v.optional(v.string()),
      youtube: v.optional(v.string()),
      twitter: v.optional(v.string()),
      instagram: v.optional(v.string()),
      twitch: v.optional(v.string()),
    })),
    snapshots: v.optional(v.array(v.string())),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    const game = await ctx.db.get(args.id);
    if (!game) throw new Error("Game not found");

    if (!user || user._id !== game.creatorId) {
       throw new Error("Unauthorized: You can only update your own games");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Get games by creator
export const getGamesByCreator = query({
  args: { creatorId: v.id("users") },
  handler: async (ctx, args) => {
    const games = await ctx.db
      .query("games")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .collect();

    // Enrich with creator info
    return Promise.all(
      games.map(async (game) => {
        const creator = await ctx.db.get(game.creatorId);
        const studio = game.studioId ? await ctx.db.get(game.studioId) : null;
        const coverImageUrl = await getImageUrl(ctx, game.coverImage);
        return { 
          ...game, 
          creator, 
          studio,
          coverImage: coverImageUrl || game.coverImage
        };
      })
    );
  },
});
