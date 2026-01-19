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

    const { tokenIdentifier, email, notificationPreferences, ...safeUser } = user;
    return { ...safeUser, avatar: avatarUrl, coverImage: coverImageUrl, snapshots, followersCount };
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

    const { tokenIdentifier, email, notificationPreferences, ...safeUser } = user;
    return { ...safeUser, avatar: avatarUrl, coverImage: coverImageUrl, snapshots, followersCount };
  },
});

// Helper to resolve user images and sanitize data
const resolvePublicUser = async (ctx: any, user: any) => {
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

  // Sanitization: Exclude sensitive fields
  const { tokenIdentifier, email, notificationPreferences, ...publicData } = user;
  
  return { ...publicData, avatar: avatarUrl, coverImage: coverImageUrl, snapshots };
};

// Get all creators
export const getCreators = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const creators = users
      .filter((u) => u.role === "creator")
      .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));

    return Promise.all(creators.map(user => resolvePublicUser(ctx, user)));
  },
});

// Get all studios
export const getStudios = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const studios = users
      .filter((u) => u.role === "studio")
      .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));

    return Promise.all(studios.map(user => resolvePublicUser(ctx, user)));
  },
});

// Get featured creators (top 3 by upvotes)
export const getFeaturedCreators = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const creators = users
      .filter((u) => u.role === "creator")
      .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
      .slice(0, 3);
      
    return Promise.all(creators.map(user => resolvePublicUser(ctx, user)));
  },
});

// Get featured studios (top 3 by upvotes)
export const getFeaturedStudios = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const studios = users
      .filter((u) => u.role === "studio")
      .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
      .slice(0, 3);

    return Promise.all(studios.map(user => resolvePublicUser(ctx, user)));
  },
});

// Get all users (for search/new chat)
export const getAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return Promise.all(users.map(user => resolvePublicUser(ctx, user)));
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
    // SECURITY: This mutation is deprecated/insecure. Use api.auth.storeUser or strictly server-side logic.
    throw new Error("This mutation is deprecated. Please use the appropriate auth flow.");
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user || user._id !== args.id) {
       throw new Error("Unauthorized: You can only update your own profile");
    }

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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const authenticatedUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!authenticatedUser || authenticatedUser.email !== args.email) {
       throw new Error("Unauthorized: You can only fetch your own profile by email.");
    }

    // Use the authenticated user as the target user
    const user = authenticatedUser;

    if (!user) return null; // Should not happen if authenticatedUser is found

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
    // userId derived from auth
    preferences: v.object({
      emailUpvotes: v.boolean(),
      emailMessages: v.boolean(),
      emailComments: v.boolean(),
      emailGifts: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      notificationPreferences: args.preferences,
    });
  },
});

export const toggleFollow = mutation({
  args: {
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");
    const followerId = user._id;

    if (followerId === args.followingId) {
       throw new Error("Cannot follow yourself");
    }

    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) => q.eq("followerId", followerId).eq("followingId", args.followingId))
      .first();

    if (existingFollow) {
      // Unfollow
      await ctx.db.delete(existingFollow._id);
      return { following: false };
    } else {
      // Follow
      await ctx.db.insert("follows", {
        followerId: followerId,
        followingId: args.followingId,
        createdAt: Date.now(),
      });

      // Trigger Notification
      await ctx.scheduler.runAfter(0, internal.notifications.triggerNotification, {
        recipientId: args.followingId,
        senderId: followerId,
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
    targetId: v.id("users"), // The profile being upvoted
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");
    const userId = user._id;

    const targetUser = await ctx.db.get(args.targetId);
    if (!targetUser) throw new Error("User not found");

    const upvotedBy = targetUser.upvotedBy || [];
    const hasUpvoted = upvotedBy.includes(userId);

    let newUpvotedBy;
    let newUpvotes = targetUser.upvotes || 0;

    if (hasUpvoted) {
      newUpvotedBy = upvotedBy.filter((id) => id !== userId);
      newUpvotes = Math.max(0, newUpvotes - 1);
    } else {
      newUpvotedBy = [...upvotedBy, userId];
      newUpvotes = newUpvotes + 1;

        // Trigger Notification
        await ctx.scheduler.runAfter(0, internal.notifications.triggerNotification, {
            recipientId: args.targetId,
            senderId: userId,
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
