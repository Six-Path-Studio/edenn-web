import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - players, creators, studios
  users: defineTable({
    name: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    locationFlag: v.optional(v.string()),
    role: v.union(v.literal("player"), v.literal("creator"), v.literal("studio")),
    socials: v.optional(v.object({
      tiktok: v.optional(v.string()),
      youtube: v.optional(v.string()),
      twitter: v.optional(v.string()),
      instagram: v.optional(v.string()),
      twitch: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      portfolio: v.optional(v.string()),
    })),
    tokenIdentifier: v.optional(v.string()),
    onboarded: v.optional(v.boolean()),
    createdAt: v.number(),
    notificationPreferences: v.optional(v.object({
      emailUpvotes: v.boolean(),
      emailMessages: v.boolean(),
      emailComments: v.boolean(),
      emailGifts: v.boolean(),
    })),
    // Upvotes for Profiles (Studios/Creators)
    upvotes: v.optional(v.number()),
    upvotedBy: v.optional(v.array(v.id("users"))),
    // Studio Snapshots
    snapshots: v.optional(v.array(v.object({
      url: v.string(),
      title: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    }))),
  })
    .index("by_email", ["email"])
    .index("by_token", ["tokenIdentifier"])
    .index("by_upvotes", ["upvotes"]),

  // Games table
  games: defineTable({
    title: v.string(),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    logoImage: v.optional(v.string()),
    trailerUrl: v.optional(v.string()),
    studioId: v.optional(v.id("users")),
    creatorId: v.id("users"),
    upvotes: v.number(),
    upvotedBy: v.array(v.id("users")),
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
    featured: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_creator", ["creatorId"])
    .index("by_studio", ["studioId"])
    .index("by_featured", ["featured"])
    .index("by_upvotes", ["upvotes"]),

  // Conversations table
  conversations: defineTable({
    participants: v.array(v.id("users")),
    lastMessage: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
    typing: v.optional(v.any()), // Map of userId -> timestamp
    createdAt: v.number(),
  })
    .index("by_participant", ["participants"]),

  // Messages table
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    text: v.string(),
    imageUrl: v.optional(v.id("_storage")),
    attachmentUrl: v.optional(v.id("_storage")),
    attachmentName: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId"]),

  // Notifications table
  notifications: defineTable({
    recipientId: v.id("users"),
    senderId: v.optional(v.id("users")), // Who triggered it
    type: v.union(v.literal("upvote"), v.literal("message"), v.literal("comment"), v.literal("gift"), v.literal("upload"), v.literal("follow"), v.literal("upvote_profile")),
    relatedId: v.optional(v.string()), // ID of game, message, etc.
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_recipient", ["recipientId"])
    .index("by_recipient_unread", ["recipientId", "read"]),

  // Follows table
  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_both", ["followerId", "followingId"]),
});
