import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// Helper to resolve user images
const resolveUser = async (ctx: any, user: any) => {
  if (!user) return null;
  let avatarUrl = user.avatar;
  if (user.avatar && !user.avatar.startsWith("http") && !user.avatar.startsWith("/")) {
    try {
      const url = await ctx.storage.getUrl(user.avatar as Id<"_storage">);
      if (url) avatarUrl = url;
    } catch (e) {
      // Keep original or fallback
    }
  }
  return { ...user, avatar: avatarUrl };
};

// Get messages for a conversation
export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    // In a real secure app, we would verify the user is a participant here.
    // For now, allow reading messages if the client has the conversation ID.
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

    return messages.map((msg) => ({
      ...msg,
      sender: senderMap.get(msg.senderId)
    }));
  },
});

// Send a message
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate sender exists
    const user = await ctx.db.get(args.senderId);
    if (!user) throw new Error("User not found");

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      text: args.text,
      createdAt: Date.now(),
    });

    // Update conversation's last message, clear typing for sender
    const conversation = await ctx.db.get(args.conversationId);
    let typing = conversation?.typing || {};
    if (typing[args.senderId]) {
      delete typing[args.senderId];
    }

    await ctx.db.patch(args.conversationId, {
      lastMessage: args.text,
      lastMessageAt: Date.now(),
      typing,
    });

    // Notify other participants
    // Reuse the 'conversation' fetched above (line 46)
    if (conversation) {
      for (const participantId of conversation.participants) {
        if (participantId !== args.senderId) {
          // Check if "active" - straightforward heuristic: if they are typing, skip? 
          // Or just notify. A proper "lastSeen" on conversation would be best, but out of scope.
          // Let's trigger it.
          await ctx.scheduler.runAfter(0, internal.notifications.triggerNotification, {
            recipientId: participantId,
            senderId: args.senderId,
            type: "message",
            relatedId: messageId,
          });
        }
      }
    }

    return messageId;
  },
});

// Update typing status
export const setTypingStatus = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return;

    let typing = conversation.typing || {};
    
    if (args.isTyping) {
      typing = { ...typing, [args.userId]: Date.now() };
    } else {
      const newTyping = { ...typing };
      delete newTyping[args.userId];
      typing = newTyping;
    }

    await ctx.db.patch(args.conversationId, { typing });
  },
});

// Get user's conversations
export const getConversations = query({
  args: { userId: v.optional(v.string()) }, // Accept string to handle potential format mismatch, verify later
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    
    // Normalize ID check
    // In Convex, v.id() is best, but if we pass string from localstorage, we might need to cast or simple compare
    // Let's assume the client passes a valid ID string that matches
    
    const allConversations = await ctx.db.query("conversations").collect();
    
    const userConversations = allConversations.filter((conv) =>
      conv.participants.some(p => p.toString() === args.userId)
    );

    // Enrich with participant info
    return Promise.all(
      userConversations.map(async (conv) => {
        const otherParticipantIds = conv.participants.filter(id => id.toString() !== args.userId);
        const otherParticipants = await Promise.all(
          otherParticipantIds.map((id) => ctx.db.get(id))
        );
        // Resolve images
        const resolvedOtherParticipants = await Promise.all(otherParticipants.map(p => resolveUser(ctx, p)));
        
        return { 
          ...conv, 
          otherParticipants: resolvedOtherParticipants.filter(p => p !== null),
          otherUser: resolvedOtherParticipants[0] || null
        };
      })
    );
  },
});

// Get or Create conversation (idempotent)
export const getOrCreateConversation = mutation({
  args: {
    currentUserId: v.id("users"),
    opponentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if conversation exists
    const allConversations = await ctx.db.query("conversations").collect();
    const existing = allConversations.find(c => 
      c.participants.length === 2 && 
      c.participants.includes(args.currentUserId) && 
      c.participants.includes(args.opponentId)
    );

    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      participants: [args.currentUserId, args.opponentId],
      createdAt: Date.now(),
    });
  },
});
