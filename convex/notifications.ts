import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// ... (getNotifications and markAllAsRead remain)

export const triggerNotification = internalMutation({
  args: {
    recipientId: v.id("users"),
    senderId: v.optional(v.id("users")),
    type: v.union(v.literal("upvote"), v.literal("message"), v.literal("comment"), v.literal("gift"), v.literal("upload"), v.literal("follow"), v.literal("upvote_profile")), // Added 'upvote_profile'
    relatedId: v.optional(v.string()), // ID of game, message, etc.
  },
  handler: async (ctx, args) => {
    // 0. Email Debounce Check (BEFORE Insertion)
    let shouldDebounceEmail = false;
    if (args.type === "message" && args.senderId) {
        const lastMessage = await ctx.db
            .query("notifications")
            .withIndex("by_recipient", (q) => q.eq("recipientId", args.recipientId))
            .filter((q) => q.and(q.eq(q.field("type"), "message"), q.eq(q.field("senderId"), args.senderId)))
            .order("desc")
            .first();

        if (lastMessage && (Date.now() - lastMessage.createdAt < 15 * 60 * 1000)) {
             shouldDebounceEmail = true;
        }
    }

    // 1. Insert DB Notification
    await ctx.db.insert("notifications", {
        recipientId: args.recipientId,
        senderId: args.senderId,
        type: args.type as any, // Cast to match schema strict union if needed
        read: false,
        createdAt: Date.now(),
        relatedId: args.relatedId
    });

    // 2. Check Email Preferences
    const recipient = await ctx.db.get(args.recipientId);
    if (!recipient || !recipient.email) return;

    const prefs = recipient.notificationPreferences || {
        emailUpvotes: true,
        emailMessages: true,
        emailComments: true,
        emailGifts: true,
        // emailFollows (implicit true or missing for now, lets assume true or add to schema later)
    };

    let shouldSendEmail = false;
    let subject = "New Notification on Edenn";
    let senderName = "Someone";

    if (args.senderId) {
        const sender = await ctx.db.get(args.senderId);
        if (sender) senderName = sender.name;
    }

    // Logic for email triggering
    switch (args.type) {
        case "upvote":
            if (prefs.emailUpvotes) {
                shouldSendEmail = true;
                subject = `${senderName} upvoted your game`;
            }
            break;
        case "upvote_profile":
             if (prefs.emailUpvotes) {
                 shouldSendEmail = true;
                 subject = `${senderName} upvoted your profile`;
             }
             break;
        case "message":
            if (prefs.emailMessages && !shouldDebounceEmail) {
                shouldSendEmail = true;
                subject = `New message from ${senderName}`;
            }
            break;
        case "comment":
            if (prefs.emailComments) {
                shouldSendEmail = true;
                subject = `${senderName} commented on your game`;
            }
            break;
        // Follows/Uploads: enable by default or add logic
        case "upload":
             shouldSendEmail = true;
             subject = "Your game has been uploaded!";
             break;
        case "follow":
             shouldSendEmail = true;
             subject = `${senderName} followed you`;
             break;
    }

    if (shouldSendEmail) {
        await ctx.scheduler.runAfter(0, internal.emails.sendEmail, {
            to: recipient.email,
            subject: subject,
            type: args.type,
            data: {
                senderName,
                recipientName: recipient.name,
                relatedId: args.relatedId
            }
        });
    }
  }
});

const resolveUserImages = async (ctx: any, user: any) => {
    if (!user) return null;
    let avatarUrl = user.avatar;
    if (user.avatar && !user.avatar.startsWith("http") && !user.avatar.startsWith("/")) {
      try {
        const url = await ctx.storage.getUrl(user.avatar as Id<"_storage">);
        if (url) avatarUrl = url;
      } catch (e) {}
    }
    return { ...user, avatar: avatarUrl };
};

