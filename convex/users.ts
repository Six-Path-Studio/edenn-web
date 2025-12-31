import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// Get user by ID
export const getUser = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) return null;

    // Get followers count
    const followers = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", user._id))
      .collect();
    const followersCount = followers.length;

    let avatarUrl = user.avatar;
    if (user.avatar && !user.avatar.startsWith("http") && !user.avatar.startsWith("/")) {
      try {
        const url = await ctx.storage.getUrl(user.avatar as Id<"_storage">);
        if (url) avatarUrl = url;
      } catch (e) {}
    }

    let coverImageUrl = user.coverImage;
    if (user.coverImage && !user.coverImage.startsWith("http") && !user.coverImage.startsWith("/")) {
      try {
        const url = await ctx.storage.getUrl(user.coverImage as Id<"_storage">);
        if (url) coverImageUrl = url;
      } catch (e) {}
    }

    let snapshots = user.snapshots;
    if (snapshots && Array.isArray(snapshots)) {
        snapshots = await Promise.all(snapshots.map(async (s: any) => {
            if (s.url && !s.url.startsWith("http") && !s.url.startsWith("/")) {
                try {
                    const url = await ctx.storage.getUrl(s.url as Id<"_storage">);
                    return { ...s, url: url || s.url };
                } catch (e) {
                    return s;
                }
            }
            return s;
        }));
    }

    return { ...user, avatar: avatarUrl, coverImage: coverImageUrl, snapshots, followersCount };
  },
});

// Get user by token identifier (for auth)
export const getUserByToken = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (!user) return null;

    const followers = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", user._id))
      .collect();
    const followersCount = followers.length;

    let avatarUrl = user.avatar;
    if (user.avatar && !user.avatar.startsWith("http") && !user.avatar.startsWith("/")) {
      try {
        const url = await ctx.storage.getUrl(user.avatar as Id<"_storage">);
        if (url) avatarUrl = url;
      } catch (e) {}
    }

    let coverImageUrl = user.coverImage;
    if (user.coverImage && !user.coverImage.startsWith("http") && !user.coverImage.startsWith("/")) {
      try {
        const url = await ctx.storage.getUrl(user.coverImage as Id<"_storage">);
        if (url) coverImageUrl = url;
      } catch (e) {}
    }

    // Resolve snapshots for current user too
    let snapshots = user.snapshots;
    if (snapshots && Array.isArray(snapshots)) {
        snapshots = await Promise.all(snapshots.map(async (s: any) => {
            if (s.url && !s.url.startsWith("http") && !s.url.startsWith("/")) {
                try {
                    const url = await ctx.storage.getUrl(s.url as Id<"_storage">);
                    return { ...s, url: url || s.url };
                } catch (e) {
                    return s;
                }
            }
            return s;
        }));
    }

    return { ...user, avatar: avatarUrl, coverImage: coverImageUrl, snapshots, followersCount };
  },
});

// Helper to resolve user images
const resolveUserImages = async (ctx: any, user: any) => {
  let avatarUrl = user.avatar;
  if (user.avatar && !user.avatar.startsWith("http") && !user.avatar.startsWith("/")) {
    try {
      const url = await ctx.storage.getUrl(user.avatar as Id<"_storage">);
      if (url) avatarUrl = url;
    } catch (e) {}
  }

  let coverImageUrl = user.coverImage;
  if (user.coverImage && !user.coverImage.startsWith("http") && !user.coverImage.startsWith("/")) {
    try {
      const url = await ctx.storage.getUrl(user.coverImage as Id<"_storage">);
      if (url) coverImageUrl = url;
    } catch (e) {}
  }

  let snapshots = user.snapshots;
  if (snapshots && Array.isArray(snapshots)) {
      snapshots = await Promise.all(snapshots.map(async (s: any) => {
          if (s.url && !s.url.startsWith("http") && !s.url.startsWith("/")) {
              try {
                  const url = await ctx.storage.getUrl(s.url as Id<"_storage">);
                  return { ...s, url: url || s.url };
              } catch (e) {
                  return s;
              }
          }
          return s;
      }));
  }

  return { ...user, avatar: avatarUrl, coverImage: coverImageUrl, snapshots };
};

// Get all creators
export const getCreators = query({
  handler: async (ctx) => {
    // Fetch ALL users first
    const users = await ctx.db.query("users").collect();

    // Filter and sort in JS
    const creators = users
      .filter((u) => u.role === "creator")
      .sort((a, b) => b._creationTime - a._creationTime);

    return Promise.all(creators.map(user => resolveUserImages(ctx, user)));
  },
});

// Get all studios
export const getStudios = query({
  handler: async (ctx) => {
    // Fetch ALL users first to debug/ensure we get data
    const users = await ctx.db.query("users").collect();

    // Filter and sort in JS to be 100% sure
    const studios = users
      .filter((u) => u.role === "studio")
      .sort((a, b) => b._creationTime - a._creationTime);

    return Promise.all(studios.map(user => resolveUserImages(ctx, user)));
  },
});

// Get featured creators
export const getFeaturedCreators = query({
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "creator"))
      .take(10);
      
    return Promise.all(users.map(user => resolveUserImages(ctx, user)));
  },
});

// Get featured studios
export const getFeaturedStudios = query({
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "studio"))
      .take(10);

    return Promise.all(users.map(user => resolveUserImages(ctx, user)));
  },
});

