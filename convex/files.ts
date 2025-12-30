import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate upload URL for client-side uploads
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Get file URL by storage ID
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Save uploaded file reference to a game
export const saveGameCoverImage = mutation({
  args: {
    gameId: v.id("games"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Failed to get file URL");
    await ctx.db.patch(args.gameId, {
      coverImage: url,
    });
    return url;
  },
});

// Save game logo image
export const saveGameLogoImage = mutation({
  args: {
    gameId: v.id("games"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Failed to get file URL");
    await ctx.db.patch(args.gameId, {
      logoImage: url,
    });
    return url;
  },
});

// Save game trailer video URL
export const saveGameTrailer = mutation({
  args: {
    gameId: v.id("games"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Failed to get file URL");
    await ctx.db.patch(args.gameId, {
      trailerUrl: url,
    });
    return url;
  },
});

// Save game snapshots (multiple images)
export const addGameSnapshot = mutation({
  args: {
    gameId: v.id("games"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Failed to get file URL");
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    const currentSnapshots = game.snapshots || [];
    await ctx.db.patch(args.gameId, {
      snapshots: [...currentSnapshots, url],
    });
    return url;
  },
});

// Save user avatar
export const saveUserAvatar = mutation({
  args: {
    userId: v.id("users"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Failed to get file URL");
    await ctx.db.patch(args.userId, {
      avatar: url,
    });
    return url;
  },
});

// Delete file from storage
export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
});
