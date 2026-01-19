import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// Helper to resolve user images and sanitize
const resolveUser = async (ctx: any, user: any) => {
  if (!user) return null;
  let avatarUrl = user.avatar;
  if (user.avatar && !user.avatar.startsWith("http") && !user.avatar.startsWith("/")) {
    try {
      const url = await ctx.storage.getUrl(user.avatar as Id<"_storage">);
      if (url) avatarUrl = url;
    } catch (e) {}
  }
  
  // Sanitization: Only return fields needed for chat
  return { 
    _id: user._id,
    name: user.name,
    avatar: avatarUrl,
    role: user.role
  };
};

// Get messages for a conversation
export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return [];

    // SECURITY: Verify user is a participant
    if (!conversation.participants.includes(user._id)) {
      throw new Error("Unauthorized: You are not a participant in this conversation");
    }
    
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();

    // Enrich with sender info
    const senderIds = [...new Set(messages.map(m => m.senderId))];
    const senders = await Promise.all(senderIds.map(id => ctx.db.get(id)));
    // Resolve sender images
    const resolvedSenders = await Promise.all(senders.map(s => resolveUser(ctx, s)));
    const senderMap = new Map(resolvedSenders.map(s => [s?._id, s]));

    return Promise.all(messages.map(async (msg) => {
      let imageUrl = undefined;
      let attachmentUrl = undefined;
      
      if (msg.imageUrl) {
        imageUrl = await ctx.storage.getUrl(msg.imageUrl);
      }
      if (msg.attachmentUrl) {
        attachmentUrl = await ctx.storage.getUrl(msg.attachmentUrl);
      }

      return {
        ...msg,
        sender: senderMap.get(msg.senderId),
        imageUrl,
        attachmentUrl,
      };
    }));
  },
});

// Send a message
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    text: v.string(),
    imageUrl: v.optional(v.id("_storage")),
    attachmentUrl: v.optional(v.id("_storage")),
    attachmentName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");
    const senderId = user._id;

    const displayMessage = args.text || (args.imageUrl ? "Sent an image" : args.attachmentName ? `Sent: ${args.attachmentName}` : "New message");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");
    if (!conversation.participants.includes(senderId)) {
        throw new Error("Unauthorized: You are not a participant in this conversation");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: senderId,
      text: args.text,
      imageUrl: args.imageUrl,
      attachmentUrl: args.attachmentUrl,
      attachmentName: args.attachmentName,
      createdAt: Date.now(),
    });

    let typing = conversation.typing || {};
    if (typing[senderId]) {
      delete typing[senderId];
    }

    await ctx.db.patch(args.conversationId, {
      lastMessage: displayMessage,
      lastMessageAt: Date.now(),
      typing,
    });

    for (const participantId of conversation.participants) {
      if (participantId !== senderId) {
        await ctx.scheduler.runAfter(0, internal.notifications.triggerNotification, {
          recipientId: participantId,
          senderId: senderId,
          type: "message",
          relatedId: args.conversationId,
        });
      }
    }

    return messageId;
  },
});

export const setTypingStatus = mutation({
  args: {
    conversationId: v.id("conversations"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) return;
    const userId = user._id;

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return;

    if (!conversation.participants.includes(userId)) {
        throw new Error("Unauthorized");
    }

    let typing = conversation.typing || {};
    
    if (args.isTyping) {
      typing = { ...typing, [userId]: Date.now() };
    } else {
      const newTyping = { ...typing };
      delete newTyping[userId];
      typing = newTyping;
    }

    await ctx.db.patch(args.conversationId, { typing });
  },
});

// Get user's conversations
export const getConversations = query({
  args: {}, 
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) return [];
    const userId = user._id;

    // Use collect() for now since conversations are relatively few per user.
    // In a massive scale app, we would use a join table or better indexing.
    const allConversations = await ctx.db.query("conversations").collect();
    
    // Filter conversations where the user is a participant
    const userConversations = allConversations.filter((conv) =>
      conv.participants.includes(userId)
    );

    // Sort by lastMessageAt (newest first)
    userConversations.sort((a, b) => (b.lastMessageAt || b._creationTime) - (a.lastMessageAt || a._creationTime));

    // Get unread counts
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_unread", (q) => q.eq("recipientId", userId).eq("read", false))
      .collect();

    const unreadMap = new Map<string, number>();
    unreadNotifications.forEach(n => {
       if (n.type === "message" && n.relatedId) {
           const count = unreadMap.get(n.relatedId) || 0;
           unreadMap.set(n.relatedId, count + 1);
       }
    });

    // Enrich with participant info & unread count
    return Promise.all(
      userConversations.map(async (conv) => {
        const otherParticipantIds = conv.participants.filter(id => id !== userId);
        const otherParticipants = await Promise.all(
          otherParticipantIds.map((id) => ctx.db.get(id))
        );
        // Resolve images and sanitize participant info
        const resolvedOtherParticipants = await Promise.all(otherParticipants.map(p => resolveUser(ctx, p)));
        
        return { 
          ...conv, 
          otherParticipants: resolvedOtherParticipants.filter(p => p !== null),
          otherUser: resolvedOtherParticipants[0] || null,
          unreadCount: unreadMap.get(conv._id) || 0
        };
      })
    );
  },
});

// Get or Create conversation (idempotent)
export const getOrCreateConversation = mutation({
  args: {
    opponentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");
    const currentUserId = user._id;

    // Check if conversation exists
    const allConversations = await ctx.db.query("conversations").collect();
    const existing = allConversations.find(c => 
      c.participants.length === 2 && 
      c.participants.includes(currentUserId) && 
      c.participants.includes(args.opponentId)
    );

    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      participants: [currentUserId, args.opponentId],
      createdAt: Date.now(),
    });
  },
});

export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");
    if (message.senderId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.messageId, {
      text: args.text,
    });
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");

    const message = await ctx.db.get(args.messageId);
    if (!message) return;
    if (message.senderId !== user._id) throw new Error("Unauthorized");

    await ctx.db.delete(args.messageId);

    const lastMsg = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", message.conversationId))
        .order("desc")
        .first();

    await ctx.db.patch(message.conversationId, {
        lastMessage: lastMsg ? lastMsg.text : "",
        lastMessageAt: lastMsg ? lastMsg.createdAt : undefined,
    });
  },
});