// Get all users (for search/new chat)
export const getAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return Promise.all(users.map(user => resolveUserImages(ctx, user)));
  },
});

// Create or update user
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),
    role: v.union(v.literal("player"), v.literal("creator"), v.literal("studio")),
    tokenIdentifier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Update user profile
export const updateUser = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    locationFlag: v.optional(v.string()),
    avatar: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    role: v.optional(v.union(v.literal("player"), v.literal("creator"), v.literal("studio"))),
    socials: v.optional(v.object({
      tiktok: v.optional(v.string()),
      youtube: v.optional(v.string()),
      twitter: v.optional(v.string()),
      instagram: v.optional(v.string()),
      twitch: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      portfolio: v.optional(v.string()),
    })),
    onboarded: v.optional(v.boolean()),
    snapshots: v.optional(v.array(v.object({
      url: v.string(),
      title: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    }))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Mark user onboarding as complete
export const markOnboardingComplete = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { onboarded: true });

    // Send Welcome Email
    const user = await ctx.db.get(args.id);
    if (user && user.email) {
        await ctx.scheduler.runAfter(0, internal.emails.sendEmail, {
            to: user.email,
            subject: "Welcome to Edenn - Your Journey Begins",
            type: "welcome",
            data: {
                name: user.name || "Creator",
            }
        });
    }
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) return null;

    const followers = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", user._id))
      .collect();
    const followersCount = followers.length;

    // Resolve storage URLs if they look like storage IDs
    let avatarUrl = user.avatar;
    if (user.avatar && !user.avatar.startsWith("http") && !user.avatar.startsWith("/")) {
      try {
        const url = await ctx.storage.getUrl(user.avatar as Id<"_storage">);
        if (url) avatarUrl = url;
      } catch (e) {
        // Not a valid storage ID, keep original
      }
    }

    let coverImageUrl = user.coverImage;
    if (user.coverImage && !user.coverImage.startsWith("http") && !user.coverImage.startsWith("/")) {
      try {
        const url = await ctx.storage.getUrl(user.coverImage as Id<"_storage">);
        if (url) coverImageUrl = url;
      } catch (e) {
        // Not a valid storage ID, keep original
      }
    }

    return {
      ...user,
      avatar: avatarUrl,
      coverImage: coverImageUrl,
      followersCount,
      snapshots: user.snapshots ? await Promise.all(user.snapshots.map(async (s: any) => {
        if (s.url && !s.url.startsWith("http") && !s.url.startsWith("/")) {
            try {
                const url = await ctx.storage.getUrl(s.url as Id<"_storage">);
                return { ...s, url: url || s.url };
            } catch (e) {
                return s;
            }
        }
        return s;
      })) : undefined,
    };
  },
});

export const updateNotificationPreferences = mutation({
  args: {
    userId: v.id("users"),
    preferences: v.object({
      emailUpvotes: v.boolean(),
      emailMessages: v.boolean(),
      emailComments: v.boolean(),
      emailGifts: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      notificationPreferences: args.preferences,
    });
  },
});

export const toggleFollow = mutation({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (args.followerId === args.followingId) {
       throw new Error("Cannot follow yourself");
    }

    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) => q.eq("followerId", args.followerId).eq("followingId", args.followingId))
      .first();

    if (existingFollow) {
      // Unfollow
      await ctx.db.delete(existingFollow._id);
      return { following: false };
    } else {
      // Follow
      await ctx.db.insert("follows", {
        followerId: args.followerId,
        followingId: args.followingId,
        createdAt: Date.now(),
      });

      // Trigger Notification
      await ctx.scheduler.runAfter(0, internal.notifications.triggerNotification, {
        recipientId: args.followingId,
        senderId: args.followerId,
        type: "follow",
      });

      return { following: true };
    }
  },
});

export const isFollowing = query({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) => q.eq("followerId", args.followerId).eq("followingId", args.followingId))
      .first();
    return !!follow;
  },
});

export const toggleUpvoteProfile = mutation({
  args: {
    userId: v.id("users"), // The user doing the upvoting (or from auth)
    targetId: v.id("users"), // The profile being upvoted
  },
  handler: async (ctx, args) => {
    const targetUser = await ctx.db.get(args.targetId);
    if (!targetUser) throw new Error("User not found");

    const upvotedBy = targetUser.upvotedBy || [];
    const hasUpvoted = upvotedBy.includes(args.userId);

    let newUpvotedBy;
    let newUpvotes = targetUser.upvotes || 0;

    if (hasUpvoted) {
      newUpvotedBy = upvotedBy.filter((id) => id !== args.userId);
      newUpvotes = Math.max(0, newUpvotes - 1);
    } else {
      newUpvotedBy = [...upvotedBy, args.userId];
      newUpvotes = newUpvotes + 1;

        // Trigger Notification
        await ctx.scheduler.runAfter(0, internal.notifications.triggerNotification, {
            recipientId: args.targetId,
            senderId: args.userId,
            type: "upvote_profile",
        });
    }

    await ctx.db.patch(args.targetId, {
      upvotedBy: newUpvotedBy,
      upvotes: newUpvotes,
    });

    return { upvoted: !hasUpvoted, count: newUpvotes };
  },
});
