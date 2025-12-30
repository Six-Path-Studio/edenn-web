import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Follow a user
export const followUser = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");

    // Check if already following
    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) => q.eq("followerId", user._id).eq("followingId", args.targetId))
      .first();

    if (existingFollow) return; // Already following

    await ctx.db.insert("follows", {
      followerId: user._id,
      followingId: args.targetId,
      createdAt: Date.now(),
    });
  },
});

// Unfollow a user
export const unfollowUser = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");

    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) => q.eq("followerId", user._id).eq("followingId", args.targetId))
      .first();

    if (existingFollow) {
      await ctx.db.delete(existingFollow._id);
    }
  },
});

// Check if following a specific user
export const isFollowing = query({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) return false;

    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) => q.eq("followerId", user._id).eq("followingId", args.targetId))
      .first();

    return !!existingFollow;
  },
});

// Get combined stats: followers count and follows count
export const getFollowStats = query({
  args: { userId: v.id("users") },

  handler: async (ctx, args) => {
    const followers = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", args.userId))
      .collect();

    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();

    return {
      followersCount: followers.length,
      followingCount: following.length,
    };
  },
});
