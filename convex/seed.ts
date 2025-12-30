import { mutation } from "./_generated/server";

// Seed function to create initial test data
export const seedData = mutation({
  handler: async (ctx) => {
    // Create test users
    const studioId = await ctx.db.insert("users", {
      name: "Dirty Monkey Studios",
      email: "studio@dirtymonkey.com",
      avatar: "/images/avatar.png",
      bio: "We are an indie game studio focused on creating unique experiences.",
      location: "San Francisco, USA",
      locationFlag: "🇺🇸",
      role: "studio",
      socials: {
        tiktok: "DirtyMonkey",
        youtube: "DirtyMonkeyGames",
        twitter: "DirtyMonkeyDev",
        instagram: "dirtymonkeystudios",
        twitch: "DirtyMonkeyLive",
      },
      createdAt: Date.now(),
    });

    const creatorId = await ctx.db.insert("users", {
      name: "John Creator",
      email: "john@creator.com",
      avatar: "/images/avatar.png",
      bio: "3D Artist and Game Developer with 10+ years experience.",
      location: "Lagos, Nigeria",
      locationFlag: "🇳🇬",
      role: "creator",
      socials: {
        tiktok: "JohnCreator",
        youtube: "JohnCreatesGames",
        twitter: "JohnCreator",
        instagram: "johncreator",
        twitch: "JohnCreatorLive",
      },
      createdAt: Date.now(),
    });

    const playerId = await ctx.db.insert("users", {
      name: "Markcus900",
      email: "markcus@player.com",
      avatar: "/images/avatar.png",
      bio: "Gamer and content creator.",
      location: "New York, USA",
      locationFlag: "🇺🇸",
      role: "player",
      createdAt: Date.now(),
    });

    // Create test games
    const game1 = await ctx.db.insert("games", {
      title: "Unbroken",
      tagline: "A survival adventure like no other",
      description: "Lorem ipsum dolor sit amet consectetur. Urna faucibus tempus ultrices a aliquam in donec lacus velit. Amet nunc lacinia tortor id. Nulla sed nisl ut purus.",
      coverImage: "/images/Image1gun.png",
      studioId: studioId,
      creatorId: creatorId,
      upvotes: 174,
      upvotedBy: [],
      location: "Lagos, Nigeria",
      locationFlag: "🇳🇬",
      socials: {
        tiktok: "Manjalee",
        youtube: "Manjalee",
        twitter: "Manjalee",
        instagram: "Manjalee",
        twitch: "Manjalee",
      },
      featured: true,
      createdAt: Date.now(),
    });

    const game2 = await ctx.db.insert("games", {
      title: "Vodou",
      tagline: "Dark magic meets modern gaming",
      description: "An immersive experience into the world of Vodou magic and mystery.",
      coverImage: "/images/bazz adv.png",
      studioId: studioId,
      creatorId: creatorId,
      upvotes: 256,
      upvotedBy: [],
      featured: true,
      createdAt: Date.now(),
    });

    // Create a test conversation
    const conversationId = await ctx.db.insert("conversations", {
      participants: [playerId, creatorId],
      createdAt: Date.now(),
    });

    // Create test messages
    await ctx.db.insert("messages", {
      conversationId: conversationId,
      senderId: creatorId,
      text: "Hey! Thanks for checking out my game!",
      createdAt: Date.now() - 60000,
    });

    await ctx.db.insert("messages", {
      conversationId: conversationId,
      senderId: playerId,
      text: "It looks amazing! When will it be released?",
      createdAt: Date.now() - 30000,
    });

    await ctx.db.insert("messages", {
      conversationId: conversationId,
      senderId: creatorId,
      text: "We're aiming for Q2 2025. Stay tuned!",
      createdAt: Date.now(),
    });

    // Update conversation with last message
    await ctx.db.patch(conversationId, {
      lastMessage: "We're aiming for Q2 2025. Stay tuned!",
      lastMessageAt: Date.now(),
    });

    return {
      studioId,
      creatorId,
      playerId,
      game1,
      game2,
      conversationId,
    };
  },
});
