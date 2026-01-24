import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Store user after OAuth sign in
export const storeUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    provider: v.string(),
    providerId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      // Update existing user
      const tokenIdentifier = args.provider === "google" 
        ? `https://accounts.google.com|${args.providerId}` 
        : `${args.provider}|${args.providerId}`;

      await ctx.db.patch(existingUser._id, {
        name: args.name,
        avatar: args.avatar,
        tokenIdentifier,
      });
      return existingUser._id;
    }

    // Create new user with normalized tokenIdentifier
    const tokenIdentifier = args.provider === "google" 
      ? `https://accounts.google.com|${args.providerId}` 
      : `${args.provider}|${args.providerId}`;

    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      avatar: args.avatar,
      role: "player", // Default role
      tokenIdentifier,
      createdAt: Date.now(),
    });
  },
});

// Get current user by token
export const getCurrentUser = query({
  args: { tokenIdentifier: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.tokenIdentifier) return null;
    
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();
  },
});

// Sign out - just for tracking, actual sign out is client-side
export const signOut = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Could log sign out, update last seen, etc.
    return true;
  },
});