// Get notifications for current user
export const getNotifications = query({
    args: { userId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        // Authenticate (using our custom flow userId arg or Identity)
        // For robustness, allow passing userId if provided, otherwise assume auth context
        // Ideally we use identity, but per previous turns, we use client-side ID
        
        let targetId: Id<"users"> | undefined;
        
        if (args.userId) {
            targetId = args.userId as Id<"users">;
        } else {
             const identity = await ctx.auth.getUserIdentity();
             if (identity) {
                 const user = await ctx.db
                  .query("users")
                  .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
                  .first();
                 targetId = user?._id;
             }
        }

        if (!targetId) return [];

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_recipient", (q) => q.eq("recipientId", targetId))
            .order("desc") // Newest first
            .take(20);

        // Enrich with sender details
        return Promise.all(notifications.map(async (n) => {
            let sender = null;
            if (n.senderId) {
                const senderDoc = await ctx.db.get(n.senderId);
                sender = await resolveUserImages(ctx, senderDoc);
            }
            return {
                ...n,
                sender
            };
        }));
    },
});

// Mark all as read
export const markAllAsRead = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
       const unread = await ctx.db
         .query("notifications")
         .withIndex("by_recipient_unread", (q) => q.eq("recipientId", args.userId).eq("read", false))
         .collect();
       
       await Promise.all(unread.map(n => ctx.db.patch(n._id, { read: true })));
    }
});

// Mark messages as read
export const markMessagesAsRead = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
       const unread = await ctx.db
         .query("notifications")
         .withIndex("by_recipient_unread", (q) => q.eq("recipientId", args.userId).eq("read", false))
         .collect();
       
       const messageNotifications = unread.filter(n => n.type === "message");
       
       
       await Promise.all(messageNotifications.map(n => ctx.db.patch(n._id, { read: true })));
    }
});

// Mark messages specifically for a conversation as read
export const markConversationAsRead = mutation({
    args: { userId: v.id("users"), conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_recipient_unread", (q) => q.eq("recipientId", args.userId).eq("read", false))
            .collect();

        // Filter for messages related to this conversation
        const targetNotifications = unread.filter(n => n.type === "message" && n.relatedId === args.conversationId);

        await Promise.all(targetNotifications.map(n => ctx.db.patch(n._id, { read: true })));
    }
});

// Mock Trigger Notification (For Demo Purposes)
export const createMockNotification = mutation({
    args: {
        recipientId: v.id("users"),
        type: v.union(v.literal("upvote"), v.literal("message"), v.literal("comment"), v.literal("gift"), v.literal("upload")),
        senderId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("notifications", {
            recipientId: args.recipientId,
            senderId: args.senderId,
            type: args.type,
            read: false,
            createdAt: Date.now(),
            relatedId: "mock_id"
        });
    }
});
// Get unread message count
export const getUnreadMessageCount = query({
    args: { userId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        let targetId: Id<"users"> | undefined;
        
        if (args.userId) {
            targetId = args.userId as Id<"users">;
        } else {
             const identity = await ctx.auth.getUserIdentity();
             if (identity) {
                 const user = await ctx.db
                  .query("users")
                  .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
                  .first();
                 targetId = user?._id;
             }
        }

        if (!targetId) return 0;

        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_recipient_unread", (q) => q.eq("recipientId", targetId).eq("read", false))
            .collect();
            
        // Filter for type 'message' and count unique relatedIds (conversations)
        const messageNotifications = unread.filter(n => n.type === "message" && n.relatedId);
        const uniqueConversations = new Set(messageNotifications.map(n => n.relatedId));
        return uniqueConversations.size;
    },
});

export const getUnreadNotificationCount = query({
    args: { userId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        let targetId: Id<"users"> | undefined;
        if (args.userId) {
            targetId = args.userId as Id<"users">;
        } else {
             const identity = await ctx.auth.getUserIdentity();
             if (identity) {
                 const user = await ctx.db
                  .query("users")
                  .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
                  .first();
                 targetId = user?._id;
             }
        }

        if (!targetId) return 0;

        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_recipient_unread", (q) => q.eq("recipientId", targetId).eq("read", false))
            .collect();
            
        // Filter OUT 'message' (handled by message icon)
        // Also maybe filter out 'upload' if we don't want badges for that
        return unread.filter(n => n.type !== "message").length;
    },
});

export const markNotificationsAsRead = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
       const unread = await ctx.db
         .query("notifications")
         .withIndex("by_recipient_unread", (q) => q.eq("recipientId", args.userId).eq("read", false))
         .collect();
       
       // Mark everything EXCEPT messages as read.
       const generalNotifications = unread.filter(n => n.type !== "message");
       
       await Promise.all(generalNotifications.map(n => ctx.db.patch(n._id, { read: true })));
    }
});
